const express = require('express')
const path = require('path')
const app = express()
const port = 3000

const config = {
  source: path.join(__dirname),
  build: path.resolve(__dirname, '../docs'),
  compile: ['.html', '.js', '.css']
}

app.use(express.static(config.build))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const fs = require('fs')
const glob = require('glob')
const chokidar = require('chokidar')
const handlebars = require('handlebars')

const watcher = chokidar.watch(config.source)
let ready = false
const setup = _ => {
  glob(`${config.source}/**`, (error, paths) => {
    paths
      //look for files
      .filter(file => !fs.lstatSync(file).isDirectory())
      //look for extensions
      .filter(file => config.compile.indexOf(path.extname(file)) !== -1)
      //look for partials
      .filter(file => path.basename(file).indexOf('_') === 0)
      //register partials
      .forEach(file => handlebars.registerPartial(
        path.basename(file, path.extname(file)),
        fs.readFileSync(file, 'utf8')
      ))
  })
  
  handlebars.registerHelper('layout', (layout, options) => {
    layout = path.join(config.source, 'layouts', layout)
    if (!fs.lstatSync(layout).isFile()) {
      return console.error(`${layout} not found`)
    }

    const template = handlebars.compile(fs.readFileSync(layout, 'utf8'))

    return template(Object.assign({ 
      content: options.fn(options.hash) 
    }, options.hash))
  })

  handlebars.registerHelper('when', (left, compare, right, options) => {
    let valid = false;

    switch (true) {
      case compare == '==' && left == right:
      case compare == '===' && left === right:
      case compare == '!=' && left != right:
      case compare == '!==' && left !== right:
      case compare == '<' && left < right:
      case compare == '<=' && left <= right:
      case compare == '>' && left > right:
      case compare == '>=' && left >= right:
      case compare == '&&' && (left && right):
      case compare == '&&!' && (left && !right):
      case compare == '!&&' && (!left && right):
      case compare == '!&&!' && (!left && !right):
      case compare == '||' && (left || right):
      case compare == '||!' && (left || !right):
      case compare == '!||' && (!left || right):
      case compare == '!||!' && (!left || !right):
        valid = true;
        break;
    }

    if (valid) {
      return options.fn(this);
    }

    return options.inverse(this);
  })
  
  ready = true
}

const compile = changed => {
  if (!ready) return
  glob(`${config.source}/pages/**`, (error, paths) => {
    if (error) return console.error(error)
    const root = path.join(config.source, 'pages')
    paths
      //dont include folders
      .filter(file => !fs.lstatSync(file).isDirectory())
      //dont include templates
      .filter(file => path.basename(file).indexOf('_') !== 0)
      //only the file changed
      .filter(file => changed === file)
      .forEach(file => {
        //look for _generate.js
        const generate = path.resolve(
          root, 
          file.substring(root.length + 1).split('/')[0],
          '_generate.js'
        )

        if (fs.existsSync(generate)) {
          delete require.cache[generate]
          const generator = require(generate)
          if (typeof generator === 'function') generator({
            file, 
            root, 
            config, 
            handlebars
          })
          return
        }

        const destination = path.join(
          config.build, 
          file.substring(root.length + 1)
        )
        if (!fs.existsSync(path.dirname(destination))) {
          fs.mkdirSync(path.dirname(destination), { recursive: true })
        }
        console.log('Compiling', file, destination)
        fs.writeFileSync(destination, handlebars.compile(
          fs.readFileSync(file, 'utf8')
        )())
      })
  })
  glob(`${config.source}/public/**`, (error, paths) => {
    if (error) return console.error(error)
    const root = path.join(config.source, 'public')
    paths
      //look for files
      .filter(file => !fs.lstatSync(file).isDirectory())
      //only the file changed
      .filter(file => changed === file)
      .forEach(file => {
        const destination = path.join(
          config.build, 
          file.substring(root.length + 1)
        )
        console.log('Copying', file, destination)
        if (!fs.existsSync(path.dirname(destination))) {
          fs.mkdirSync(path.dirname(destination), { recursive: true })
        }
        fs.copyFileSync(file, destination)
      })
  })
}

const rmfile = path => {
  console.log('rmfile', path)
}

watcher
  .on('ready', setup)
  .on('add', compile)
  .on('change', compile)
  .on('unlink', rmfile)