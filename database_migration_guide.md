# Database Migration Guide: Alternatives to Supabase

If you wish to migrate away from Supabase, there are several solid PostgreSQL (and MySQL) alternatives you can use without breaking your application framework. Supabase relies on standard PostgreSQL at its core. If your app leverages Supabase-specific features (like `auth`, `storage`, `realtime`, and `RLS` policies mapped to `auth.uid()`), you will need substituting layers or you must manage these natively.

## 1. Managed PostgreSQL Providers (Direct Alternatives)

The closest and most standard path is migrating to another managed PostgreSQL provider.

### a) AWS RDS for PostgreSQL / Aurora
**What it is:** Amazon's fully managed relational database service.
**Pros:** Highly scalable, integrates well if you move your backend to AWS, almost infinite redundancy.
**Cons:** Can be expensive and requires more initial configuration (VPCs, Security Groups).
**How to migrate without breaking:**
1. Provision a Postgres instance on RDS matching your current Supabase PG version (e.g., 15+).
2. Dump your DB schema from Supabase using `pg_dump` excluding specific extensions you don't need (or export `--schema=public`).
3. Point your backend's `DATABASE_URL` (in `.env`) to the new RDS instance.
4. Replace Supabase Auth with an alternative like **Auth0, Clerk, or AWS Cognito**.

### b) Neon Serverless Postgres
**What it is:** A modern serverless Postgres platform that separates storage and compute.
**Pros:** Feels very similar to the Supabase experience. Rapid branching (useful for development!). Scales down to zero to save costs.
**Cons:** You must bring your own Auth, Storage, and Realtime sync services.
**How to migrate without breaking:**
1. Create a Neon project.
2. Use the `pg_restore` commands or a migration file to populate the schema.
3. Update connection strings in your backend. Neon handles connection pooling nicely out of the box (much like Supabase's PgBouncer/Supavisor).

### c) Render Postgres or Heroku Postgres
**What it is:** App platform databases. Highly integrated if you are deploying your frontend/backend on Render/Heroku.
**Pros:** Lowest barrier to entry. Click button, get database.
**Cons:** Less configuration available compared to RDS.
**How to migrate without breaking:**
1. Provision the database alongside your web service.
2. Migrate using standard `pg_dump` and `psql` restore commands.

## 2. Distributed / Auto-scaling Databases

### a) CockroachDB / YugabyteDB
**What it is:** Distributed databases offering Postgres-compliant interfaces.
**Pros:** Multi-region scaling with high availability.
**Cons:** They are "Postgres-compatible", not actually Postgres. Certain very advanced Supabase functions or native trigger logic might need rewrites.
**How to migrate without breaking:**
Validate your entire schema. Replace Supabase edge functions or complex Postgres triggers with server-side API application logic before you migrate, as distributed SQL databases have different limitations on triggers and stored procedures.

## 3. Alternative Full "BaaS" (Backend-as-a-Service)

If you don't just want a database, but want to replace ALL of Supabase (Auth, DB, Realtime, Auto-generated APIs):

### a) Firebase (Firestore / Realtime DB)
**What it is:** Google's NoSQL BaaS.
**How to migrate:** **High risk of breaking.** You must rewrite all of your SQL logic into NoSQL document patterns and swap out all database JS client libraries. 

### b) Appwrite
**What it is:** An open-source BaaS very similar to Supabase, but typically uses MariaDB under the hood instead of Postgres.
**How to migrate:** Because it uses MariaDB/NoSQL-like abstractions, you will have to rewrite your application's data access layer. You cannot just swap the `DATABASE_URL`.

## Migration Strategy (Zero / Minimal Downtime)

To migrate to a new standard PostgreSQL Database (like AWS, Neon, or Render) seamlessly:
1. **Prepare Application:** Update your app to not rely on `auth.uid()`. Write middleware in your application layer (e.g., Express or Next.js) that validates your new Auth provider's JWT, and securely writes to the database using a server-side connection pool.
2. **Dual Writes (Optional but recommended for large systems):** Update your application to write data to *both* Supabase and the new database simultaneously, while continuing to read from Supabase.
3. **Data Export:** Put your app into maintenance mode (Read-only) OR rely on logical replication. 
4. **Dump and Restore:** Run the `migrate_db.sh` script to copy data from Supabase to Target DB.
5. **Switch Over:** Change your environment variables to strictly use the Target Database.
6. **Verify & Deprecate:** Wait a few days to monitor functionality before deleting your Supabase project.
