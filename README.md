# Lume Atelier

Aplicação full-stack para marcação de serviços de unhas, construída como um produto de produção e não como um protótipo visual. Inclui experiência editorial pública, fluxo completo de marcação, conta de cliente, recuperação de acesso, controlo de sessões e área administrativa.

## Destaques

- Homepage premium baseada no sistema visual fornecido: canvas `#fffef7`, tipografia leve, fotografia editorial, cards sem raio e cor usada com contenção.
- Marcação em quatro passos: serviço, artista, data/hora e contacto.
- Disponibilidade calculada no servidor a partir do serviço e ocupação real; o cliente nunca define duração ou preço.
- Reservas idempotentes e protegidas contra dupla ocupação concorrente por lock transacional e constraint de exclusão PostgreSQL.
- Sessões Redis com cookie `HttpOnly`, `Secure` e `SameSite=Lax`; sem tokens sensíveis em `localStorage`.
- CSRF por cookie-to-header, rotação de ID de sessão, limite de sessões e revogação por dispositivo.
- RBAC `USER`, `ADMIN` e `SUPER_ADMIN`, sempre validado no backend.
- MFA TOTP obrigatório para perfis administrativos, com segredo cifrado em AES-256-GCM.
- Recuperação de palavra-passe com token aleatório, hash SHA-256 em base de dados, uso único e validade de 20 minutos.
- Rate limiting em Redis, respostas públicas normalizadas e request IDs.
- CSP com nonce, HSTS, proteção de framing, políticas de permissões e headers defensivos.
- Flyway, OpenAPI, Actuator, Prometheus, logs estruturados, Testcontainers, Playwright, Vitest e ArchUnit.

## Stack

### Web

Next.js 16, React 19, TypeScript strict, Tailwind CSS 4, componentes ao estilo shadcn/Radix, Zod, React Hook Form, Framer Motion, GSAP/ScrollTrigger e Lenis.

Three.js não foi incluído: o guia visual pede fotografia editorial e ausência de 3D. Esta decisão evita cerca de centenas de KB de JavaScript sem benefício para o produto.

### API

Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA/Hibernate, Spring Session Redis, PostgreSQL, Redis, Flyway, springdoc/OpenAPI, Actuator e Micrometer Prometheus.

## Arquitetura

```text
Utilizador
   ↓
Cloudflare DNS / TLS / CDN / WAF / Rate Limiting
   ↓
Next.js  ── /api/v1/* same-origin proxy ──→  Spring Boot
                                                ├── PostgreSQL
                                                ├── Redis
                                                └── SMTP
```

O browser comunica apenas com a origem Next.js. A API não precisa de estar exposta diretamente à Internet em produção. Consulte [ARCHITECTURE.md](ARCHITECTURE.md) e [SECURITY.md](SECURITY.md).

## Estrutura

```text
lume/
├── apps/
│   ├── web/
│   │   ├── public/images/
│   │   └── src/
│   │       ├── app/
│   │       ├── animations/
│   │       ├── components/
│   │       ├── config/
│   │       ├── features/
│   │       ├── hooks/
│   │       ├── lib/
│   │       ├── schemas/
│   │       ├── services/
│   │       └── types/
│   └── api/
│       └── src/main/
│           ├── java/pt/lume/atelier/
│           │   ├── application/
│           │   ├── config/
│           │   ├── domain/
│           │   ├── infrastructure/
│           │   ├── presentation/
│           │   ├── security/
│           │   └── shared/
│           └── resources/db/migration/
├── docker-compose.yml
└── .env.example
```

## Pré-requisitos

- Node.js 22.19+
- npm 10+
- Java 21
- Docker com Compose para PostgreSQL, Redis e Mailpit

## Arranque rápido da experiência visual

O modo demonstração executa o fluxo no browser apenas para revisão visual. Não contém autenticação real nem deve ser usado em produção.

```bash
npm ci
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

Abrir `http://localhost:3000`.

## Arranque full-stack local

1. Criar o ficheiro local de ambiente:

```bash
cp .env.example .env
```

2. Substituir todos os placeholders por valores aleatórios locais. Gerar a chave MFA:

```bash
openssl rand -base64 32
```

3. Iniciar infraestrutura e aplicações:

```bash
docker compose --profile app up --build
```

Serviços locais:

- Web: `http://localhost:3000`
- API: `http://localhost:8080`
- Swagger, apenas local: `http://localhost:8080/swagger-ui`
- Mailpit: `http://localhost:8025`

Também é possível iniciar apenas a infraestrutura:

```bash
docker compose up postgres redis mailpit
cd apps/api
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

Noutro terminal:

```bash
API_INTERNAL_URL=http://localhost:8080 NEXT_PUBLIC_DEMO_MODE=false npm run dev
```

## Administrador inicial

A criação inicial é explícita e desativada por defeito. Defina temporariamente:

```dotenv
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=<valor-forte-de-secret-manager>
BOOTSTRAP_ADMIN_TOTP_SECRET=<segredo-base32-do-autenticador>
BOOTSTRAP_ADMIN_PHONE=<numero-portugues>
```

Inicie a API uma vez, confirme o evento de bootstrap e volte imediatamente `BOOTSTRAP_ADMIN_ENABLED=false`. Uma conta existente nunca é promovida automaticamente.

## Comandos de qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build

cd apps/api
./mvnw test
./mvnw spotless:check
./mvnw verify
```

Os testes de integração PostgreSQL/Redis usam Testcontainers e são executados quando Docker está disponível.

## Deploy na Vercel

O ficheiro `vercel.json` configura automaticamente o monorepo. Na Vercel, mantém a **Root Directory** na raiz do repositório e deixa os comandos definidos pelo projeto. Para publicar apenas a demonstração visual, adiciona `NEXT_PUBLIC_DEMO_MODE=true` em Settings → Environment Variables e faz Redeploy.

## Variáveis de ambiente

A referência completa está em [.env.example](.env.example). Regras:

- Apenas variáveis `NEXT_PUBLIC_*` podem ser enviadas ao browser.
- `NEXT_PUBLIC_DEMO_MODE` tem de ser `false` em produção.
- `DATABASE_PASSWORD`, `REDIS_PASSWORD`, credenciais SMTP, chave MFA e dados de bootstrap vêm de um secret manager.
- O repositório ignora `.env`, chaves privadas, keystores e ficheiros de credenciais.

## Documentação

- [ARCHITECTURE.md](ARCHITECTURE.md) — limites, camadas, fluxos e escalabilidade
- [SECURITY.md](SECURITY.md) — modelo de ameaça e hardening
- [API.md](API.md) — contrato REST v1
- [CONTRIBUTING.md](CONTRIBUTING.md) — processo de desenvolvimento

## Estado da entrega

Lint, typecheck, testes unitários, E2E, build Next.js e `mvn verify` terminam sem erros. Os testes Testcontainers são executados automaticamente quando Docker está disponível.

As fotografias editoriais incluídas foram criadas especificamente para esta demonstração. Antes de lançamento comercial, a informação legal, textos de consentimento e política de cancelamento devem ser validados por assessoria jurídica em Portugal.
