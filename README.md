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

    Client->>Server: POST /api/v1/auth/login
    Note right of Client: Envia email e password.

    Server-->>Client: 200 OK, retorna accessToken e refreshToken
    Note left of Server: Valida e retorna tokens.

    Client->>Server: GET /api/v1/users/current com Auth Token
    Note right of Client: Acessa rota protegida.

    Server-->>Client: 200 OK, retorna dados do usuario
    Note left of Server: Retorna dados.

    loop O tempo passa, Access Token expira
    end

    Client->>Server: GET /api/v1/blogs com Auth Token expirado
    Note right of Client: Tenta acessar rota.

    Server-->>Client: 401 Unauthorized
    Note left of Server: Rejeita o acesso.

    Client->>Server: POST /api/v1/auth/refresh-token
    Note right of Client: Solicita novo token.

    Server-->>Client: 200 OK, retorna novo accessToken
    Note left of Server: Emite novo Access Token.

    Client->>Server: GET /api/v1/blogs com novo Auth Token
    Note right of Client: Refaz a chamada original.

    Server-->>Client: 200 OK, retorna dados dos blogs
    Note left of Server: Permite o acesso.
```