# Cloudflare Pages Deployment Guide for DSGV Tech

This guide explains how to deploy the DSGV Tech portfolio to Cloudflare Pages with Cloudflare D1 for persistent portfolio updates.

## Architecture

This project uses:

- HTML, CSS, and JavaScript for the public website.
- Cloudflare Pages for hosting.
- Cloudflare Pages Functions for backend API routes.
- Cloudflare D1 for persistent SQL storage.
- Prepared SQL statements with bound parameters to prevent SQL injection.
- An `ADMIN_TOKEN` environment variable to protect create, update, and delete actions.

Cloudflare Pages does not run PHP. Because this site is intended for Cloudflare Pages, D1 + Pages Functions is the simplest Cloudflare-native replacement for PHP/MySQL.

## Files To Know

- `index.html`: public page shell and contact template.
- `styles.css`: site styling.
- `script.js`: frontend routing, service pages, works display, and admin UI.
- `functions/api/works.js`: API route for listing and creating portfolio updates.
- `functions/api/works/[id].js`: API route for updating and deleting portfolio updates.
- `migrations/0001_create_works.sql`: D1 database schema.
- `wrangler.toml`: Cloudflare project and D1 binding config.

## Step 1: Create Or Log Into Cloudflare

Create a Cloudflare account or log in to your existing account.

## Step 2: Install Node.js

Install Node.js if it is not already installed. Node.js is required to run Wrangler, Cloudflare's command-line tool.

## Step 3: Open The Project Folder

Open PowerShell in this folder:

```powershell
C:\Users\Chijioke\Desktop\my_flyer
```

## Step 4: Install Wrangler

Run:

```powershell
npm install -D wrangler
```

## Step 5: Log In To Cloudflare

Run:

```powershell
npx wrangler login
```

Your browser will open. Approve the login.

## Step 6: Create The D1 Database

Run:

```powershell
npx wrangler d1 create dsgv-tech-portfolio
```

Cloudflare will return a `database_id`. Copy it.

## Step 7: Update `wrangler.toml`

Open `wrangler.toml` and replace:

```text
replace-with-your-d1-database-id
```

with the real `database_id` from Cloudflare.

Also replace:

```text
replace-with-your-preview-d1-database-id
```

You can use the same database id for preview while starting out, or create a separate preview database later.

## Step 8: Apply The Database Schema

Run:

```powershell
npx wrangler d1 execute dsgv-tech-portfolio --remote --file=./migrations/0001_create_works.sql
```

This creates the `works` table used by the portfolio.

## Step 9: Create The Cloudflare Pages Project

You can deploy directly with Wrangler:

```powershell
npx wrangler pages deploy . --project-name dsgv-tech-portfolio
```

Or connect the GitHub repository from the Cloudflare dashboard:

1. Go to Cloudflare Dashboard.
2. Open Workers & Pages.
3. Choose Create application.
4. Choose Pages.
5. Connect your GitHub repository.
6. Select the repository for this project.
7. Use no build command for this simple static project.
8. Use `/` or the project root as the output directory.

## Step 10: Add The D1 Binding

In Cloudflare Pages project settings, add a D1 binding:

```text
Binding name: DB
Database: dsgv-tech-portfolio
```

The binding name must be exactly `DB`, because the backend functions use `env.DB`.

## Step 11: Add The Admin Token

In Cloudflare Pages project settings, add an environment variable:

```text
ADMIN_TOKEN
```

Use a strong private value. This is the token you enter on the hidden admin page before saving, editing, or deleting portfolio updates.

Do not put this token in the code or commit it to GitHub.

## Step 12: Access The Admin Page

The public website does not show an admin link.

Open the admin page manually:

```text
https://your-site-url/#admin
```

Enter your `ADMIN_TOKEN`, then add portfolio works under the correct service.

## Step 13: Update Contact Information

The current contact email is:

```text
sockotech@gmail.com
```

The WhatsApp link currently uses this placeholder:

```text
2340000000000
```

Replace it with your real WhatsApp number in international format, for example:

```text
2348012345678
```

## Security Notes

- SQL injection protection is handled by prepared statements and `.bind(...)` in the Pages Functions.
- Public users can read portfolio works.
- Create, update, and delete operations require `ADMIN_TOKEN`.
- Hiding `/#admin` is not full security by itself. For production, also protect the admin route with Cloudflare Access or another login layer.
- Do not store secrets in `index.html`, `script.js`, `wrangler.toml`, or GitHub.

## Image Storage Notes

The current admin supports:

- Pasting image URLs.
- Uploading small images that are converted to data URLs.

For a larger professional portfolio, the better production setup is:

- Store image files in Cloudflare R2.
- Store only image URLs in D1.

This keeps the database smaller and makes image delivery more reliable.
