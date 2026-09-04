# Contribuir

## Princípios de engenharia

1. Segurança antes de conveniência.
2. Regras de negócio nos serviços/domínio, não nos controllers.
3. Componentes pequenos, nomes descritivos e TypeScript strict.
4. Sem `any`, secrets, dados pessoais de produção ou comentários óbvios.
5. Uma abstração só existe quando reduz complexidade real.
6. A validação do browser nunca substitui a validação do servidor.

## Preparação

```bash
cp .env.example .env
npm ci
cd apps/api && ./mvnw test
```

Use o Node indicado em `.nvmrc` e Java 21. Antes de cada envio, execute as validações web e API indicadas abaixo.

## Branches e commits

Use branches curtas a partir de `main`:

- `feat/booking-reschedule`
- `fix/prevent-overlapping-slots`
- `security/rotate-session-after-mfa`
- `perf/cache-service-catalog`

Conventional Commits:

```text
feat: add authenticated appointment history
fix: prevent unauthorized appointment cancellation
security: enforce mfa for administrative roles
perf: batch availability interval queries
refactor: extract booking summary component
```

Evite `update`, `final`, `fix stuff` ou commits que misturam várias intenções.

## Fluxo de alteração

1. Descrever comportamento e risco.
2. Criar ou atualizar teste que demonstre a regra.
3. Implementar no menor contexto adequado.
4. Rever autorização, validação, logging e concorrência.
5. Executar a suite local.
6. Atualizar documentação/contrato quando aplicável.
7. Abrir PR com evidência visual e plano de rollback.

## Qualidade web

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
NEXT_PUBLIC_DEMO_MODE=true npm run build
```

Requisitos:

- Server Component por defeito.
- `"use client"` apenas na fronteira interativa.
- Não importar GSAP ou bibliotecas pesadas globalmente sem necessidade.
- Formulários com Zod, React Hook Form, labels, erros associados e estado de loading.
- Foco visível, teclado completo e reduced motion.
- Testar 320, 375, 768, 1024, 1440 e 1920 px.
- Não adicionar dependência para resolver algo simples em CSS/DOM.

## Qualidade API

```bash
cd apps/api
./mvnw spotless:apply
./mvnw verify
```

Requisitos:

- Controller recebe, valida e delega.
- DTO por operação; nunca devolver entidade.
- Ownership/RBAC no serviço ou query, nunca por flag do frontend.
- Transação no caso de uso, não no controller.
- Query parametrizada.
- Erro público sem detalhe interno.
- Não registar payloads, tokens, passwords, cookies ou emails desnecessários.
- Toda operação concorrente precisa de invariantes também na base de dados quando possível.

## Testes

Pirâmide adotada:

- Vitest: schemas, utilitários e comportamento de componentes críticos.
- Playwright: fluxos reais e semântica acessível.
- JUnit/Mockito: regras de aplicação e segurança.
- ArchUnit: direção de dependências.
- Testcontainers: Flyway, PostgreSQL, Redis e filtros de segurança.

Um bug de autorização, booking ou autenticação deve receber um teste de regressão.

## Migrations

- Nunca editar uma migration aplicada.
- Adicionar `V<n>__descricao.sql`.
- Preferir roll-forward a down migrations destrutivas.
- Criar constraint/index de forma consciente para tabelas grandes.
- Não inserir passwords, tokens ou PII em seeds.
- Testar migration numa cópia anonimizada e medir lock time antes de produção.

## Dependências

Antes de adicionar:

- confirmar manutenção, licença e tamanho;
- verificar advisories e transitivas;
- justificar por que código nativo não basta;
- fixar versões compatíveis e rever atualizações regularmente.

Executar `npm audit --omit=dev` e o perfil Maven `security-scan` quando existir `NVD_API_KEY`.

## Pull request

O PR só está pronto quando:

- validações locais aprovadas;
- sem secrets no diff/histórico;
- autorização e validação revistas;
- screenshots desktop/mobile para UI;
- contrato e docs atualizados;
- migration avaliada;
- observabilidade suficiente;
- reviewer diferente do autor aprova alterações críticas.

Alterações a auth, roles, MFA, sessão, pagamento futuro ou migrations críticas exigem dois reviewers e deploy gradual.

## Vulnerabilidades

Não crie issue pública. Siga o canal descrito em [SECURITY.md](SECURITY.md).
