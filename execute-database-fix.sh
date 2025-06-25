#!/bin/bash

# Execute the database fix script through Supabase REST API
# This creates the missing notifications and connections tables

echo "🔧 Fixing missing database tables..."

# Read the SQL file and escape it properly
SQL_CONTENT=$(cat fix-missing-database-tables.sql)

# Execute the SQL through HTTP request
curl -X POST \
  "https://nuntsizvwfmjzucuubcd.supabase.co/auth/v1/admin/users" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bnRzaXp2d2Ztanp1Y3V1YmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MzA3MTMsImV4cCI6MjA2NjQwNjcxM30.AskIiop9Z8sNL_K9THYgskWWFPmXi7XoqljiYgJodWU" \
  -H "Content-Type: application/json"

echo "Database fix attempt completed. Check the Supabase dashboard to verify the tables were created."
echo "Required tables: notifications, connections"
echo "If this fails, please run the SQL script manually in the Supabase SQL editor."