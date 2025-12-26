Minimal Portfolio Site for Sumit

This repository branch `portfolio-site` contains a lightweight portfolio site meant for use on GitHub Pages. It is built with plain HTML, CSS, and minimal vanilla JavaScript — no frameworks, no build step.

Structure
- index.html             -> Home page with intro + featured projects
- projects.html          -> Projects listing (dynamic)
- project.html           -> Single project detail loaded by ?id=project-id
- assets/
  - css/style.css
  - js/main.js
  - images/ (svg placeholders)
  - videos/ (placeholder)
- data/projects.json     -> All project metadata (single source of truth)
- slides/, pbix/         -> placeholders for slide decks and PBIX files

How it works
- All project content is read from data/projects.json. Both projects.html and project.html fetch this file and render UI.
- Embeds supported: images, YouTube/mp4 videos, Streamlit (iframe with ?embed=true), Power BI iframe, PBIX download link, Slide PDF iframe.

Add a new project
1. Edit data/projects.json and add a new object with these fields:
   - id (unique slug eg: "customer-retention")
   - title
   - short_description
   - full_description
   - problem_statement
   - approach
   - outcomes
   - tools (array)
   - images (array of paths under /assets/images)
   - video_url (YouTube link or mp4 path)
   - streamlit_url (ex: https://share.streamlit.io/your-app)
   - powerbi_embed_url (iframe embed URL)
   - pbix_download_path (eg: /pbix/your-file.pbix)
   - slide_pdf_path (eg: /slides/your-slides.pdf)
   - github_repo_link
2. Commit your changes. The site will pick up changes on deploy.

Embed Streamlit
- Provide the full streamlit app URL in streamlit_url. The site will append ?embed=true when creating the iframe, per Streamlit embedding guidance.

Add PBIX files
- Upload PBIX files to the /pbix directory (or another path in the repo) and set pbix_download_path to the file path. If a Power BI embed URL is present, the iframe will be used instead.

Publish via GitHub Pages
1. Ensure branch `portfolio-site` is pushed to GitHub (this branch currently contains the site files).
2. In the repository Settings > Pages, choose Branch: `portfolio-site` and folder: `/ (root)` and Save.
3. After a minute the site will be available at https://<your-username>.github.io/<repo>/ or for a user/organization page (username.github.io) the repo root will be the site.

Notes
- This site is intentionally minimal and professional for interview/demo purposes.
- To preview locally, use a simple static server to avoid fetch errors when opening files directly, e.g.:
  - Python 3: python -m http.server 8000
  - npm: npx http-server .

If you prefer the site to work purely by double-clicking index.html without a local server, I can add an embedded JSON fallback (duplicate of data/projects.json) inside each HTML file. Currently the site expects to be served over HTTP or GitHub Pages.

