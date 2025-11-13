# Rivermark University Public Site (Fictional)

## Overview
This repository contains a fully static, fictional public website for **Rivermark University**. All names, people, and organizations are fictional. The site showcases responsive layouts, admissions guidance, program search, research highlights, and structured data suited for demos.

## Project Structure
```
public/         # HTML pages, API endpoint JSON copies, sitemap, RSS, robots.txt
css/            # Global stylesheet
js/             # Minimal client-side interactions and data loaders
data/           # Canonical JSON data sources and SQL seed script
images/         # Placeholder asset manifest and empty image files
```

## Running Locally
Use any static server from the repository root. Examples:

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node
npx http-server -p 8000
```

Then open `http://localhost:8000/public/index.html`.

### Viewing API JSON
The JSON APIs are available under `/public/api/`. Example URLs once the server is running:

- `http://localhost:8000/public/api/faculties.json`
- `http://localhost:8000/public/api/departments.json`
- `http://localhost:8000/public/api/courses.json?facultyId=fac-eng&level=Undergraduate&q=river` (client-side filtering handled in `app.js`)
- `http://localhost:8000/public/api/lecturers.json`
- `http://localhost:8000/public/api/news.json`

## Placeholder Images
All image files are empty placeholders. Replace them with photography or illustrations as needed. The `images/placeholder-manifest.txt` file lists recommended dimensions and a royalty-free placeholder URL pattern.

## Customizing Content
- Update copy by editing the HTML in `public/` or the JSON data in `data/`.
- Client-side rendering logic lives in `js/app.js`. Update selectors or add new interactions there.
- Styles are centralized in `css/style.css` using CSS custom properties for the color palette and spacing scale.

## Data Sources
Primary JSON data lives in the `data/` directory. After editing these files, re-run the SQL generator if needed:

```bash
python /tmp/generate_seed_sql.py
```

This produces `data/seed_sql.sql` with up-to-date INSERT statements for Postgres.

## Replacing Photos
1. Prepare new images matching the dimensions noted in `images/placeholder-manifest.txt`.
2. Replace the placeholder files in `images/` with your assets, keeping filenames identical.
3. Update HTML `img` alt text if descriptions change.

## Safety Notice
**All names, people, locations, and organizations in this project are fictional.** Contact numbers use the `+000` mock prefix. Update responsibly for demos without referencing real individuals or institutions.
