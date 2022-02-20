# Must grant permission first to run:
# chmod +x ./pull-types.sh

pnpx --yes openapi-typescript "https://aqusbozlvdddsopbopcf.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNzQwNTAwNSwiZXhwIjoxOTMyOTgxMDA1fQ.7_AUM36q-2bWA-9VZOjHcMmJfbo22Qgxt9O3i5a2C1c" --output app/lib/types/supabase.ts
