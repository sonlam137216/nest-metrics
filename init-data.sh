#!/bin/bash
set -e

echo "Running init-data.sh..."

if [ -n "${DB_USERNAME:-}" ] && [ -n "${DB_PASSWORD:-}" ] && [ -n "${DB_DATABASE:-}" ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<EOSQL
        CREATE DATABASE ${DB_DATABASE};
        CREATE USER ${DB_USERNAME} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
        GRANT ALL PRIVILEGES ON DATABASE ${DB_DATABASE} TO ${DB_USERNAME};
EOSQL

    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="${DB_DATABASE}" <<EOSQL
        ALTER SCHEMA public OWNER TO ${DB_USERNAME};
        GRANT ALL ON SCHEMA public TO ${DB_USERNAME};
        GRANT ALL ON ALL TABLES IN SCHEMA public TO ${DB_USERNAME};
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ${DB_USERNAME};
        GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO ${DB_USERNAME};

EOSQL

    echo "Database ${DB_DATABASE} and user ${DB_USERNAME} created successfully with permissions!"
else
    echo "SETUP INFO: No Environment variables given!"
fi
