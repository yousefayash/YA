# Youssef Ayash - Portfolio

A responsive personal portfolio built with plain HTML, CSS, and vanilla JavaScript, plus an Express/PostgreSQL backend for securely storing contact messages and serving the admin inbox.

## Run it locally

This version needs Node.js 20+. If `DATABASE_URL` is configured, it uses PostgreSQL; otherwise local development automatically stores contact submissions in `data/messages.json`.

1. Run `npm install` in this folder.
2. Local development uses `programing` as the dashboard password and generates a temporary session secret automatically. For production, set `ADMIN_PASSWORD` to a strong private password and `SESSION_SECRET` to a random string of at least 32 characters. Set `DATABASE_URL` to a PostgreSQL connection string for persistent messages and admin sessions.
3. Run `npm start` and open http://localhost:3000.
4. Open `/admin.html` to sign in. The server stores submissions in PostgreSQL.

Do not use Python's static file server for this version; it cannot process the form API.

## Project structure

```
index.html            Page structure (sections, dialogs, SEO tags)
css/styles.css        All styling, theme variants, and responsive rules
js/config.js          YOUR CONTENT: photo, links, skills, projects, gallery
js/main.js            Behaviour (menu, project details, form, theme, animations)
admin.html            Local portfolio dashboard (browser storage only)\njs/admin.js           Dashboard behaviour and project editor\ncss/admin.css         Dashboard styling\nassets/images/        Project previews and profile photos
```

Almost everything you will want to change lives in `js/config.js`.

## How to replace things

### Profile photo
1. Copy your photo into `assets/images/`, for example `profile.jpg` (a portrait around 960x1120 px works well).
2. In `js/config.js`, set `owner.profileImage` to `"assets/images/profile.jpg"` and update `owner.profileAlt`.

It is used in both the hero and the About section.

### Availability status
In `js/config.js`, edit `availability`:
- `text`: the words shown in the small pill.
- `state`: `"neutral"` (blue), `"available"` (green), or `"busy"` (amber).
- `show: false` hides it completely.

### Email address
Set `contact.email` in `js/config.js`, for example `"name@example.com"`. It appears in the contact section and footer and is used by the form's email fallback. While it is empty, the email card shows "Not added yet".

### Social links
In `js/config.js`, fill in the `url` of each item in `socials` (for example `"https://github.com/your-username"`). Empty links appear disabled in the contact section and are hidden in the footer. Instagram and X are optional and only appear once you add a URL. You can add more by copying an entry; `github`, `linkedin`, `instagram`, and `x` have built-in icons.

### Project screenshots and links
Each entry in `projects` has:
- `image`: the card cover. `screenshots`: the images shown in the details view.
- `liveUrl` and `sourceUrl`: leave as `""` until the link exists. The button is then shown as disabled.
- `technologies`: edit to match what you actually used.
- `overview`, `features`, and `learnings`: the text in the details view. Please review them and add your own specifics about challenges you faced.

Drop your screenshots into `assets/images/projects/` (wide screenshots look best; WebP or JPG keeps the site fast) and update the paths. To add a project, copy one whole `{ ... }` block and change its values (the `id` must be unique).

### Gallery photos
Copy your photos into `assets/images/photos/` and update the `photos` list in `js/config.js` (`src`, `alt`, `caption`). Cards are shown at a 4:5 (portrait) ratio and cropped to fit; the lightbox shows the full photo. Write a short, descriptive `alt` text for each one. Add or remove entries freely.

### Skills
Edit the `skills` list in `js/config.js`. Add new skills only once they are really part of your toolkit.

### Page title, description, and sharing preview
Edit the `<title>` and `<meta>` tags at the top of `index.html`. After you host the site, add an `og:image` tag (an absolute URL to a 1200x630 image) so links look good when shared.

## Contact form and admin inbox

The contact form sends to `POST /api/messages`; messages are saved in the PostgreSQL table `portfolio_messages`. Sign in at `/admin.html` using the `ADMIN_PASSWORD` environment variable to view, reply to by email, or delete submissions. Admin sessions are server-side, use an HTTP-only cookie, and are stored in PostgreSQL. Login and contact submissions are rate-limited.

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string from your hosting provider.
- `ADMIN_PASSWORD`: optional override for the default dashboard password `YA`. Use a strong private password in production; do not put it in frontend JavaScript or commit it to Git.
- `SESSION_SECRET`: a random secret of at least 32 characters. Keep it private.
- `NODE_ENV=production` in production hosting.

The backend must be deployed on a Node.js host and the PostgreSQL database must be attached/configured. A static-only host such as GitHub Pages cannot run `server.js` by itself. Set the host start command to `npm start`. Never share your database URL or admin password publicly.

## Publishing

Deploy this project to a Node.js host using `npm install` and `npm start`. A PostgreSQL database should be attached for persistent messages and sessions. Static-only hosting (GitHub Pages, static Netlify, or static Cloudflare Pages) cannot run this Express backend.

## Notes

- The Inter font loads from Google Fonts. If it is unavailable (for example offline), the site falls back to your system font.
- The site respects the "reduce motion" setting of the visitor's device.
- Project screenshots and the two gallery photos are your real images (resized and compressed). The profile photo is still a placeholder until you replace it.

## Theme switch

Use the Light mode / Dark mode control in the navigation. The preference is saved in the browser using `localStorage`.

## Admin dashboard

Open `admin.html`. The demo password is `change-this-password` and can be changed in `js/admin.js`. The dashboard can edit the project list and profile copy, and export/import a JSON backup.

**Important limitation:** this project is a static front-end. The dashboard password check and saved changes are client-side only; they are not secure authentication, and edits are stored only in the current browser. They will not automatically update the site for other visitors or publish to GitHub. For a genuinely secure admin system and shared content, connect a server-side authentication flow and database, then move project/profile storage to that backend.
