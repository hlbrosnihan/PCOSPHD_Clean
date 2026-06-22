# PCOS PhD Website (clean)

Clean, deduplicated rebuild of the pcosphd.coventry.domains site, with the
Mapping Tool survey integrated.

## Run
```
npm install
npm run dev      # http://localhost:3000
npm run build    # outputs to build/
```

## Structure
```
index.html              → loads /src/main.tsx
src/
  main.tsx              → entry (BrowserRouter + App)
  App.tsx              → routes (incl. /mapping-survey)
  index.css            → pre-compiled Tailwind v4 (static, no build step needed)
  styles/globals.css
  assets/              → images (figma assets + blog header)
  components/
    HomePage, BlogPage, AboutResearch, AboutResearcher,
    JoinResearch, SurveyPage, Header, ContactFormModal
    MappingToolSurvey_v4.tsx   → survey with the mapper embedded via iframe
    figma/ImageWithFallback.tsx
    ui/                → shadcn/ui components
vite.config.ts          → build config (figma:asset aliases, outDir: build)
```

## Routes
/, /blog, /researcher, /research, /join, /survey, /mapping-survey, * (-> home)

## Notes
- The mapping survey loads the Care Ecosystem Mapper from /mapper/index.html
  (deploy the mapper separately to public_html/mapper/).
- Survey data POSTs to /mapping-submit.php and /mapping-contacts.php
  (deploy those + their data folders to public_html/ — see the deploy bundle).
- Tailwind is pre-compiled into src/index.css; there is no tailwind.config or
  build-time Tailwind dependency.
- Removed from the old project: root-level duplicate .tsx files and the orphan
  HomePageo.tsx (nothing imported it).
