npm i --legacy-peer-deps

# Project Architecture Overview

This document outlines the key components, folder structure, and best practices for ensuring consistency, scalability, and maintainability in the project.

---

## Components and Responsibilities

### **Mongoose Models**

- Define schema structure, default values, and validation rules.
- Ensure database-level integrity through validation and indexing.
- Used exclusively by the **repository** layer for database operations.

### **Repository**

- Encapsulates all database interaction logic.
- Provides reusable methods (`findOne`, `update`, `increment`) for CRUD operations.
- Contains **no business logic or validation**.

### **Service**

- Implements **business logic** and domain rules.
- Validates input and enforces application-specific constraints.
- Calls repository methods to interact with the database.
- Acts as the only layer interacting with the repository.

---

## Best Practices

### General Principles

- **Single Responsibility**: Each component handles only its specific responsibilities (e.g., validation in services, data persistence in repositories).
- **Consistent Naming**: Use descriptive and meaningful prefixes for files and methods (e.g., `solana.service.ts`, `findUserById`).
- **Abstraction Layers**:
  - Encapsulate library-specific logic in the `lib` folder to decouple it from application logic.
  - Use the `shared` folder for reusable utilities and types that are not big enough to have their own modules, across modules.
- **Error Handling**: Validate in the service layer and log or interpret errors appropriately.

---

## Example Workflow

1. **Input**: The Telegram bot receives user input.
2. **Validation**: The service layer validates the input and enforces business rules.
3. **Database Operations**:
   - The service calls repository methods for CRUD operations.
   - The repository interacts with the Mongoose model.
4. **Response**: The service returns a processed result or an appropriate error message.

---

## Folder Structure

The modular folder structure ensures separation of concerns and scalability:

/src
├── user/
│ ├── user.model.ts
│ ├── user.service.ts
│ ├── user.repository.ts
│ ├── user.types.ts
├── solana/
│ ├── solana.service.ts
│ ├── solana-utils.ts
├── telegram-bot/
│ ├── controllers
│ ├── telegram-bot.service.ts
│ ├── telegram-bot-utils.ts
├── lib/
│ ├── mongoose/
│ │ ├── connect-db.ts
│ ├── jito/
│ │ ├── send-tx.ts
├── shared/
│ ├── types/
│ │ ├── dto.ts
│ ├── utils/
│ │ ├── string-utils.ts
│ │ ├── math-utils.ts

---

## Key Definitions

### **lib vs. shared**

| **Category** | **lib**                                       | **shared**                                         |
| ------------ | --------------------------------------------- | -------------------------------------------------- |
| **Purpose**  | Encapsulates logic tied to external libraries | Provides reusable utilities and project-wide types |
| **Scope**    | Centralizes library-specific configurations   | Includes constants, DTOs, and helpers              |
| **Examples** | Database connection, library wrappers         | String utilities, validation helpers               |

#### **Clarification on `shared`**

The `shared` folder is not necessarily meant for utilities or types that are universally shared across the entire application. Instead, it is designed to house small, unique helpers, constants, or types that do not warrant their own module or folder.

For instance:

- Utilities in `shared` like `string-utils` or `math-utils` are used across multiple unrelated modules but are small enough to stay grouped under `shared`.
- By contrast, utilities like `solana-utils` are specific to the Solana domain and should remain under the `solana` module, even if they are shared within that module.

This distinction helps maintain clear boundaries and avoids unnecessarily bloating the `shared` directory.

---

## Naming Conventions

1. **Services**: Use the `.service.ts` suffix (e.g., `user.service.ts`) for files implementing business logic.
2. **Repositories**: Use the `.repository.ts` suffix (e.g., `user.repository.ts`) for database interaction logic.
3. **Utils**: Use the `-utils.ts` suffix and include the module name as a prefix when necessary (e.g., `solana-utils.ts`).

---

By following this architecture and adhering to the outlined conventions, developers can maintain a clean, modular, and scalable codebase that supports future growth.

### When to Use Flat Parameters vs Options Objects

| **Criterion**            | **Flat Parameters**    | **Options Object**              |
| ------------------------ | ---------------------- | ------------------------------- |
| **Number of Parameters** | 2-3                    | More than 3                     |
| **Parameter Meaning**    | Clear and intuitive    | Complex or requires explanation |
| **Optional Parameters**  | None                   | Many                            |
| **Readability**          | Simple and concise     | Clear with named fields         |
| **Extensibility**        | Rarely changes         | May need to add more parameters |
| **Usage Context**        | Critical, simple logic | Flexible, configurable logic    |

### Choosing Between `Options`, `Params`, and `DTO` for Function Arguments

| **Name**    | **Usage Context**                                                                                 | **Best Practice**                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Options** | Use when the function requires **configurable** or **optional** fields.                           | Suitable for flexible logic and settings, often with many optional fields.         |
| **Params**  | Use when the function requires a set of **mandatory and essential** inputs for execution.         | Ideal for clear and direct inputs that are necessary for the function to operate.  |
| **DTO**     | Use for **data transfer** between layers or systems, especially when handling **external input**. | Useful for validation, encapsulating input, and adhering to strict type contracts. |

#### Examples

**Options Example**:

```typescript
async fetchData(options: { cache?: boolean; retries?: number }): Promise<void> {}

async fetchData(params: { id: string; type: string }): Promise<void> {}

async createUser(userDTO: CreateUserDTO): Promise<void> {}
```
