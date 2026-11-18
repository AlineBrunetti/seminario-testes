# Seminário Prático de Testes de Software — Checkout B2B

Este repositório contém uma aplicação web de **Simulação e Gerenciamento de Pedidos B2B** desenvolvida especificamente para a demonstração prática das três camadas da **Pirâmide de Testes de Software**: **Testes Unitários (Jest)**, **Testes de Integração entre Módulos (Jest)** e **Testes End-to-End (Cypress)**.

---

## 1. Sobre o Sistema e Regras de Negócio

O sistema simula um formulário de checkout corporativo com controle de estoque em memória e motor de cálculo de preços. Embora enxuto, o sistema implementa regras de negócio determinísticas para validar diferentes cenários de teste:

1. **Catálogo e Estoque Inicial (`src/db.ts`):**
   * `prod-1`: Teclado Mecânico Brown — **R$ 250,00** (Estoque inicial: **15 unidades**)
   * `prod-2`: Monitor Ultrawide 29" — **R$ 1.200,00** (Estoque inicial: **5 unidades**)
2. **Desconto Progressivo por Volume (`src/pricing.ts`):**
   * Compras a partir de **10 unidades** recebem automaticamente **10% de desconto** sobre o subtotal.
3. **Cupom Promocional (`src/pricing.ts`):**
   * O cupom `PROMO15` concede **15% de desconto** (cumulativo com o desconto de volume, podendo chegar a 25%).
   * Qualquer outro código de cupom informado dispara erro de validação (`Cupom inválido`).
4. **Cálculo de Frete (`src/pricing.ts`):**
   * Pedidos com valor pós-desconto **a partir de R$ 500,00** possuem **Frete Grátis (R$ 0,00)**.
   * Pedidos abaixo de R$ 500,00 pós-desconto têm taxa fixa de **R$ 35,00**.
5. **Validação de Pedido e Baixa de Estoque (`src/orderService.ts`):**
   * O nome do cliente deve ter pelo menos 3 caracteres.
   * A quantidade solicitada não pode ultrapassar o estoque disponível no banco em memória.
   * Quando aprovado, o pedido reduz o estoque do produto e gera um identificador sequencial (`ord-1`, `ord-2`, etc.).

---

## 2. Estrutura do Projeto

```text
seminario-testes/
├── package.json
├── tsconfig.json
├── jest.config.js
├── cypress.config.ts
├── public/
│   └── index.html                  # Interface Web (Frontend com seletores data-cy)
├── src/
│   ├── pricing.ts                  # Módulo de cálculo puro (Alvo dos Testes Unitários)
│   ├── db.ts                       # Persistência e controle de estoque em memória
│   ├── orderService.ts             # Orquestrador de regras e dados (Alvo dos Testes de Integração)
│   ├── app.ts                      # Rotas HTTP (Express)
│   └── server.ts                   # Inicialização do servidor na porta 3000
├── tests/
│   ├── unit/
│   │   └── pricing.test.ts         # Testes Unitários com Jest
│   └── integration/
│       └── orderService.test.ts    # Testes de Integração entre funções/módulos com Jest
└── cypress/
    ├── fixtures/
    │   └── orderData.json          # Massa de dados estática para os testes E2E
    ├── support/
    │   └── pages/
    │       └── OrderPage.ts        # Padrão Page Object encapsulating seletores da UI
    └── e2e/
        └── checkout.cy.ts          # Suíte de testes End-to-End com Cypress
```

---

## 3. Estratégia de Testes Implementada

### A. Testes Unitários (`tests/unit/pricing.test.ts`)
* **Ferramenta:** Jest (`ts-jest`)
* **Escopo:** Testa a função pura `calculateOrderTotal()` do arquivo `src/pricing.ts` de maneira 100% isolada, sem dependência de banco de dados, rede ou interface gráfica.
* **Cenários Verificados:**
  1. Cálculo de pedido simples abaixo de R$ 500,00 com incidência de frete de R$ 35,00.
  2. Aplicação de 10% de desconto por volume (10+ itens) e isenção automática de frete.
  3. Acúmulo do desconto por volume (10%) com o cupom `PROMO15` (15%), totalizando 25% de abatimento.
  4. Disparo de exceções (`toThrow`) para cupom inexistente ou quantidade menor/igual a zero.

### B. Testes de Integração (`tests/integration/orderService.test.ts`)
* **Ferramenta:** Jest (`ts-jest`)
* **Escopo:** Valida a comunicação direta e o funcionamento conjunto entre três módulos do sistema: `src/orderService.ts` $\leftrightarrow$ `src/db.ts` $\leftrightarrow$ `src/pricing.ts`.
* **Cenários Verificados:**
  1. **Fluxo integrado completo:** Busca do produto no `db.ts`, envio do preço real para cálculo no `pricing.ts`, registro do pedido criado e verificação da baixa real de estoque no `db.ts` (de 15 para 13 unidades).
  2. **Bloqueio de estoque insuficiente:** Verifica se o `orderService.ts` impede a venda quando a quantidade excede o estoque do `db.ts`, garantindo que nenhum pedido seja criado e o estoque permaneça intacto.
  3. **Propagação de erro entre módulos:** Verifica se uma exceção disparada pelo módulo `pricing.ts` (cupom inválido) interrompe a execução no `orderService.ts` antes de abater o estoque no `db.ts`.

### C. Testes End-to-End (`cypress/e2e/checkout.cy.ts`)
* **Ferramenta:** Cypress
* **Escopo:** Simula a interação real do usuário no navegador validando a interface gráfica (`public/index.html`), a comunicação via HTTP com o backend Express e a resiliência da tela.
* **Recursos e Boas Práticas Aplicadas:**
  * **Page Objects (`OrderPage.ts`):** Isolamento dos seletores `[data-cy="..."]` e ações de preenchimento.
  * **Fixtures (`orderData.json`):** Carregamento externo de dados para cenários válidos e inválidos.
  * **Interceptação de Rede (`cy.intercept`):** Espionagem do payload enviado no `POST /api/orders` e simulação (*stub*) de falha crítica no servidor (`Erro 500`) para validar o comportamento da interface.

---

## 4. Como Executar o Projeto e os Testes

### Pré-requisitos
* **Node.js** (versão 18 ou superior) instalado.

### 1. Instalação das dependências
```bash
npm install
```

### 2. Executar Testes Unitários e de Integração (Jest)
```bash
# Rodar apenas os Testes Unitários
npm run test:unit

# Rodar apenas os Testes de Integração
npm run test:integration

# Rodar toda a suíte Jest (Unitários + Integração)
npm run test:all
```

### 3. Executar a Aplicação e os Testes E2E (Cypress)
Para rodar o Cypress, o servidor da aplicação precisa estar ativo na porta `3000`.

No **Terminal 1**, inicie o servidor web:
```bash
npm run dev
```
*(O sistema ficará acessível em `http://localhost:3000`)*

No **Terminal 2**, execute o Cypress:
```bash
# Abrir a interface visual interativa do Cypress (Recomendado para a apresentação)
npm run cy:open

# Ou executar todos os testes E2E via terminal (modo headless)
npm run cy:run
```

---

## 5. Roteiro de Apresentação para a Equipe (5 Integrantes)

| Integrante | Responsabilidade na Apresentação | Arquivos Principais | Comando de Demonstração |
| :--- | :--- | :--- | :--- |
| **1. Arquitetura e Contexto** | Apresenta o propósito do sistema, demonstra um pedido rápido no navegador e explica as diferenças entre Testes Unitários, de Integração e E2E na pirâmide de testes. | `public/index.html`<br>`src/app.ts` | `npm run dev` |
| **2. Testes Unitários** | Explica o conceito de função pura e isolamento, demonstrando as regras matemáticas de desconto, frete e exceções testadas com Jest. | `src/pricing.ts`<br>`tests/unit/pricing.test.ts` | `npm run test:unit` |
| **3. Testes de Integração** | Demonstra a comunicação real entre `orderService.ts`, `pricing.ts` e `db.ts`, destacando o reset de estado (`beforeEach`) e a verificação de efeito colateral no estoque. | `src/orderService.ts`<br>`src/db.ts`<br>`tests/integration/orderService.test.ts` | `npm run test:integration` |
| **4. Testes E2E (Base)** | Apresenta a estrutura do Cypress, o uso de seletores `data-cy`, o padrão *Page Object* e *Fixtures*, executando o caminho feliz e o erro de estoque na interface. | `cypress/fixtures/orderData.json`<br>`cypress/support/pages/OrderPage.ts`<br>`cypress/e2e/checkout.cy.ts` (Testes 1 e 2) | `npm run cy:open` |
| **5. Testes E2E (Avançado)** | Explica e demonstra a interceptação de requisições HTTP com `cy.intercept`, validando o contrato do payload JSON e simulando um Erro 500 para provar a resiliência da UI. | `cypress/e2e/checkout.cy.ts` (Testes 3 e 4) | `npm run cy:open` |