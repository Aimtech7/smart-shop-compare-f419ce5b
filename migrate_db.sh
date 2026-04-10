#!/bin/bash
Author : Aimtech7
# ==============================================================================
# SUPABASE TO POSTGRES MIGRATION SCRIPT
# ==============================================================================
# This script helps migrate a whole database from Supabase to another PostgreSQL
# database provider. It uses `pg_dump` for export and `psql` for import.
# 
# PREREQUISITES:
# 1. Install PostgreSQL client tools (`pg_dump` and `psql`) on your machine.
# 2. Get your Supabase Database URL (Found in Supabase Dashboard -> Settings -> Database)
# 3. Get your Target Database URL
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# ==============================================================================
# SECTION 1: CONFIGURATION
# ==============================================================================
# Replace these strings with your actual database connection URLs.
# Format: postgresql://[user]:[password]@[host]:[port]/[db_name]

# Your Supabase connection string.
# NOTE: Supabase uses port 5432 directly, or 6543 for the connection pooler. 
# For pg_dump, it's safer to use the direct connection (5432).
SUPABASE_DB_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Your target database connection string (e.g. AWS RDS, Neon, local DB, Heroku Postgres)
TARGET_DB_URL="postgresql://user:password@hostname:5432/target_db"

# The name of the dump file that will be temporarily created
DUMP_FILE="supabase_dump.sql"

echo "Starting migration process..."

# ==============================================================================
# SECTION 2: EXPORTING DATA (pg_dump)
# ==============================================================================
# Supabase contains many internal schemas (auth, storage, graphql, etc.) that 
# you typically DO NOT want to migrate if moving to a raw Postgres instance, 
# as they rely on Supabase's specific cloud infrastructure.
#
# The `--schema=public` flag ensures we only migrate your primary application data.
# If you need custom schemas, add additional `--schema=custom_schema` flags.
#
# `--clean --if-exists`: Adds DROP TABLE statements before CREATE TABLE, 
# ensuring the destination is completely overwritten with the source structure.
# `--no-owner`: Prevents assigning ownership to the Supabase "postgres" user on the new DB.
# `--no-privileges`: Skips copying grants that might be specific to Supabase roles.

echo "Step 1: Exporting 'public' schema from Supabase..."
pg_dump "$SUPABASE_DB_URL" \
  --schema=public \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --file="$DUMP_FILE"

echo "Export completed successfully. Dump stored in $DUMP_FILE."

# ==============================================================================
# SECTION 3: HANDLING 'auth' SCHEMA (OPTIONAL EXPLANATION)
# ==============================================================================
# If your application relies heavily on Supabase Auth (the `auth.users` table), 
# standard pg_dump won't carry over hashed passwords cleanly to standard apps
# unless you recreate the exact same encryption mechanisms. 
# 
# If you need to migrate auth users, you should:
# 1. Export users using the Supabase CLI: `supabase db dump --data-only --schema auth`
# 2. Or, manually extract user records from `auth.users` and script an 
#    import into your new Auth provider (like Auth0, Clerk, Firebase, or custom).
#
# Since this script targets the generic `public` schema, it does not migrate auth.

# ==============================================================================
# SECTION 4: IMPORTING DATA TO THE NEW DATABASE (psql)
# ==============================================================================
# Now we use the `psql` command to execute our downloaded generic SQL file
# into the new database.

echo "Step 2: Importing data into the Target Database..."
psql "$TARGET_DB_URL" < "$DUMP_FILE"

echo "Import completed successfully."

# ==============================================================================
# SECTION 5: CLEANUP
# ==============================================================================
# Remove the local dump file to keep the workspace clean and avoid leaving 
# sensitive database copies lying around.

echo "Step 3: Cleaning up temporary dump files..."
rm "$DUMP_FILE"

echo "Migration finished successfully!"
