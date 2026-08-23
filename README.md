# Ahmed Azeez Portfolio and Blog

This repository contains the source code for Ahmed Azeez's personal portfolio and blog website. It is built with [Hugo](https://gohugo.io/) and a custom `data-science` theme. The site presents a professional profile, research writing, certifications, public-health applications, and selected projects.

## Repository structure

| Path | Purpose |
|---|---|
| `config.toml` | Hugo configuration, site metadata, permalink rules, taxonomies, social links, and syntax-highlighting settings. |
| `content/` | Source content for the About, Certificates, Apps, Contact, Authors, and blog sections. |
| `static/` | Files copied directly to the generated site, including images, JavaScript, standalone applications, favicons, and the downloadable CV under `static/cv/`. |
| `themes/data-science/` | Custom Hugo theme containing layouts, reusable partials, CSS, JavaScript, SVG icons, and the content archetype. |
| `layouts/` | Site-level layout overrides and custom Hugo shortcodes. |
| `public/` | Generated static output produced by Hugo. |
| `.github/workflows/hugo.yml` | GitHub Actions workflow that builds and deploys the site to GitHub Pages. |

## Local development

Install Hugo Extended, then run the following command from the repository root:

```bash
hugo server -D
```

The local development site will be available at `http://localhost:1313/`.

To create a production build locally, run:

```bash
hugo --gc --minify
```

The generated files will be written to `public/`.

## GitHub Pages deployment

The website is deployed **only through GitHub Pages**. The GitHub Actions workflow in `.github/workflows/hugo.yml` runs automatically whenever changes are pushed to the `main` branch. It can also be started manually from the repository's **Actions** tab.

The workflow performs four steps:

1. It checks out the repository and installs Hugo Extended.
2. It builds the site with garbage collection and minification enabled.
3. It uploads the generated `public/` directory as a Pages artifact.
4. It publishes the artifact through the `github-pages` environment.

In the repository settings, configure **Settings → Pages → Source** as **GitHub Actions**. The public site URL is:

<https://ahmed-azeez.github.io/>

## Updating the CV

Replace the existing file at `static/cv/Ahmed_Azeez_Hasan_CV.pdf` with the updated PDF using the same filename. Commit and push the change to `main`; GitHub Actions will rebuild the site and publish the new CV automatically. The download link is maintained on the About page.
