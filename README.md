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

# Development

To upgrade to a new version of wiki, update the version in
`package.json`, and then re-install dependencies:

    npm install

Probably also need to update the link for NPM global install

    npm install -g .

Use the instructions at the top of the page to re-generate a site and
run the simple http server to test that the updates work as expected.

Then commit and push the changes.

    git add .
    git commit -m "upgrade wiki to version..."
    TAG=$(npm version patch)
    git push --atomic origin main "$TAG"

# Development with a custom wiki client

    npm install $PATH_TO_CUSTOM/wiki-client/
    cd node_modules/wiki-client
    npm install
    npm install grunt
    npx grunt build
    cd ../..
    npm install -g .

Use the instructions at the top of the page to re-generate a site and
run the simple http server to test that the updates work as expected.

To reset the dev environment to a released version

    rm -rf node_modules
    npm install
    npm install -g .
