# Wiki Static Site Generator

First, run a local wiki.

    npx wiki \
      --packageDir node_modules \
      --security_type=friends \
      --data ./data

Visit http://localhost:3000.
Claim the wiki as your own.
Choose a flag.
Create a few pages.

Quit the local wiki server.

Generate the static site.

    npx wiki-ssg

Run a simple http server.

    npx http-server docs

Visit http://localhost:8080 to test the static wiki.
