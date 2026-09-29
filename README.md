# Kentiz Magazine

A light-themed PDF magazine reader. Issues sit on a semi-circular, infinitely looping shelf. Click one and its cover flies into focus over a blurred background, then opens as a page-flip book: single-page front and back covers, two-page spreads inside.

## Run

```
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Content (Sanity CMS)

Editors use a hosted Sanity Studio (https://kentiz.sanity.studio). Everything is in Turkish and the site reads it at load time, so changes appear without a redeploy.

- **Dergi sayıları**: one document per issue (title, number, date, cover line, editor, contributors, PDF).
- **Site ayarları**: site name, browser tab title, organisation name, email, Instagram and LinkedIn, header and footer links, footer texts.
- **Ana sayfa**, **Sayılar sayfası**, **Hakkında sayfası**, **Topluluk sayfası**: titles, subtitles, body text (with headings, lists, bold and links) and the events list.

A page that has not been created in Sanity yet falls back to the built-in text in `src/data/defaults.ts`. The site shows real issues first, then the sample issues from `public/magazines/`; set `VITE_MOCK_DATA=false` to hide the samples.

### First-time setup for the pages

```
cd studio
npx sanity deploy    # publishes the updated editor
npm run seed         # creates the five page documents from the built-in text (never overwrites)
```

Then open the studio and edit. Remember to press Publish after each change.

### Environment

```
npx sanity login
npx sanity cors add http://localhost:5173       # and the production site URL, answering No to credentials
cp .env.example .env                            # VITE_SANITY_PROJECT_ID, in the root and in studio/
```

The first PDF page is the cover and the last is the back cover. If the page count is odd, a blank page is added before the back cover so the back cover stays single.

## How it works

- `src/Carousel.tsx`: arc layout, drag / wheel / arrow-key input, infinite wrap, cover-to-reader hand-off geometry.
- `src/Reader.tsx`: cover flight animation (Web Animations API), blurred backdrop, StPageFlip book, background page rendering.
- `src/pdf.ts`: pdf.js loading and page-to-image rendering.
