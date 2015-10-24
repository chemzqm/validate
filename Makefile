example:
	@cd example && webpack -d index.js bundle.js
	@open example/index.html

dev:
	@open http://localhost:8080/bundle
	@webpack-dev-server 'mocha!./test/test.js' --inline --hot

test:
	@./node_modules/.bin/karma start

.PHONY: test example
