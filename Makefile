
PATH := node_modules/.bin:$(PATH)
SHELL := /bin/bash -e -o pipefail

VERSION := patch

node_modules: package.json
	@npm prune
	@npm install
	@touch node_modules

clean:
	@$(RM) -fr node_modules $(STANDALONE).js
	@$(RM) -fr npm-debug.log

test: node_modules
	tape test/test-powerwalk.js

release:
	npm version $(VERSION)
	git push && git push --tags
	npm publish

.PHONY: clean release test
