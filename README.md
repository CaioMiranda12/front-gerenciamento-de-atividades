# 🗂️ Gerenciador de Atividades - Frontend

Aplicação React + TypeScript que consome a API REST do projeto Gerenciador de Atividades (Spring Boot + PostgreSQL).
Permite organizar grupos e atividades, criar, editar, excluir e mover tarefas entre grupos através de drag and drop.

---

# 🚀 Tecnologias Utilizadas

### Frontend
-  **React.js (Vite)**
-  **TailwindCSS** — para estilização rápida e responsiva
-  **React Beautiful DnD** — para drag and drop entre grupos
-  **Lucide Icons** — ícones minimalistas e elegantes
-  **React Toastify** — feedback visual com toasts
-  **Zod + React Hook Form** — validação de formulários
-  **Search & Filter** — busca em tempo real por atividades

### Backend
-  **Spring Boot (Java 17+)**
-  **Spring Data JPA**
-  **PostgreSQL**
-  **Flyway**

---

## 🧠 Funcionalidades Principais

### 🧩 Grupos de Atividades
- Cada grupo contém uma lista de atividades.
- O nome do grupo pode ser **editado em linha**.
- Grupos podem ser **excluídos** dinamicamente.

### ✅ Atividades
- Criar, editar e excluir atividades diretamente na interface.
- Cada atividade contém:
  - Descrição  
  - Data de entrega (`dueDate`)
  - Status de conclusão (`completed`)
- Descrições longas são automaticamente quebradas em múltiplas linhas.

### 🎯 Drag and Drop
- Arraste e solte atividades entre grupos.
- O sistema atualiza automaticamente o `groupId` da atividade e sua **posição** dentro do grupo.
- As mudanças são persistidas no backend.

### 🔍 Busca de Atividades
- Campo de pesquisa no **Header** para filtrar atividades em todos os grupos.
- A busca é **reativa** e não diferencia maiúsculas/minúsculas.

### 🔔 Notificações
- Ícone de sino indica quando existem **atividades atrasadas**.
- Mostra o número total e uma mensagem contextual.

---

## ⚙️ Como Rodar o Projeto

### 1. Entrar na pasta do frontend
```bash
cd frontend
```

### 2. Instalar dependências
```bash
yarn install
```

### 3. Rodar o projeto
```bash
yarn dev
```

O frontend estará disponível em:
👉 http://localhost:5173

> ⚠️ Este projeto utiliza **Yarn** como gerenciador de pacotes.
> Embora o uso de `npm` seja possível, recomenda-se **manter o Yarn** para garantir compatibilidade com as versões das dependências.


