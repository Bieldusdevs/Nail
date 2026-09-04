# Arquitetura

## Objetivos

A arquitetura privilegia, por ordem: segurança, correção, manutenção, performance, acessibilidade, escalabilidade e qualidade visual. O sistema é um monorepo com aplicações implantáveis de forma independente e um contrato REST versionado.

## Contexto de sistema

```text
Browser
  │ HTTPS, same origin
  ▼
Cloudflare
  ├── DNS e TLS
  ├── CDN para assets imutáveis
  ├── WAF / Bot Management
  └── rate limiting de edge
  │
  ▼
Next.js
  ├── Server Components e páginas públicas
  ├── bundles cliente por feature
  └── proxy /api/v1/*
  │ rede privada
  ▼
Spring Boot API
  ├── PostgreSQL: fonte de verdade
  ├── Redis: sessão, cache, rate limit e dados efémeros
  └── SMTP: notificações
```

Em produção, apenas Cloudflare alcança o origin e apenas Next.js alcança a API. Regras de firewall devem impedir acesso direto aos origins.

## Frontend

### Limites

- `app/`: routing, metadata, layouts e composição de páginas.
- `components/ui/`: primitivas acessíveis e sem conhecimento de domínio.
- `components/layout/`: header, menu, footer, smooth scroll e transições.
- `components/sections/`: blocos editoriais da homepage.
- `features/`: fluxos de negócio isolados — booking, auth, account e admin.
- `services/`: contrato HTTP e adaptadores de API.
- `schemas/`: validação Zod junto da fronteira de entrada.
- `types/`: tipos partilhados entre features.
- `config/`: conteúdo e configuração pública.

### Renderização e performance

Páginas e secções são Server Components por defeito. Apenas interações, formulários e animação recebem `"use client"`. GSAP/ScrollTrigger é importado dinamicamente apenas na homepage; não entra no bundle de autenticação ou conta. Framer Motion gere menu, passos e transições pequenas. Lenis é carregado no shell e não é inicializado com `prefers-reduced-motion`.

As imagens são locais e passam pelo otimizador Next.js em AVIF/WebP. Não existem fontes, scripts, folhas de estilo ou imagens externas no caminho crítico.

A CSP com nonce obriga renderização dinâmica. É uma decisão deliberada de segurança; conteúdo público pesado pode, numa evolução, ser servido por uma camada de cache que preserve nonce por resposta.

### Modo demonstração

`NEXT_PUBLIC_DEMO_MODE=true` seleciona adaptadores efémeros para revisão da UI. O modo é explícito, não contém bypass no backend e deve ser rejeitado pela configuração de produção. Com o valor `false`, booking, conta, auth e admin usam `/api/v1`.

## Backend

### Regra de dependência

```text
presentation → application → domain
infrastructure ──────────────→ domain/application ports
security/config ─────────────→ application/domain
```

- `domain`: entidades, invariantes e portas de repositório.
- `application`: casos de uso, DTOs e portas de notificação.
- `infrastructure`: JPA, SMTP e bootstrap operacional.
- `presentation`: controllers pequenos e exception handler.
- `security`: principal, CSRF, MFA, rate limiting e handlers REST.
- `shared`: erros e concerns HTTP transversais.

As entidades têm anotações JPA como compromisso pragmático. Não são devolvidas pelos controllers e nunca atravessam a fronteira pública.

### Contextos de negócio

1. **Catálogo**: serviços e artistas ativos.
2. **Disponibilidade**: slots derivados da duração persistida, horário do atelier e intervalos ocupados.
3. **Marcações**: criação idempotente, propriedade, cancelamento e administração.
4. **Identidade**: registo, login, MFA, sessão e recuperação.
5. **Operações**: observabilidade, catálogo em cache e auditoria preparada.

## Fluxo de marcação

```text
1. GET /services
2. GET /professionals
3. GET /availability?serviceId&professionalId&date
4. GET /auth/csrf
5. POST /appointments + Idempotency-Key + X-CSRF-TOKEN
6. API valida novamente todos os campos
7. Serviço carrega preço/duração da base de dados
8. Transação bloqueia a artista selecionada
9. Verificação de overlap
10. INSERT protegido por EXCLUDE USING GIST
11. Commit
12. Notificação assíncrona
```

A constraint PostgreSQL é a última linha de defesa contra duas instâncias da API a reservar o mesmo intervalo. O lock reduz conflitos; a constraint garante correção.

## Autenticação e sessão

```text
GET /auth/csrf
POST /auth/login
  ├── credenciais inválidas → contador Redis + resposta genérica
  ├── USER → roda session ID e autentica
  └── ADMIN/SUPER_ADMIN → sessão pendente 5 min
                              ↓
                       POST /auth/mfa/verify
                              ↓
                       roda session ID e autentica
```

A sessão é guardada em Redis e o browser recebe apenas um identificador opaco em cookie. Não há access token ou refresh token no browser. A atividade renova a validade de uma sessão servidor; revogação elimina-a centralmente.

## Dados e consistência

- UUIDs são gerados pela aplicação.
- Foreign keys usam `RESTRICT`, `SET NULL` ou `CASCADE` de acordo com o ciclo de vida.
- `@Version` impede lost updates em agregados mutáveis.
- Datas persistem em UTC (`TIMESTAMPTZ`/`Instant`); regras de agenda usam `Europe/Lisbon`.
- Flyway é a única autoridade para schema.
- Hibernate executa com `ddl-auto=validate` e Open Session in View desativado.
- HikariCP tem limites e timeouts explícitos.
- Pesquisa administrativa usa filtros parametrizados e ordenação permitida por enum/direção, nunca nomes arbitrários de coluna.

## Redis

Redis não é fonte de verdade. É usado para:

- Spring Session e índice por principal;
- rate limiting atómico com script Lua;
- contagem de falhas de login;
- cache curto do catálogo.

Operações sensíveis falham fechadas se Redis estiver indisponível. Leitura pública geral pode falhar aberta apenas no filtro de rate limiting; os dados continuam em PostgreSQL.

## Escalabilidade

API e Next.js não mantêm estado de utilizador em memória e podem escalar horizontalmente. Redis centraliza sessões e limites; PostgreSQL protege invariantes concorrentes. Assets recebem hash e podem ser servidos por CDN.

Próximas evoluções naturais:

- outbox transacional para email;
- read replica para relatórios;
- fila para notificações e lembretes;
- OpenTelemetry Collector;
- particionamento/arquivamento de auditoria;
- disponibilidade pré-calculada apenas quando o volume justificar.

## Decisões visuais

O documento de design privilegia fotografia editorial e exclui 3D. Por isso:

- GSAP é usado para reveal, parallax e galeria horizontal controlada por scroll;
- Framer Motion é usado apenas em transições e microinterações;
- CSS trata hover, underline, loading e feedback simples;
- Three.js/R3F/Drei não são dependências;
- cards e imagens mantêm cantos retos; apenas controlos são pills;
- toda animação respeita reduced motion.
