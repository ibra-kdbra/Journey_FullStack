# Solid.js Web Application UI

This is the UI for the Solid.js Flask web application emplate.
It is based on [daisyui](https://daisyui.com/) and [tailwindcss](https://tailwindcss.com/).
For other dependencies, see the `package.json` file.

## Installation

To run the frontend server, simply run the following commands:

```bash
cd ui/
make deps
make server
```

## End-to-end tests

`cypress/e2e` holds four specs: `home_page`, `authentication`, `admin` and
`locale`. They drive a real browser against a running application, so three
things have to be up before they will pass.

1. **The API, with its database seeded.** `authentication.cy.js` and
   `admin.cy.js` both open with

   ```js
   cy.exec('cd ../api && source .env/bin/activate && make fixtures')
   ```

   so they expect the sibling `api/` project to have a virtualenv at
   `api/.env` (`python -m venv .env`, as the repository README describes) and
   a database `make fixtures` can populate.

2. **The dev server on http://localhost:5173.** That is `cypress.config.js`'s
   `baseUrl` and the port `vite.config.js` pins. Start it with `make server`.

3. **Cypress's own binary**, which npm fetches from `download.cypress.io` on
   install. Environments that block that host install the package without it,
   and the run stops at "Cypress executable not found" - the wiring is fine,
   the binary is absent.

Then:

```bash
make test_e2e   # headless, the CI-shaped invocation
make cypress    # interactive, opens the Cypress app
```

Both go through npm scripts (`test:e2e` and `cypress:open`) so they work
whether you prefer make or npm.

These specs are **not** run by CI. Doing that means standing up the API and its
database alongside the dev server in the workflow, which is a larger piece of
work than adding a step; `.github/projects.json` records `test: false` for this
project and says so.

## Versions

- Node v23
- For the rest see `package.json`
