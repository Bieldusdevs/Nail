# API REST v1

## Convenções

- Base path: `/api/v1`
- JSON UTF-8
- Datas/hora de resposta: ISO 8601 em UTC
- Datas de agenda: `YYYY-MM-DD`, interpretadas em `Europe/Lisbon`
- Autenticação: sessão por cookie
- Mutations: `X-CSRF-TOKEN`
- Criação de marcação: `Idempotency-Key`
- Request correlation: `X-Request-ID`

A especificação gerada está em `/v3/api-docs`. Swagger UI está desativado por defeito e pode ser ativado apenas em ambiente local.

## CSRF e login

Todas as mutations, incluindo login, obtêm primeiro um token:

```http
GET /api/v1/auth/csrf
```

```json
{
  "token": "opaque-csrf-value"
}
```

Enviar o valor no header e manter os cookies:

```http
POST /api/v1/auth/login
Content-Type: application/json
X-CSRF-TOKEN: opaque-csrf-value

{
  "email": "cliente@example.pt",
  "password": "value-not-logged",
  "remember": false
}
```

Resposta de utilizador:

```json
{
  "status": "AUTHENTICATED",
  "user": {
    "id": "4ecf1eca-6d97-481a-af25-c431251fc954",
    "firstName": "Marta",
    "email": "cliente@example.pt",
    "roles": ["USER"]
  }
}
```

Resposta após credenciais administrativas válidas:

```json
{
  "status": "MFA_REQUIRED"
}
```

Concluir em `POST /api/v1/auth/mfa/verify` com `{ "code": "123456" }`.

## Erros

Formato público estável:

```json
{
  "error": "INVALID_REQUEST",
  "message": "Os dados enviados são inválidos.",
  "requestId": "0ff6ae9d-97ea-4f37-a3be-e7cb4f3f6cc8",
  "timestamp": "2026-09-04T12:00:00Z",
  "fieldErrors": [
    {
      "field": "email",
      "message": "must be a well-formed email address"
    }
  ]
}
```

Status usados:

- `200` leitura ou mutation com representação;
- `201` recurso criado;
- `202` pedido de reset aceite;
- `204` mutation sem corpo;
- `400` formato ou regra de input inválida;
- `401` sessão ausente/credenciais inválidas;
- `403` identidade sem permissão ou CSRF inválido;
- `404` recurso ausente ou não pertencente ao utilizador;
- `409` conflito/idempotência/slot ocupado;
- `429` rate limit, com `Retry-After`;
- `503` dependência crítica indisponível.

## Endpoints

### Identidade

| Método | Endpoint                       | Acesso      | Descrição                               |
| ------ | ------------------------------ | ----------- | --------------------------------------- |
| GET    | `/auth/csrf`                   | público     | cria/devolve token CSRF                 |
| POST   | `/auth/register`               | público     | cria conta `USER`                       |
| POST   | `/auth/login`                  | público     | valida credenciais e inicia sessão/MFA  |
| POST   | `/auth/mfa/verify`             | desafio     | conclui login administrativo            |
| POST   | `/auth/logout`                 | autenticado | invalida sessão atual                   |
| GET    | `/auth/session`                | autenticado | utilizador atual                        |
| GET    | `/auth/sessions`               | autenticado | sessões do próprio utilizador           |
| DELETE | `/auth/sessions/{handle}`      | autenticado | revoga outra sessão própria             |
| POST   | `/auth/password-reset/request` | público     | resposta neutra, envia email se existir |
| POST   | `/auth/password-reset/confirm` | token       | altera password e revoga sessões        |

O payload de registo aceita apenas `firstName`, `lastName`, `email`, `phone`, `password`, `confirmPassword` e `privacyAccepted`. Campos desconhecidos são rejeitados; não existe campo de role.

### Catálogo

| Método | Endpoint         | Acesso  |
| ------ | ---------------- | ------- |
| GET    | `/services`      | público |
| GET    | `/professionals` | público |

Exemplo de serviço:

```json
{
  "id": "b6712d0d-2104-4ab0-a851-878667a0ee01",
  "slug": "manicure-signature",
  "name": "Manicure Signature",
  "description": "Preparação cuidada, verniz gel e acabamento de alta precisão.",
  "durationMinutes": 60,
  "priceCents": 3200
}
```

### Disponibilidade

```http
GET /api/v1/availability?serviceId=b6712d0d-2104-4ab0-a851-878667a0ee01&professionalId=any&date=2026-09-10
```

```json
{
  "date": "2026-09-10",
  "slots": ["09:30:00", "10:00:00", "14:30:00"]
}
```

`professionalId=any` devolve um slot quando pelo menos uma artista habilitada está livre. A duração é obtida do serviço persistido.

### Marcações

#### Criar

```http
POST /api/v1/appointments
Idempotency-Key: 29ad20d1-9f30-40d3-a17b-59f71743ec85
X-CSRF-TOKEN: opaque-csrf-value
Content-Type: application/json

{
  "serviceId": "b6712d0d-2104-4ab0-a851-878667a0ee01",
  "professionalId": "any",
  "date": "2026-09-10",
  "startTime": "14:00",
  "firstName": "Marta",
  "lastName": "Silva",
  "email": "marta@example.pt",
  "phone": "+351912345678",
  "notes": "Sem remoção",
  "privacyAccepted": true
}
```

Resposta `201`:

```json
{
  "id": "6c5a4dd4-a7d0-40bd-8de8-a07d1a3b2101",
  "reference": "LM-6C5A4D",
  "status": "CONFIRMED",
  "startsAt": "2026-09-10T13:00:00Z",
  "endsAt": "2026-09-10T14:00:00Z",
  "service": {
    "id": "b6712d0d-2104-4ab0-a851-878667a0ee01",
    "name": "Manicure Signature",
    "priceCents": 3200
  },
  "professional": {
    "id": "a7712d0d-2104-4ab0-a851-878667a0aa01",
    "name": "Inês Martins"
  }
}
```

A mesma key e o mesmo email devolvem a marcação original. A mesma key com identidade diferente devolve `409`.

#### Cliente autenticado

| Método | Endpoint                       | Descrição                                         |
| ------ | ------------------------------ | ------------------------------------------------- |
| GET    | `/appointments?page=0&size=20` | lista apenas marcações próprias                   |
| DELETE | `/appointments/{id}`           | cancela apenas recurso próprio e dentro da janela |

Paginação:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

### Administração

`ADMIN` ou `SUPER_ADMIN`, com MFA concluído:

```http
GET /api/v1/admin/appointments?status=CONFIRMED&professionalId=<uuid>&from=2026-09-01T00:00:00Z&to=2026-10-01T00:00:00Z&page=0&size=20&direction=asc
```

- `status`: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`
- `size`: 1–100
- `direction`: `asc` ou `desc`
- o campo de ordenação é fixo em `startsAt`, evitando injeção de propriedades

## Cache

Catálogo público permite cache de cinco minutos no browser/CDN e dez minutos em Redis. Nunca cachear respostas de auth, marcações, conta ou admin. O frontend força `no-store` para dados pessoais.

## Compatibilidade

Mudanças incompatíveis exigem `/api/v2`. Em v1, campos novos podem ser adicionados, mas o servidor rejeita campos desconhecidos em requests para impedir mass assignment; clientes devem enviar apenas o contrato documentado.
