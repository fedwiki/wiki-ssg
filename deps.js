import fs from "fs/promises"
import path from "path"
import util from "util"
import globNp from "glob"
const glob = util.promisify(globNp)
import mkdirp from "mkdirp"
import hb from "handlebars"

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export {fs, path, glob, mkdirp, hb, require}
