# npm Supply-Chain Basics

This repo uses npm-native guardrails instead of custom dependency scanners.

## Defaults

- `save-exact=true` pins newly saved dependency versions in `package.json`.
- `package-lock=true` keeps the exact resolved tree in `package-lock.json`.
- `min-release-age=7` avoids installing versions published in the last 7 days
  when npm 11.10.0 or newer is resolving dependencies.
- `ignore-scripts=true` prevents dependency lifecycle scripts from running
  automatically during install. Project scripts such as `npm run sentinel`
  still work.

## Install And Update

Use the lockfile for normal setup:

```bash
npm ci
npm run deps:audit
```

When adding or updating a package:

```bash
npm install <package>@<version>
npm run deps:audit
npm audit signatures
```

Review the `package.json` and `package-lock.json` diff before committing. If a
package genuinely needs install scripts, run that package's build explicitly
after reviewing it instead of turning scripts on globally.
