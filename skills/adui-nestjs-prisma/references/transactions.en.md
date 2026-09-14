# Transaction Rules

English fallback for `transactions.md`.

Use transactions when multiple database operations must succeed or fail atomically. Keep transaction scopes aligned with business use cases and short in duration. Do not perform long remote calls inside database transactions. External side effects require idempotency, outbox, compensation, or other reliability patterns rather than assuming the database transaction can roll them back.
