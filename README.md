# Youssef Ayash - Portfolio

A responsive personal portfolio built with plain HTML, CSS, and vanilla JavaScript. No build step, no frameworks, no paid services.

## Run it locally

Option 1: double-click `index.html` to open it in your browser.

Option 2 (recommended): start a tiny local server from this folder.

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Project structure

```
index.html            Page structure (sections, dialogs, SEO tags)
css/styles.css        All styling and responsive rules
js/config.js          YOUR CONTENT: photo, links, skills, projects, gallery
js/main.js            Behaviour (menu, modals, lightbox, form, animations)
assets/images/        Images (placeholders you should replace)
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

## Contact form

A static website cannot send email by itself, so the form works in one of two honest ways:

1. **Email app (default when `contact.email` is set):** the form validates, then opens the visitor's email app with the message pre-filled. Nothing is sent until they press send there.
2. **Form service (optional):** create a free endpoint with a service such as Formspree or Web3Forms, then paste its URL into `contact.formEndpoint`. The form will then send the message directly and show a success or error message. Check that service's documentation for the exact request format it expects.

If neither is set, the form tells the visitor it is not connected yet.

## Publishing

Because it is static, you can host the folder for free on GitHub Pages, Netlify, or Cloudflare Pages by uploading the files as they are.

## Notes

- The Inter font loads from Google Fonts. If it is unavailable (for example offline), the site falls back to your system font.
- The site respects the "reduce motion" setting of the visitor's device.
- Project screenshots and the two gallery photos are your real images (resized and compressed). The profile photo is still a placeholder until you replace it.
