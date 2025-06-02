# 🛒 Store Backend API

Este é um projeto backend de uma aplicação de compras online, desenvolvido com **NestJS**, **TypeScript** e banco de dados **SQLite**.

A API permite cadastrar produtos, gerenciar um carrinho de compras e realizar a finalização do pedido.

## 🚀 Tecnologias

- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [SQLite](https://www.sqlite.org/)
- [TypeORM](https://typeorm.io/)
- [Jest](https://jestjs.io/) – para testes unitários
- [Swagger](https://swagger.io/) – documentação da API

## 📦 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/store-backend.git
cd store-backend
```

2. Instale as dependências:

```bash
npm install
```

3. Rode a aplicação:

```bash
npm run start:dev
```

## 🔍 Documentação da API

Após iniciar a aplicação, acesse:

> [http://localhost:3000/api](http://localhost:3000/api)

A documentação Swagger estará disponível com todas as rotas, exemplos e parâmetros.

## 🧪 Rodar os testes

```bash
npm run test
```

Testes unitários cobrem os módulos de `products` e `cart`.

---

## 📚 Funcionalidades

### Produtos (`/products`)

- `GET /products`: Listar todos os produtos
- `GET /products/:id`: Buscar um produto por ID
- `POST /products`: Criar um novo produto  
  **Exemplo:**
  ```json
  {
    "name": "Camisa",
    "price": 50,
    "quantity": 100
  }
  ```
- `PATCH /products/:id`: Atualizar um produto
- `DELETE /products/:id`: Remover um produto

### Carrinho (`/cart`)

- `POST /cart`: Adicionar item ao carrinho  
  **Exemplo:**
  ```json
  {
    "productId": 1,
    "quantity": 2
  }
  ```

- `GET /cart`: Visualizar o carrinho

- `DELETE /cart/:productId`: Remover item do carrinho

- `POST /cart/checkout`: Finalizar compra  
  **Retorna:**
  ```json
  {
    "total": 100,
    "items": [...],
    "message": "Compra realizada com sucesso"
  }
  ```

---

## ✅ Requisitos atendidos

- CRUD de produtos
- Carrinho funcional
- Checkout com atualização de estoque
- Testes unitários com Jest
- Documentação Swagger
- Validação de entrada com `class-validator`
- Banco de dados SQLite

---

## 📁 Estrutura do Projeto

```bash
src/
├── app.module.ts
├── products/
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── dto/
│   └── entities/
├── cart/
│   ├── cart.controller.ts
│   ├── cart.service.ts
│   ├── dto/
│   └── entities/
```

---

## 👤 Autora

Lívia Lima Bion – [@liviabion](https://github.com/liviabion)

---

## 📝 Licença

Este projeto está sob a licença MIT.