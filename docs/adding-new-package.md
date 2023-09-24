# Adding new component

To add a new component:

1. Run `npx nx g @nrwl/js:lib <component-name> --publishable=true --importPath='@rpidanny/<component-name>-quill'`
2. Run `npx nx generate @nrwl/workspace:run-commands release --command='npx semantic-release-plus --extends ./packages/<component-name>/release.config.js' --project=<component-name>`
3. Copy `release.config.js` from one of the existing packages
4. Copy `publishConfig` and `repository` from an existing package's `package.json` into the new `package.json` and edit them as needed.
