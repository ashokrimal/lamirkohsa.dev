# Personal Portfolio

A personal portfolio website for [ashokrimal.com.np](https://ashokrimal.com.np).

## ✨ Features

- **Home**: Welcome section showcasing a brief introduction.
- **About Me**: Detailed information about Ashok Rimal.
- **Services**: Overview of services provided.
- **Portfolio**: Showcase of previous works and projects.
- **Contact**: A section to get in touch via email or other means.

## 💻 Technologies Used

- **Programming Languages**: HTML, CSS, JavaScript
- **Development Tools**: macOS, VS Code
- **AI Support**: ChatGPT for assistance and development

## 🚀 Installation Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/ashokrimal/lamirkohsa.dev.git

## Admin studio

The public site reads everything from the Drizzle CMS; nothing is hardcoded.

1. Deploy with `DATABASE_URL` set.
2. Open `/admin/sign-in`. While no owner exists, that page shows a one-time
   **Create the owner account** form. The password is stored as a salted scrypt
   hash in the `adminCredential` table (created on first setup).
3. Signed-out visits to `/admin` and `/admin/account` redirect to
   `/admin/sign-in`; there is no demo account or unauthenticated fallback.
4. Change the password from `/admin/account`.
5. `/admin?section=setup` lists every CMS area the site reads, grouped by page,
   with links to its editor and buttons to add projects, photos and tracks.

`ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are only an optional
bootstrap for the first login. Once you change the password, the database
account wins over those variables.

Device uploads use Vercel Blob, so set `BLOB_READ_WRITE_TOKEN` (Vercel →
Storage → Blob, or an integration that provides it). Without it the studio keeps
the paste-a-URL option and explains why the file picker is unavailable.

Other integrations are configured through environment variables, never source
code: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `GITHUB_TOKEN`, `SPOTIFY_*`,
`LASTFM_API_KEY` and `GOOGLE_*` for Drive imports. Public usernames (GitHub,
MyAnimeList, AniList, Last.fm, ListenBrainz, Spotify) are edited at
`/admin?section=settings`. API secrets deliberately stay out of the CMS.
