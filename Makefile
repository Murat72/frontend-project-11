develop:
	npx webpack serve
install:
	npm ci
build:
	NODE_ENV=production npx webpack
publish:
	npm publish --dry-run
lint:
	npx eslint