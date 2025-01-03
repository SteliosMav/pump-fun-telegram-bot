### Model

The **Model** ensures consistency and reliability in all database interactions:

1. **Schema Definition**: Defines the structure of the database documents using **Mongoose**, including required fields, default values, and validation rules.
2. **Validation**: Enforces constraints on the data before saving to the database.
3. **Database Operations**: Acts as the **Repository** by providing an interface for data access operations (`find`, `create`, `update`, `delete`) and abstracting persistence logic.
4. **Reusable Logic**:
   - **Static Methods**: Encapsulates reusable database queries or operations at the model level.
   - **Instance Methods**: Adds document-specific behavior.
   - **Virtual Fields**: Computes additional properties derived from existing fields.
   - **Query Helpers**: Adds reusable query logic for more expressive and consistent query building.

### Service

The **Service** is responsible for coordinating application logic:

1. **Business Logic**: Implements domain-specific operations and workflows that often involve multiple models or external systems.
2. **Interaction with the Model**: Relies on the model to perform database operations, delegating persistence responsibilities.
3. **Abstraction**: Shields the rest of the application from direct database interactions, ensuring that the business logic remains independent of the persistence layer.
