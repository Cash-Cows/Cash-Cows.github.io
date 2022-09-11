const express = require('express')
const path = require('path')
const app = express()
const port = 3000

app.use(express.static(path.resolve(__dirname, '../docs')))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const fs = require('fs')
const glob = require('glob')
const chokidar = require('chokidar')
const handlebars = require('handlebars')

const config = {
  source: path.join(__dirname, 'src'),
  build: path.resolve(__dirname, '../docs'),
  compile: ['.html']
}

const watcher = chokidar.watch(config.source)
let ready = false

const setup = _ => {
  glob(`${config.source}/**`, (error, paths) => {
    if (error) return console.error(error)
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
    layout = path.join(config.source, layout)
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
  glob(`${config.source}/**`, (error, paths) => {
    if (error) return console.error(error)
    paths
      //look for files
      .filter(file => !fs.lstatSync(file).isDirectory())
      //look for templates
      .filter(file => path.basename(file).indexOf('_') !== 0)
      //compile templates
      .forEach(file => {
        //determine destination
        const destination = path.join(config.build, file.substring(config.source.length))
        if (!fs.existsSync(path.dirname(destination))) {
          fs.mkdirSync(path.dirname(destination), { recursive: true })
        }
        //if not a compilable extension
        if (config.compile.indexOf(path.extname(file)) === -1) {
          //only copy if this was the file changed
          if (changed !== file) return
          //pass through
          console.log('Copying', file, destination)
          return fs.copyFileSync(file, destination)
        }

        //if this is not the file that changed and not a partial
        if (changed !== file 
          && path.basename(changed).indexOf('_') !== 0
        ) return
        //otherwise compile it
        console.log('Compiling', file, destination)
        const template = handlebars.compile(fs.readFileSync(file, 'utf8'))
        fs.writeFileSync(destination, template())
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