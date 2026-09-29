# Placeholders to replace

Log anything temporary here. When it is replaced with the real thing, tick the box and note the date.

Page texts, links and contact details now live in Sanity (Site ayarları, Ana sayfa, Sayılar sayfası, Hakkında sayfası, Topluluk sayfası). Until `npm run seed` has been run in `studio/`, the site shows the built-in text from `src/data/defaults.ts`.

| Done | Item | Where | Replace with |
| --- | --- | --- | --- |
| [ ] | All invented copy: organisation name "Kentiz Şehircilik Topluluğu", email `hello@kentiz.example`, Instagram and LinkedIn URLs, About and Community text, events, footer texts | Sanity studio, singleton pages (seeded from `src/data/defaults.ts`) | Real text written and reviewed by the magazine team |
| [ ] | Mock issues shown after the real ones (10 sample PDFs, English covers, Turkish cover lines and credits) | `mockMagazines` in `src/data/magazines.ts`, `public/magazines/`, `VITE_MOCK_DATA` | Set `VITE_MOCK_DATA=false` before launch, then delete the mock data, PDFs and `scripts/make-samples.mjs` |
| [ ] | Logo (text wordmark in Bricolage Grotesque 800) | "Site adı" in Sanity, `.mark` in `src/styles.css` | Real logo, if there is one |
| [ ] | Favicon (empty `data:,`) | `index.html` | Real favicon |
| [ ] | Colour palette and fonts (cool paper background, ultramarine accent) | `:root` in `src/styles.css` | Brand colours and fonts |
| [ ] | Small interface texts that are not in the CMS (button labels such as "Bu sayıyı oku", "Editör", "Katkıda bulunanlar", error messages, screen reader labels) | Source files under `src/` | Reviewed wording |
