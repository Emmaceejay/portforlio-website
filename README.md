# DSGV Tech Portfolio

Professional portfolio website for **DSGV Tech**, the technology brand of **De-secko Global Ventures**.

The site presents services for IoT and embedded systems, CCTV installation training, automation design, and website/web app development. It also includes a hidden admin interface for publishing portfolio works under each service.

## Stack

- HTML
- CSS
- JavaScript
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare D1

Cloudflare Pages does not run PHP, so this project uses Cloudflare's native backend model: Pages Functions plus D1 SQL storage.

## Key Files

- `index.html`: page shell and contact template.
- `styles.css`: responsive professional styling.
- `script.js`: frontend routing, services, works display, and admin UI.
- `functions/api/works.js`: API for listing and creating works.
- `functions/api/works/[id].js`: API for updating and deleting works.
- `migrations/0001_create_works.sql`: D1 schema.
- `wrangler.toml`: Cloudflare project configuration.
- `CLOUDFLARE_DEPLOYMENT_GUIDE.md`: full deployment guide.

## Contact

The contact section uses:

- WhatsApp button: replace the placeholder `2340000000000` with the real WhatsApp number.
- Email: `sockotech@gmail.com`

## Admin

The admin page is hidden from public navigation and can be opened manually:

```text
/#admin
```

Create, update, and delete actions require an `ADMIN_TOKEN` configured in Cloudflare Pages environment variables.

## Security

The backend avoids SQL injection by using D1 prepared statements with bound parameters. Public users can read portfolio works, while write operations require the private admin token.

For production, also protect the admin route with Cloudflare Access or another authentication layer.

## Deployment

See:

```text
CLOUDFLARE_DEPLOYMENT_GUIDE.md
```
