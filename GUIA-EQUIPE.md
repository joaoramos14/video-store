# Guia rápido da equipe (temporário)

Este arquivo é só para a equipe se organizar durante o desenvolvimento. Ele **não** é o README final do projeto — o README oficial, com as 10 seções pedidas na APS, é feito depois, pela Pessoa 3.

Prazo: até sexta-feira.

**Atenção:** o projeto mudou de domínio (de "cidades favoritas com clima" para "locadora de filmes") e trocou de repositório. Se você clonou o antigo (`weather-favorites-api`), apague a pasta local e clone o novo abaixo.

## 1. Antes de tudo: aceite o convite

Você recebeu (ou vai receber) um convite por e-mail do GitHub para colaborar no repositório `movie-rental-api`. Aceite o convite antes de continuar.

## 2. Clonar o repositório

Abra o terminal (Prompt de Comando, no Windows) numa pasta onde você organiza seus projetos — **evite** pastas dentro do OneDrive, Google Drive ou similares, pois costumam dar problema com o Git.

```
cd C:\Projetos
git clone https://github.com/SEU_USUARIO/movie-rental-api.git
cd movie-rental-api
```

Troque `SEU_USUARIO` pelo usuário de quem criou o repositório.

## 3. Configurar seu Git (só na primeira vez, por computador)

```
git config --global user.name "Seu Nome Completo"
git config --global user.email "seu-email-da-conta-github@exemplo.com"
```

Use o mesmo e-mail da sua conta do GitHub, para os commits ficarem associados a você.

## 4. Instalar as dependências

```
npm install
```

Confira antes que você tem o Node.js 20.6 ou superior instalado (`node -v`).

## 5. Configurar as variáveis de ambiente

Copie o arquivo de exemplo:

```
copy .env.example .env
```

Abra o `.env` (não o `.env.example`) e preencha com a chave real do Supabase, que foi enviada **por mensagem privada** no grupo (nunca pelo GitHub):

```
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
PORT=3000
```

O `.env` nunca deve ir para o Git — ele já está no `.gitignore`, mas fique atento.

## 6. Testar se está tudo funcionando

```
npm run dev
```

Deve aparecer `Servidor executando em http://localhost:3000`. Abra esse endereço no navegador; deve aparecer o JSON `{"message": "API Locadora de Filmes", ...}`. Pare o servidor com `Ctrl+C`.

## 7. Criar sua branch de trabalho

Nunca trabalhe direto na `main`. Antes de começar sua parte, crie uma branch:

```
git checkout -b feat/nome-da-sua-parte
```

Exemplos: `feat/categorias`, `feat/filmes`, `feat/readme`.

## 8. Trabalhar e commitar

Vá salvando seu progresso em commits pequenos, com mensagens curtas e claras:

```
git add .
git commit -m "feat: adiciona CRUD de filmes"
```

Pode repetir `git add` + `git commit` quantas vezes fizer sentido enquanto trabalha.

## 9. Enviar sua branch para o GitHub

```
git push -u origin feat/nome-da-sua-parte
```

(Da segunda vez em diante, só `git push` já basta.)

## 10. Abrir um Pull Request

No GitHub, vá até o repositório. Vai aparecer um aviso sugerindo abrir um **Pull Request** a partir da sua branch — clique nele. Escreva um título curto explicando o que foi feito e peça para outro integrante revisar antes do merge na `main`.

## 11. Atualizar sua cópia local com o que os outros já enviaram

Sempre que outro integrante juntar algo na `main`, atualize a sua antes de continuar:

```
git checkout main
git pull
git checkout feat/nome-da-sua-parte
git merge main
```

## Combinados importantes

- Nunca commitar o arquivo `.env` (só o `.env.example`).
- Nunca colar chaves ou senhas no chat do grupo em texto aberto sem necessidade — prefira mensagem privada.
- Sempre testar localmente (`npm run dev`) antes de abrir o Pull Request.
- Ao criar ou editar um Filme, confira se a `categoria_id` informada existe antes de salvar.
- Em caso de dúvida ou erro estranho no Git, parar e perguntar no grupo antes de tentar "resolver" com comandos aleatórios.
