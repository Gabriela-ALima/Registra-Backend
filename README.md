# Registra+ — API (Back-end do TCC I)

API REST para gestão de associados em pequenas entidades e associações: cadastro de associados, termo de aceite, eventos com confirmação de presença, serviços e reservas, financeiro (mensalidades) e dashboard.

## Sumário

- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Como rodar](#como-rodar)
- [Contas de teste](#contas-de-teste)
- [Como autenticar no Swagger](#como-autenticar-no-swagger)
- [Perfis e permissões](#perfis-e-permissões)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Endpoints e corpos das requisições](#endpoints-e-corpos-das-requisições)
- [Regras de negócio](#regras-de-negócio)
- [Códigos de resposta](#códigos-de-resposta)
- [Erros comuns](#erros-comuns)
- [Scripts](#scripts)

## Tecnologias

- Node.js e TypeScript
- NestJS 11
- TypeORM e PostgreSQL
- JWT (`@nestjs/jwt` e `passport-jwt`) para autenticação
- `bcrypt` para criptografar senhas
- `class-validator` e `class-transformer` para validação dos dados
- Swagger (`@nestjs/swagger`) para documentar a API
- `pdfkit` para o boleto demonstrativo em PDF

## Requisitos

- Node.js 20 ou superior
- npm
- PostgreSQL instalado e em execução

## Como rodar

**1. Clonar o repositório e instalar as dependências**

```bash
git clone <url-do-repositorio>
cd registra-mais
npm install
```

**2. Criar o banco de dados**

No `psql` (SQL Shell), ou em uma ferramenta como o pgAdmin:

```sql
CREATE DATABASE registra_plus;
```

**3. Configurar as variáveis de ambiente**

Copie o arquivo `.env.example` para `.env` e preencha os valores:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_NAME=registra_plus

JWT_SECRET=uma_chave_longa_e_aleatoria
JWT_EXPIRES_IN=3600
```

- `JWT_SECRET` é a chave que assina os tokens. Quem a conhece consegue fabricar tokens válidos, então use uma chave longa e **nunca** envie o `.env` para o repositório. Para gerar uma:

  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```

- `JWT_EXPIRES_IN` é a validade do token em **segundos** (`3600` = 1 hora).
- A porta da API é `4000`, e pode ser trocada com a variável `PORT`.

**4. Iniciar o servidor**

```bash
npm run start:dev
```

Na primeira execução:

- As tabelas são criadas automaticamente no banco (o TypeORM está com `synchronize: true`, adequado para desenvolvimento).
- O **termo de aceite versão 1.0** é criado, se ainda não existir nenhum termo.
- As **contas de teste** (abaixo) são criadas, se não existirem. Esse seed fica desligado quando `NODE_ENV=production`.

**5. Abrir a documentação**

- Swagger: <http://localhost:4000/swagger>
- JSON da documentação: <http://localhost:4000/swagger-json>

## Contas de teste

| Perfil | E-mail | Senha |
|---|---|---|
| COLABORADOR | `colaborador@registra.com` | `Colab@123` |
| ASSOCIADO | `associado@registra.com` | `Assoc@123` |

A conta de associado está ligada ao cadastro de **Maria Souza** (CPF `52998224725`). Essas contas servem só para testes e desenvolvimento.

## Como autenticar no Swagger

1. Abra `POST /auth/login`, clique em **Try it out**, informe o e-mail e a senha de uma conta e clique em **Execute**.
2. Copie o valor de `accessToken` da resposta.
3. Clique no botão **Authorize** (cadeado, no topo da página), cole o token **sem** a palavra `Bearer` e confirme.
4. As rotas com cadeado passam a funcionar. Para trocar de usuário, clique em **Logout** no mesmo cadeado, faça um novo login e autorize com o novo token.

Fora do Swagger, o token vai no cabeçalho de cada requisição:

```
Authorization: Bearer <accessToken>
```

## Perfis e permissões

Existem dois perfis, e a verificação acontece no **servidor**:

| Ação | COLABORADOR | ASSOCIADO | Sem login |
|---|:---:|:---:|:---:|
| Cadastrar-se (`POST /associados`) | | | ✅ |
| Fazer login | | | ✅ |
| Ver e editar o **próprio** cadastro | | ✅ | |
| Listar, pesquisar, buscar, editar, ativar e desativar associados | ✅ | | |
| Excluir associado | ✅ | | |
| Consultar o termo vigente | ✅ | ✅ | |
| Aceitar o termo | | ✅ | |
| Consultar eventos | ✅ | ✅ | |
| Criar, editar e excluir eventos | ✅ | | |
| Confirmar e cancelar a **própria** presença | | ✅ | |
| Ver participantes confirmados de um evento | ✅ | | |
| Dashboard | ✅ (indicadores gerais) | ✅ (resumo próprio) | |

A regra fundamental do sistema: o associado **nunca** acessa, altera ou exclui dados de outro associado. O id do associado vem sempre do **token**, e não da URL nem do corpo da requisição.

## Estrutura do projeto

```
src/
├── main.ts                 # inicialização, ValidationPipe e Swagger
├── app.module.ts           # módulo raiz e conexão com o banco
├── common/
│   ├── decorators/         # @Perfis, @Publico, @UsuarioAtual
│   ├── enums/              # perfis e situações
│   └── guards/             # JwtAuthGuard e PerfisGuard
├── auth/                   # login e estratégia JWT
├── usuario/                # contas de acesso e seed das contas de teste
├── associado/              # cadastro e gestão de associados
├── termo-aceite/           # termo e registro do aceite
├── evento/                 # eventos
├── inscricao-evento/       # confirmação de presença
├── reservas/
│   ├── servicos/           # serviços e espaços
│   └── reservas/           # reservas
├── financeiro/             # mensalidades e boleto demonstrativo
└── dashboard/              # indicadores
```

Cada módulo segue o padrão do NestJS: `entities`, `dto`, `services`, `controllers` e o arquivo `.module.ts`.

## Endpoints e corpos das requisições

Rotas sem cadeado no Swagger são públicas. Todas as demais exigem token.

### Autenticação

| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth/login` | Público |
| GET | `/auth/perfil` | Logado |

**`POST /auth/login`**

```json
{
  "email": "colaborador@registra.com",
  "senha": "Colab@123"
}
```

Resposta (200):

```json
{
  "accessToken": "eyJhbGciOi...",
  "usuario": {
    "id": 1,
    "email": "colaborador@registra.com",
    "perfil": "COLABORADOR",
    "associadoId": null
  }
}
```

Credenciais erradas, e-mail inexistente e conta desativada devolvem o mesmo **401**, para não revelar quais e-mails têm conta.

### Associados

| Método | Rota | Acesso |
|---|---|---|
| POST | `/associados` | Público (cadastro) |
| GET | `/associados/meu-cadastro` | Associado |
| PATCH | `/associados/meu-cadastro` | Associado |
| GET | `/associados` | Colaborador |
| GET | `/associados/pesquisar?termo=` | Colaborador |
| GET | `/associados/cpf/{cpf}` | Colaborador |
| GET | `/associados/{id}` | Colaborador |
| PATCH | `/associados/{id}` | Colaborador |
| PATCH | `/associados/{id}/ativar` | Colaborador |
| PATCH | `/associados/{id}/desativar` | Colaborador |
| DELETE | `/associados/{id}` | Colaborador |

**`POST /associados`** (cadastro; cria o associado e a conta de acesso juntos)

```json
{
  "nomeCompleto": "Ana Beatriz Ramos",
  "cpf": "168.995.350-09",
  "email": "ana.ramos@email.com",
  "telefone": "51988776655",
  "dataNascimento": "1995-08-12",
  "endereco": "Rua das Acácias, 320",
  "cidade": "Charqueadas",
  "estado": "RS",
  "senha": "Senha123"
}
```

- Resposta **201**: o associado, com `situacao: "ATIVO"` e `cadastroConcluido: false`. A senha não volta na resposta.
- `telefone` é opcional. O `cpf` aceita com ou sem pontos e traço e é salvo só com os 11 dígitos. O `estado` é convertido para maiúsculas.
- O `email` é também o **login** da conta. Depois do cadastro, faça `POST /auth/login`.
- `senha`: de 8 a 72 caracteres, com letras e números.
- **409** se o CPF ou o e-mail já estiverem cadastrados.

**`PATCH /associados/meu-cadastro`** e **`PATCH /associados/{id}`** (enviar só os campos que mudam)

```json
{
  "telefone": "51988887777",
  "cidade": "Porto Alegre"
}
```

A edição não aceita senha. **`GET /associados/pesquisar?termo=maria`** procura no nome e no CPF, sem diferenciar maiúsculas de minúsculas.

### Termo de aceite

| Método | Rota | Acesso |
|---|---|---|
| GET | `/termos/vigente` | Associado e colaborador |
| POST | `/termos/aceite` | Associado |

**`POST /termos/aceite`**

```json
{
  "versao": "1.0"
}
```

- Registra o aceite com a data e a hora e marca o `cadastroConcluido` do associado como `true`.
- Use a `versao` devolvida por `GET /termos/vigente`.
- **409** se a versão não for a vigente ou se o termo já foi aceito.

Fluxo típico: cadastro → login → `GET /termos/vigente` (o front mostra o texto e a caixa "li e concordo") → `POST /termos/aceite`.

### Eventos

| Método | Rota | Acesso |
|---|---|---|
| POST | `/eventos` | Colaborador |
| GET | `/eventos` | Colaborador e associado |
| GET | `/eventos/{id}` | Colaborador e associado |
| PATCH | `/eventos/{id}` | Colaborador |
| DELETE | `/eventos/{id}` | Colaborador |

**`POST /eventos`**

```json
{
  "titulo": "Assembleia geral",
  "descricao": "Prestação de contas e eleição da nova diretoria",
  "data": "2026-12-20",
  "horario": "19:30",
  "local": "Salão principal da sede",
  "capacidadeMaxima": 80
}
```

- `descricao` e `capacidadeMaxima` são opcionais. Sem `capacidadeMaxima`, o evento não tem limite de participantes.
- `data` no formato `AAAA-MM-DD`, `horario` no formato `HH:mm`.
- O evento nasce com `situacao: "ATIVO"`.

**`PATCH /eventos/{id}`** (campos opcionais; a situação é alterada por aqui)

```json
{
  "situacao": "CANCELADO"
}
```

Situações possíveis: `ATIVO`, `CANCELADO` e `ENCERRADO`.

### Confirmação de presença

| Método | Rota | Acesso |
|---|---|---|
| POST | `/eventos/{id}/presenca` | Associado |
| DELETE | `/eventos/{id}/presenca` | Associado |
| GET | `/inscricoes/minhas` | Associado |
| GET | `/eventos/{id}/participantes` | Colaborador |

Essas rotas **não têm corpo**: o evento vem da URL, e o associado vem do token.

- `POST` confirma a presença (**201**). Responde **409** se já estiver confirmada, se o evento estiver lotado ou se não estiver `ATIVO`.
- `DELETE` cancela a confirmação (**200**). O registro é mantido com a situação `CANCELADA`, e a pessoa pode confirmar de novo depois.
- `GET /inscricoes/minhas` lista os eventos em que o associado confirmou presença.
- `GET /eventos/{id}/participantes` lista os participantes confirmados, em ordem alfabética.

### Serviços, reservas e financeiro

> **A completar:** endpoints e corpos de requisição dos módulos de serviços, reservas e financeiro (mensalidades, pagamento manual e PDF do boleto demonstrativo). O Swagger lista todas as rotas desses módulos em <http://localhost:4000/swagger>.

### Dashboard

| Método | Rota | Acesso |
|---|---|---|
| GET | `/dashboard` | Colaborador e associado (a resposta depende do perfil) |
| GET | `/dashboard/indicadores` | Colaborador |
| GET | `/dashboard/meu-resumo` | Associado |

- **Colaborador:** associados (total, ativos e inativos), eventos, reservas e situação das mensalidades.
- **Associado:** próximos eventos em que confirmou presença, próximas reservas, mensalidade atual e histórico de mensalidades.

## Regras de negócio

- O **CPF** é único. O **e-mail** de login também.
- O cadastro do associado só é considerado **concluído** depois do aceite do termo.
- O aceite guarda o associado, a **versão** do termo e a **data e hora**. Cada associado aceita uma versão uma única vez.
- O associado **não confirma presença duas vezes** no mesmo evento. A capacidade máxima, quando definida, é respeitada, e a confirmação só vale para eventos `ATIVO`.
- A conta de acesso desativada não consegue fazer login, e o token de uma conta desativada deixa de funcionar na hora.
- Reservas: a disponibilidade é verificada antes da criação, e não pode haver conflito de horário no mesmo espaço.
- Mensalidades: existe uma cobrança por associado e mês de referência, e o boleto em PDF é **demonstrativo**, sem validade para pagamento.

## Códigos de resposta

| Código | Quando acontece |
|---|---|
| 200 / 201 / 204 | Sucesso (consulta ou edição / criação / exclusão sem corpo) |
| 400 | Dados inválidos. A resposta lista o que está errado |
| 401 | Sem token, token inválido ou vencido, ou login incorreto |
| 403 | Logado, mas o perfil não tem permissão para a rota |
| 404 | Registro não encontrado |
| 409 | Conflito: CPF ou e-mail repetido, presença já confirmada, evento lotado, termo já aceito |

## Erros comuns

- **`Unexpected token ... is not valid JSON`**: o corpo da requisição está mal formado. Textos precisam estar entre aspas duplas, com vírgula entre os campos e sem vírgula depois do último.
- **401 em uma rota com cadeado**: faltou clicar em **Authorize** ou o token venceu. Faça login de novo.
- **403**: o perfil logado não tem permissão para a rota (por exemplo, associado em uma rota de colaborador).
- **O Swagger não mostra uma rota nova**: confira que o terminal mostra `Found 0 errors` e atualize a página com `Ctrl+F5`.
- **O servidor não sobe e cita `JWT_SECRET`**: a variável está faltando no `.env`. Reinicie o servidor depois de editá-lo.
- **O servidor não conecta no banco**: confira o `DB_*` do `.env` e se o PostgreSQL está rodando e o banco `registra_plus` existe.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run start:dev` | Inicia em modo desenvolvimento, recompilando a cada alteração |
| `npm run build` | Compila o projeto para a pasta `dist` |
| `npm run start:prod` | Executa a versão compilada |
| `npm run format` | Formata o código com o Prettier |
| `npm run lint` | Verifica o código com o ESLint |