# Wiki Static Site Generator

First, install and run a local wiki.

    npm install -g wiki
    wiki \
      --security_type=friends \
      --data ./data

Visit http://localhost:3000.
Claim the wiki as your own.
Choose a flag.
Create a few pages.

Quit the local wiki server.

Generate the static site.

    npx wiki-ssg build --from data --dest site

Run a simple http server.

    npx http-server site

Visit http://localhost:8080 to test the static wiki.
