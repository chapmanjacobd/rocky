# True Pup Safari

A creative React/Vite site built around the Rocky dog sculpture archive in `/mnt/d8/archive/image/MacombRocky`.

## Experience

- **Safari-first flow**: users move through a sequence of Rocky encounters before the app reveals their "true pup"
- **Boyfriend tone**: earnest, dramatic, slightly absurd, and character-route driven
- **Physical POIs stay secondary**: each sculpture can surface a Google Maps link, but the site never requires travel
- **Full roster browsing**: all 132 sculptures are available in a searchable, filterable archive

## Data pipeline

The app copies the Rocky `.avif` images into `public/rockys/` and generates `public/rockys-data.json` from the CSV.

```bash
npm run sync:data
```

By default the sync script reads from:

```bash
/mnt/d8/archive/image/MacombRocky
```

You can override that path with:

```bash
ROCKY_SOURCE_DIR=/some/other/path npm run sync:data
```

## Local development

```bash
npm install
npm run dev
```

Or with make:

```bash
make install
make serve
```

## Production build

```bash
npm run build
```
