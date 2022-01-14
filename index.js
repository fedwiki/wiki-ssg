import {minimist, fs, path, glob, mkdirp, hb, require} from "./deps.js"

function usage() {console.log(`
  wiki-ssg build --from <dir> --dest <dir>

  generates a static wiki site

  Options:
    --from <folder> ... copy wiki pages and assets from the specified folder
    --dest <folder> ... generate the static site in the specified folder

`)}

let DATA, BASE, CLIENT, SERVER, DEPS, ownedBy

export async function main() {
  await parseArgv()

  await Promise.all([
    copyWikiClientCode(),
    createFactories(),
    copyPlugins(),
    copySecurityFriends(),
    copyDefaultData(),
    copyWikiData()
  ])
}

const htmlTemplate = await createTemplate("wiki-client/views/static.html")
async function parseArgv() {
  let args = minimist(process.argv.slice(2))
  let [cmd] = args._
  switch (true) {
  case cmd == "build":
    DATA = path.resolve("./data")
    BASE = path.resolve(".", "docs")
    CLIENT = path.resolve(require.resolve("wiki-client/package.json"), "..")
    SERVER = path.resolve(require.resolve("wiki-server/package.json"), "..")
    DEPS = path.join(CLIENT, "..")
    ownedBy = await owner()
    break
  case args.version || args.v || cmd == "version":
    console.log(await version())
    process.exit(1)
  case args.help || args.h || cmd == "help":
  default:
    usage()
    process.exit(1)
  }
}

async function version() {
  let pkg = JSON.parse(
    await fs.readFile(new URL("package.json", import.meta.url) , "utf8"))
  return pkg.version
}

const writers = new Map()
function guard(filename, fn) { // serialize writes to the same file
  let p = writers.has(filename)
      ? writers.get(filename)
      : Promise.resolve()
  writers.set(filename, p.then(fn))
  return p
}

async function owner() {
  let ownerfile = path.join(DATA, "status", "owner.json")
  try {
    let json = JSON.parse(await fs.readFile(ownerfile, "utf8"))
    return json.name
  } catch (error) {
    console.error({error})
    return "Anonymous"
  }
}

async function copyWikiClientCode() {
  for (let filename of await findfiles(path.join(CLIENT, "client", "**"))) {
    let destination = path.join(
      BASE,
      filename.slice(path.join(CLIENT, "client").length)
    )
    copyp(filename, destination)
  }
}

async function createFactories() {
  let factoriesfile = path.join(BASE, "system", "factories.json")
  await mkdirp(path.dirname(factoriesfile))
  Promise.all(
    (await findfiles(path.join(DEPS, "wiki-plugin-*/factory.json")))
      .map(async factory => require(factory))
  ).then(factories => {
    guard(factoriesfile, () =>
      fs.writeFile(factoriesfile, JSON.stringify(factories, null, 2)))
  })
}

async function copyPlugins() {
  for (let name of await findfolders(path.join(DEPS, "wiki-plugin-*", "client"))) {
    let plugin = name.slice(0, -8)
    let type = plugin.slice(path.join(DEPS, "wiki-plugin-").length)
    let pluginsdir = path.join(BASE, "plugins", type)

    copyCode(name, pluginsdir)
    copyPages(
      await findfiles(path.join(plugin, "pages", "**")),
      json => {json.plugin = type})
  }
}

async function copyCode(source, destination) {
  let sources = await findfiles(path.join(source, "**"))
  sources.map(async file => {
    copyp(
      file,
      path.join(destination, file.slice(source.length))
    )
  })
}

async function copyPages(pages, jsonfn=x=>x) {
  pages.map(async name => {
    let slug = path.basename(name)
    let jsonFile = path.join(BASE, `${slug}.json`)
    fs.readFile(name, "utf8").then(JSON.parse).then(async json => {
      jsonfn(json)
      let string = JSON.stringify(json, null, 2)
      guard(jsonFile, () =>
        fs.writeFile(jsonFile, string).catch(error => console.error({error})))
    })
    let htmlFile = path.join(BASE, `${slug}.html`)
    await mkdirp(path.dirname(htmlFile))
    guard(htmlFile, () =>
      fs.writeFile(htmlFile, htmlTemplate({ownedBy,pages: [{page: slug}]}))
        .catch(err => console.error({err})))
  })
}

async function copySecurityFriends() {
  return await copyCode(
    path.join(DEPS, "wiki-security-friends", "client"),
    path.join(BASE, "security")
  )
}

async function copyDefaultData() {
  copyPages(await findfiles(path.join(SERVER, "default-data", "pages", "**")))
  copyp(
    path.join(SERVER, "default-data", "status", "favicon.png"),
    path.join(BASE, "favicon.png"))
}

async function copyWikiData() {
  copyPages(await findfiles(path.join(DATA, "pages", "**")))
  let STATUS = path.join(DATA, "status")
  for (let filename of await findfiles(path.join(STATUS, "site*json"))) {
    let destination = path.join(BASE,"system", filename.slice(STATUS.length))
    copyp(filename, destination)
  }
  copyp(
    path.join(STATUS, "sitemap.xml"),
    path.join(BASE, "sitemap.xml"))
  for (let filename of await findfiles(path.join(DATA, "assets", "**"))) {
    let destination = path.join(
      BASE, filename.slice(path.join(DATA).length))
    copyp(filename, destination)
  }
  copyp(
    path.join(DATA, "status", "favicon.png"),
    path.join(BASE, "favicon.png")
  ).catch (error => {
    if (error.code != 'ENOENT') {
      throw error
    }
    console.log("No favicon.png found in data/status. We'll just keep the default.")
  })
  copyp(
    path.join(DATA, "assets", "wiki", "CNAME"),
    path.join(BASE, "CNAME")
  )
  copyp(
    path.join(DATA, "assets", "wiki", "404.html"),
    path.join(BASE, "404.html")
  )
  copyp(
    path.join(BASE, "welcome-visitors.html"),
    path.join(BASE, "index.html")
  )
}

function createTemplate(filename) {
  return fs.readFile(require.resolve(filename), "utf8")
    .then(hb.compile)
}

async function copyp(source, destination) {
  // ensure path to destination exists before copying
  await mkdirp(path.dirname(destination))
  guard(destination, () =>
    fs.copyFile(source, destination))
}
const findfiles = pattern => glob(pattern, {nodir: true})
const findfolders = pattern => glob(path.join(pattern, "/"))

await main()
