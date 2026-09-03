# Pandinha Finances

Controle financeiro pessoal multiusuário: cada pessoa registra receitas e despesas, gerencia suas próprias categorias e formas de pagamento, e acompanha resumos gráficos por mês e por categoria.

## Stack

| Camada    | Tecnologia                                     |
| --------- | ---------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)             |
| UI        | React 19 + shadcn/ui + Tailwind CSS 4          |
| Gráficos  | Recharts (via `components/ui/chart`)           |
| ORM       | Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Banco     | PostgreSQL                                     |
| Sessão    | JWT assinado (`jose`) em cookie `httpOnly`     |
| Senhas    | bcrypt (`bcryptjs`, custo 12)                  |
| Validação | Zod 4 + React Hook Form                        |

## Como rodar

### 1. Subir o banco

```bash
docker compose up -d
```

> O container publica em **5433** (e não na 5432) de propósito: a porta padrão costuma já estar ocupada por outro Postgres na máquina. Se a 5433 também estiver em uso, troque o lado esquerdo do mapeamento em `docker-compose.yml` e o `DATABASE_URL` de forma correspondente.
>
> Se `docker` pedir permissão, adicione seu usuário ao grupo: `sudo usermod -aG docker $USER` e reabra a sessão. Alternativa: aponte `DATABASE_URL` para qualquer PostgreSQL que você já tenha.

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```env
DATABASE_URL="postgresql://pandinha:pandinha@localhost:5433/pandinha?schema=public"
SESSION_SECRET="uma-chave-aleatoria-com-32-caracteres-ou-mais"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
APP_URL=""
```

> `APP_URL` só é necessário em produção ou atrás de proxy reverso, quando a origem vista pelo servidor difere da URL pública. Em desenvolvimento, deixe vazio: a aplicação usa a origem da própria requisição, então funciona em qualquer porta.

Gere um `SESSION_SECRET` seguro com:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 3. Aplicar as migrations e gerar o client

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. (Opcional) Popular dados de demonstração

```bash
npx prisma db seed
```

Cria o usuário `demo@pandinha.dev` / `pandinha123` com categorias, formas de pagamento e 10 lançamentos de exemplo.

### 5. Rodar

```bash
npm run dev
```

## Modelo de dados

- **Tipo** (`TipoLancamento`): enum fixo com `RECEITA` e `DESPESA`.
- **Categoria**: classificação detalhada, **sempre vinculada a um único Tipo** e a um `usuarioId`. É isso que faz o formulário de lançamento filtrar automaticamente as categorias corretas.
- **FormaPagamento**: por usuário, editável livremente.
- **Lancamento**: data, tipo, categoria, descrição, forma de pagamento e valor `Decimal(10,2)`.

O **Mês** não é uma tabela: ele é derivado da coluna `data` no momento da consulta (filtro por intervalo `[início do mês, início do mês seguinte)`), aproveitando o índice `@@index([usuarioId, data])`.

### Isolamento por usuário

Toda função em `data/` recebe `usuarioId` e filtra por ele. Componentes **nunca** chamam o Prisma direto — só as funções de `data/`.

### Seed automático de novo usuário

Ao criar a conta (por e-mail/senha ou por Google), o usuário recebe automaticamente:

- **Receitas**: Salário, Diárias, Gratificações, Renda extra, Outros
- **Despesas**: Aluguel/Financiamento, Condomínio, Água, Energia, Internet/Telefone, Plano de saúde, Seguros, Mensalidades, Alimentação, Supermercado, Combustível, Restaurantes, Lazer, Viagens
- **Formas de pagamento**: Depósito, PIX

### Exclusão protegida

Categorias e formas de pagamento com lançamentos vinculados **não podem ser excluídas** (a UI informa quantos lançamentos existem). Isso preserva o histórico. Trocar o _tipo_ de uma categoria que já tem lançamentos também é bloqueado, para não gerar inconsistência entre Tipo e Categoria.

## Rodar em container

O `Dockerfile` é multi-stage e usa a saída **`standalone`** do Next (`output: "standalone"` em `next.config.ts`), que traça só as dependências realmente usadas em runtime.

| Stage      | Papel                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `deps`     | `npm ci` — camada de dependências, cacheada enquanto o lockfile não muda                          |
| `builder`  | `prisma generate` + `next build`                                                                  |
| `migrator` | imagem enxuta só com o CLI do Prisma, para rodar `prisma migrate deploy`                          |
| `runner`   | imagem final: `.next/standalone` + `.next/static` + `public`, rodando como usuário sem privilégio |

Como o Prisma 7 usa **driver adapter** (`@prisma/adapter-pg`), o client é JavaScript puro — não há engine nativo, então nada de `binaryTargets` nem dor de cabeça com musl/OpenSSL no Alpine.

```bash
# sobe banco, aplica as migrations e inicia a aplicação
docker compose up -d --build

# só o banco (fluxo de desenvolvimento com `npm run dev` na máquina)
docker compose up -d postgres
```

> O arquivo segue a **Compose Specification** (sem chave `version:`, com `healthcheck` e `depends_on: condition:`). Isso exige **Compose v2** — o plugin `docker compose`. O `docker-compose` v1 está EOL e não interpreta esse formato corretamente.

O serviço `app` lê `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `APP_URL` do seu `.env` — o arquivo **não** entra na imagem (está no `.dockerignore`), os valores chegam como variáveis de ambiente em runtime. `SESSION_SECRET` é obrigatório e o compose falha explicitamente se estiver vazio.

> **Variáveis de runtime não podem ser lidas em página estática.** As telas `/login` e `/cadastro` decidem se mostram o botão do Google a partir de `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`. Como essas variáveis só existem em runtime (nunca no build), as duas páginas declaram `export const dynamic = "force-dynamic"`. Sem isso o Next as pré-renderiza durante o `next build` — quando as chaves ainda não existem — e congela "Google desabilitado" no HTML, independentemente do que o container receba depois.

Para conferir se as variáveis chegaram ao container:

```bash
docker compose exec app env | grep -E "GOOGLE|APP_URL"
```

O `migrations` roda uma vez e sai; o `app` só sobe depois que ele termina com sucesso (`service_completed_successfully`), e ambos esperam o healthcheck do Postgres.

## Rotas da API

Todas exigem sessão, exceto as marcadas como públicas. A proteção acontece em `proxy.ts` (o antigo `middleware.ts` do Next 15) e é reforçada em cada handler.

| Método         | Rota                                            | Descrição                                   |
| -------------- | ----------------------------------------------- | ------------------------------------------- |
| POST           | `/api/auth/cadastro`                            | Cria conta + seed padrão + sessão (pública) |
| POST           | `/api/auth/login`                               | Valida credenciais e cria sessão (pública)  |
| POST           | `/api/auth/logout`                              | Encerra a sessão (pública)                  |
| GET            | `/api/auth/sessao`                              | Dados do usuário autenticado                |
| GET            | `/api/auth/google`                              | Inicia o OAuth do Google (pública)          |
| GET            | `/api/auth/google/callback`                     | Retorno do Google, cria sessão (pública)    |
| GET            | `/api/categorias?tipo=`                         | Lista categorias do usuário                 |
| POST           | `/api/categorias`                               | Cria categoria                              |
| GET/PUT/DELETE | `/api/categorias/[id]`                          | Detalha, atualiza e remove                  |
| GET            | `/api/formas-pagamento`                         | Lista formas de pagamento                   |
| POST           | `/api/formas-pagamento`                         | Cria forma de pagamento                     |
| GET/PUT/DELETE | `/api/formas-pagamento/[id]`                    | Detalha, atualiza e remove                  |
| GET            | `/api/lancamentos?mes=&ano=&tipo=&categoriaId=` | Lista lançamentos filtrados                 |
| POST           | `/api/lancamentos`                              | Cria lançamento                             |
| GET/PUT/DELETE | `/api/lancamentos/[id]`                         | Detalha, atualiza e remove                  |
| GET            | `/api/dashboard?mes=&ano=`                      | Resumo, fatias por categoria e evolução     |

Erros seguem o formato `{ "mensagem": string, "campos"?: Record<string, string[]> }`, com status `400`, `401`, `404`, `409`, `422` ou `500`.

## Login com Google — passo a passo

O projeto implementa **OAuth 2.0 Authorization Code + PKCE** diretamente, sem biblioteca de auth, para o fluxo ficar visível.

### O que acontece por baixo

1. A pessoa clica em **Entrar com Google** → o navegador chama `GET /api/auth/google`.
2. Essa rota gera dois segredos aleatórios e os guarda em cookies `httpOnly`:
   - `state` — protege contra CSRF: o Google devolve esse mesmo valor no retorno e nós conferimos.
   - `code_verifier` (PKCE) — enviamos ao Google apenas o `code_challenge` (SHA-256 do verifier). Assim, mesmo que alguém intercepte o código de autorização, não consegue trocá-lo por um token sem o verifier.
3. Redirecionamos para a tela de consentimento do Google com `client_id`, `redirect_uri`, `scope=openid email profile`, `state` e `code_challenge`.
4. A pessoa autoriza. O Google redireciona para `GET /api/auth/google/callback?code=...&state=...`.
5. O callback confere o `state`, troca `code` + `code_verifier` por um `access_token` (`POST https://oauth2.googleapis.com/token`) e busca o perfil em `https://openidconnect.googleapis.com/v1/userinfo`.
6. `entrarComGoogle()` procura o usuário por `googleId`; se não achar, procura por e-mail e **vincula** a conta existente; se ainda não achar, cria a conta e roda o seed padrão.
7. Criamos a sessão JWT normal e redirecionamos para `/dashboard`.

### Quais chaves você precisa

Só duas, obtidas no Google Cloud Console:

| Variável               | O que é                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Identificador público do seu app OAuth                                                                     |
| `GOOGLE_CLIENT_SECRET` | Segredo do app — **nunca** exponha no cliente                                                              |
| `APP_URL`              | Opcional. Só em produção/proxy reverso, quando a origem da requisição difere da URL pública. Vazio em dev. |

### Como obter as chaves

1. Acesse <https://console.cloud.google.com/> e crie um projeto (ex.: "Pandinha Finances").
2. Vá em **APIs e Serviços → Tela de permissão OAuth**:
   - Tipo de usuário: **Externo**.
   - Preencha nome do app, e-mail de suporte e e-mail do desenvolvedor.
   - Em **Escopos**, adicione `openid`, `.../auth/userinfo.email` e `.../auth/userinfo.profile`.
   - Enquanto o app estiver em modo **Teste**, adicione seu e-mail em **Usuários de teste** — só eles conseguem logar.
3. Vá em **APIs e Serviços → Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo de aplicativo: **Aplicativo da Web**.
   - **Origens JavaScript autorizadas**: `http://localhost:3002`
   - **URIs de redirecionamento autorizados**: `http://localhost:3002/api/auth/google/callback`
     (o valor precisa bater **exatamente** com o que a aplicação envia — barra final, http/https e **porta** incluídos)

   > A aplicação roda na porta **3002** (`next dev -p 3002` no `package.json`). A porta é fixada de propósito: se o Next escolhesse uma porta livre a cada boot, o `redirect_uri` mudaria e deixaria de bater com o cadastrado no Console. Se você trocar a porta, atualize o Console junto.

4. Copie o **Client ID** e o **Client secret** para o `.env`.
5. Reinicie o `npm run dev`. O botão "Entrar com Google" só aparece quando as duas variáveis estão preenchidas.

### Ao publicar em produção

- Adicione o domínio real nas origens e no URI de redirecionamento (`https://seudominio.com/api/auth/google/callback`).
- Ajuste `APP_URL` para o domínio real.
- Publique a tela de consentimento (sai do modo Teste) para liberar qualquer conta Google.

### Erros comuns

| Erro                                                  | Causa                                                                                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `redirect_uri_mismatch`                               | O URI cadastrado no Console difere do enviado. Compare caractere por caractere — a **porta** é a causa mais comum.      |
| Volta do Google cai em "This page could not be found" | O `redirect_uri` aponta para uma porta onde outra aplicação está rodando. Confira `APP_URL` e a porta do `npm run dev`. |
| `access_denied`                                       | A conta não está na lista de usuários de teste, ou a pessoa cancelou.                                                   |
| `invalid_client`                                      | `GOOGLE_CLIENT_ID`/`SECRET` errados ou de outro projeto.                                                                |

## Estrutura de pastas

```
app/
  (autenticacao)/       login e cadastro
  (painel)/             dashboard, lancamentos, categorias, formas-pagamento
  api/                  route handlers
components/
  ui/                   shadcn/ui
  autenticacao/ dashboard/ lancamentos/ categorias/ formas-pagamento/ painel/ comum/
data/                   acesso a dados (única camada que fala com o Prisma)
lib/                    prisma, sessão, autenticação, esquemas zod, formatação, google
prisma/                 schema, migrations e seed
proxy.ts                proteção de rotas
```

## Scripts

```bash
npm run dev      # desenvolvimento (porta 3002)
npm run build    # build de produção
npm run start    # servidor de produção (porta 3002)
npm run lint     # eslint
```

> Rodando via `npm run start` fora do container, o Next usa `.next/` normalmente. Dentro do container, o processo é `node server.js` a partir do `.next/standalone`.
