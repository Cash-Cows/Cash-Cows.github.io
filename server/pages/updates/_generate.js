const fs = require('fs')
const path = require('path')

// /{NETWORK}/updates/script.js
// /{NETWORK}/updates/style.css
// /{NETWORK}/updates/post/Some-Post-01012001.html
module.exports = async ({file, root, config, handlebars }) => {
  //if it's a post file html
  if (file.indexOf('/post/') >= 0 && path.extname(file) == '.html') {
    //get all the post files
    const folder = path.join(__dirname, 'post')
    const posts = []
    const files = await fs.promises.readdir(folder)
    for (const name of files ) {
      const post = path.join(folder, name)
      const stat = await fs.promises.stat(post)
      //if not a file
      if(!stat.isFile()) {
        console.error(`Skipping ${name}, not a file`)
        continue
      //if not an html
      } else if (path.extname(post) !== '.html') {
        console.error(`Skipping ${name}, not a html`)
        continue
      }

      const parts = name.split('-')
      const stamp = parts.pop()
      const month = stamp.substring(0, 2)
      const day = stamp.substring(2, 4)
      const year = stamp.substring(4, 8)
      const title = parts.join(' ')
      const template = fs.readFileSync(post, 'utf8')
      const posted = `${month}.${day}.${year}`
      const date = parseInt(`${year}${month}${day}`)
      const link = `updates/${name}`
      const canonical = `updates/${name}`

      posts.push({ link, canonical, name, title, date, posted, template })
    }

    posts.sort((a, b) => b.date - a.date)

    //compile each post file
    for( const post of posts) {
      const destination = path.join(config.build, `updates/${post.name}`)
      fs.writeFileSync(destination, handlebars.compile(post.template)({ nav: posts, post }))
    }

    //the index file should be the same as the last post (set canonical)
    const post = Object.assign({}, posts[0])
    post.link = 'updates/'
    const destination = path.join(config.build, `updates/index.html`)
    fs.writeFileSync(destination, handlebars.compile(post.template)({ nav: posts, post }))
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
}