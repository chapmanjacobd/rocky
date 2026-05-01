install:
	npm install
	npm run sync:data

serve:
	npm run dev -- --host 0.0.0.0

build:
	npm run build

lint:
	npm run lint

sync-data:
	npm run sync:data
