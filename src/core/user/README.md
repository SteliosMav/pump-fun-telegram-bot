## Components and Responsibilities

### Mongoose Models

- Define schema structure, default values, and validation rules.
- Ensure database integrity.
- Index fields for optimized queries.
- Used exclusively by the repository layer.

### Repository

- Encapsulates all database interaction logic.
- Provides reusable functions (e.g., `findOne`, `update`, `increment`).
- Contains no business logic or validation.

### Service

- Implements business logic (e.g., validation, decision-making).
- Calls repository methods to perform database operations.
- Acts as the only layer interacting with the repository.

## Best Practices

- Validate user input and domain rules in the service layer.
- Reuse repository functions for all database interactions.
- Keep each function focused on a single responsibility.

## Example Workflow

1. Telegram bot receives user input.
2. Service layer validates input and applies business rules.
3. Service calls repository methods to update/query the database.
4. Repository interacts with Mongoose models to perform operations.

## Conventions

- Function names: Use verbs like `create`, `update`, `findOne` to indicate intent.
- Error handling: Validate in the service layer; log and interpret errors there.

---

By adhering to these conventions, you ensure clarity, maintainability, and a consistent development experience.
