# Segurança

## Princípios

- Negar por defeito.
- Autorizar no backend em todas as operações protegidas.
- Tratar o browser, IDs, roles e payloads como não confiáveis.
- Minimizar dados, privilégios, duração de credenciais e superfície exposta.
- Não depender de Cloudflare para corrigir uma aplicação insegura; edge e origin aplicam controlos complementares.

## Modelo de ameaça resumido

Ativos principais: contas, sessões, dados de contacto, agenda, permissões administrativas, credenciais de infraestrutura e disponibilidade do serviço.

Ameaças consideradas:

- credential stuffing e brute force;
- roubo/fixação de sessão;
- CSRF, XSS e clickjacking;
- IDOR e escalada de privilégio;
- mass assignment de role/status;
- dupla reserva concorrente;
- enumeração de contas e reset tokens;
- abuso automatizado de booking e reset;
- injeção SQL e manipulação de filtros;
- fuga de secrets, tokens ou PII por logs/erros;
- bypass do CDN/WAF e spoofing de IP.

## Autenticação

- Palavra-passe mínima de 12 caracteres no registo, com maiúscula, minúscula e número.
- BCrypt com custo 12.
- Mensagem genérica em falha de login.
- Contador por identidade normalizada e hasheada em Redis: 8 falhas/15 minutos.
- Rate limit por origem em login: 5 pedidos/minuto.
- ID de sessão rodado após credenciais e novamente após MFA.
- Sessão standard de 30 minutos; sessão lembrada até 30 dias; máximo de cinco sessões.
- Sessões podem ser listadas e revogadas sem expor o session ID: a API devolve um handle SHA-256.
- Logout exige POST e CSRF.

### Cookies

| Cookie         | HttpOnly |          Secure | SameSite | Finalidade                                                  |
| -------------- | -------: | --------------: | -------- | ----------------------------------------------------------- |
| `LUME_SESSION` |      sim | sim em produção | Lax      | identificador opaco de sessão                               |
| `XSRF-TOKEN`   |      não | sim em produção | Lax      | double-submit/header CSRF; não é credencial de autenticação |

Nenhum token sensível é guardado em `localStorage` ou exposto a JavaScript.

## MFA administrativo

`ADMIN` e `SUPER_ADMIN` não concluem login sem TOTP. A base de dados contém uma constraint que impede roles administrativas sem MFA e segredo. O segredo TOTP é cifrado com AES-256-GCM e IV aleatório; a chave vem de um secret manager através de `MFA_ENCRYPTION_KEY`.

A conta inicial é criada apenas quando `BOOTSTRAP_ADMIN_ENABLED=true`, nunca promove contas existentes e deve ser desativada imediatamente depois.

## Recuperação de acesso

- Resposta sempre neutra para impedir enumeração.
- Token de 256 bits produzido por `SecureRandom`.
- Apenas SHA-256 do token é persistido.
- Validade de 20 minutos e uso único.
- Tokens anteriores são invalidados ao pedir um novo.
- Todas as sessões do utilizador são revogadas após alteração da palavra-passe.
- O token nunca é escrito em logs.

## Autorização e IDOR

- Spring Security aplica RBAC por rota e `@PreAuthorize` nos serviços administrativos.
- Registo não aceita `role`, `status`, `mfaEnabled` ou campos internos; JSON desconhecido é rejeitado.
- Consultas de cliente usam simultaneamente `appointmentId` e `userId` autenticado.
- Quando um recurso não pertence ao utilizador, a API devolve `404`, reduzindo enumeração.
- Endpoints administrativos carregam dados apenas depois da autorização do servidor.
- A UI administrativa não é uma fronteira de segurança.

## Validação e injeção

- Zod melhora feedback no browser; Bean Validation e regras de domínio são a autoridade.
- Duração, preço e disponibilidade são lidos da base de dados, nunca do payload.
- IDs são convertidos para UUID e rejeitados em caso de formato inválido.
- Notas são normalizadas em NFKC, limitadas e rejeitam control characters.
- JPA usa parâmetros; não há concatenação de input em SQL.
- Ordenação administrativa é uma escolha fechada, não um nome de coluna arbitrário.
- Entidades JPA nunca são serializadas pela API.

## Concorrência de marcações

A criação ocorre em transação, bloqueia a artista e verifica overlap. PostgreSQL aplica ainda uma exclusion constraint GiST sobre `professional_id` e `tstzrange(starts_at, ends_at)`. Esta constraint permanece correta com várias réplicas de API.

`Idempotency-Key` evita duplicação por retry. Reutilização por outro email é rejeitada sem revelar a reserva original.

## Proteções HTTP do frontend

- CSP por resposta com nonce para script inline.
- `script-src 'self' 'nonce-…'`; não é permitido `unsafe-inline` em scripts.
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`.
- HSTS de dois anos com subdomínios e preload em produção.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` como defesa legada adicional.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- Permissions Policy sem câmara, microfone ou geolocalização.
- COOP/CORP same-origin.

`style-src 'unsafe-inline'` permanece porque Framer Motion e React aplicam estilos inline. O risco é limitado por não existir HTML de utilizador e por scripts exigirem nonce. A remoção exige nonces de estilo suportados de ponta a ponta.

O único `dangerouslySetInnerHTML` contém JSON-LD gerado por constantes e escapa `<` para `\u003c`.

## Rate limiting

| Superfície          |    Limite origin |
| ------------------- | ---------------: |
| login               |     5/min/origem |
| registo             |    3/hora/origem |
| recuperação         |    3/hora/origem |
| criação de marcação | 10/10 min/origem |
| admin               |    60/min/origem |
| API geral           |   120/min/origem |

Os limites são aplicados por script Lua atómico em Redis. Em Cloudflare devem existir limites adicionais por IP, ASN, bot score e endpoint. O origin não deve confiar num `X-Forwarded-For` enviado diretamente pela Internet; restrinja rede aos ranges Cloudflare e configure trusted proxies.

## Erros, logs e observabilidade

A resposta pública tem código, mensagem, request ID, timestamp e erros de campo opcionais. Nunca contém stack trace, SQL, paths, credenciais ou topologia.

Logs são estruturados e incluem request ID. Não registar:

- passwords;
- session IDs ou cookies;
- CSRF/reset/TOTP tokens;
- headers `Authorization`;
- payloads completos de cliente;
- secrets de configuração.

Actuator expõe apenas health, info e Prometheus. Detalhes de health nunca são públicos.

## Secrets

Em produção, usar Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault ou equivalente. Montar secrets em runtime, com rotação e acesso por workload identity. Nunca usar `NEXT_PUBLIC_*` para secrets.

O Git ignora `.env`, chaves privadas, keystores e ficheiros de credenciais. `.env.example` contém apenas placeholders.

## Cloudflare

Configuração recomendada:

1. TLS Full (strict) com origin certificate e TLS 1.2+.
2. Authenticated Origin Pulls ou mTLS quando possível.
3. Firewall do origin apenas para ranges Cloudflare.
4. WAF managed rules + OWASP ruleset em modo gradual.
5. Cache apenas para `/_next/static/*` e imagens públicas; nunca cachear `/api/*`, auth, conta ou admin.
6. Regras específicas de rate limit iguais ou mais restritivas que as do origin.
7. Bot Management/challenge em registo, reset e booking anómalo.
8. Não alterar ou cachear respostas com `Set-Cookie`.
9. Preservar `X-Request-ID` ou gerar um Ray ID correlacionável.

## Checklist antes de produção

- [ ] `NEXT_PUBLIC_DEMO_MODE=false`
- [ ] HTTPS end-to-end e `COOKIE_SECURE=true`
- [ ] origins exatos em CORS
- [ ] API inacessível diretamente da Internet
- [ ] passwords e chaves geradas por secret manager
- [ ] bootstrap admin desativado
- [ ] MFA verificado em todas as contas administrativas
- [ ] Swagger desativado ou protegido
- [ ] PostgreSQL e Redis com TLS, backups e rede privada
- [ ] testes Testcontainers e E2E aprovados
- [ ] npm audit e OWASP Dependency-Check aprovados
- [ ] restauração de backup ensaiada
- [ ] alertas para erro, latência, saturação, auth failures e rate limits
- [ ] política de retenção e DPIA/RGPD revistas
- [ ] pentest antes de tratar dados reais

## Comunicação de vulnerabilidades

Não abra uma issue pública. Envie descrição, impacto e passos mínimos para `security@lumeatelier.pt`. Não inclua dados pessoais reais na prova de conceito.
