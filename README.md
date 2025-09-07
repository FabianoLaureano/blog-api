# Blog API

Uma API RESTful para uma plataforma de blog, construída com Node.js, Express, TypeScript e MongoDB. A API fornece um sistema completo para gerenciamento de usuários, posts, comentários e likes, com autenticação baseada em JWT e autorização por papéis.

## Funcionalidades

- **Autenticação e Autorização:** Sistema seguro com JSON Web Tokens (Access & Refresh Tokens) e autorização baseada em papéis (`admin`, `user`).
- **Gerenciamento de Usuários:** CRUD completo para administradores e gerenciamento de perfil para usuários.
- **Gerenciamento de Conteúdo:** Admins podem criar, ler, atualizar e deletar posts no blog.
- **Interação:** Usuários podem comentar e curtir posts.
- **Validação e Segurança:** Validação de entrada de dados, rate limiting para prevenção de abuso e uso de `helmet` para headers de segurança.

## Documentação

A documentação completa da API, incluindo todos os endpoints e modelos de dados, está disponível em GitBook:

[https://fabianolaureano.gitbook.io/blog-api/](https://fabianolaureano.gitbook.io/blog-api/)

## Fluxo de Autenticação

O fluxo mais importante da aplicação é o de autenticação, que garante o acesso seguro aos recursos. O diagrama abaixo ilustra o ciclo de vida do login à renovação do token.

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant Server as Servidor

    Client->>Server: POST /api/v1/auth/login (email, password)
    Note right of Client: Cliente envia credenciais.

    Server-->>Client: 200 OK { accessToken } (no corpo)<br/>(Set-Cookie: refreshToken no header)
    Note left of Server: Servidor valida e retorna os tokens.

    Client->>Server: GET /api/v1/users/current<br/>(Header: Authorization: Bearer accessToken)
    Note right of Client: Cliente acessa rota protegida com o Access Token.

    Server-->>Client: 200 OK { ...dados do usuário... }
    Note left of Server: Servidor retorna os dados solicitados.

    loop O tempo passa e o Access Token expira

    end

    Client->>Server: GET /api/v1/blogs<br/>(Header: Authorization: Bearer accessToken_expirado)
    Note right of Client: Cliente tenta acessar rota com token expirado.

    Server-->>Client: 401 Unauthorized
    Note left of Server: Servidor rejeita o acesso.

    Client->>Server: POST /api/v1/auth/refresh-token
    Note right of Client: Cliente solicita um novo Access Token.<br/>O cookie com o Refresh Token é enviado automaticamente.

    Server-->>Client: 200 OK { accessToken: novo_token }
    Note left of Server: Servidor valida o Refresh Token e emite um novo Access Token.

    Client->>Server: GET /api/v1/blogs<br/>(Header: Authorization: Bearer novo_token)
    Note right of Client: Cliente refaz a chamada original com o novo token.

    Server-->>Client: 200 OK { ...dados dos blogs... }
    Note left of Server: Servidor agora permite o acesso.

```
