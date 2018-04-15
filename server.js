require('dotenv').config()
const express = require('express')
const path = require('path')
const debug = require('debug-levels')('server')
const DbConn = require('./server/lib/DbConn')
const uniqueValue = require('./server/lib/lib')

const app = express()

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './client/index.html'))
})

app.get('/new/*', async (req, res) => {
  const url = req.params[0]
  debug.debug('url', url)

  const urlPattern = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g
  if (!urlPattern.test(url)) {
    res.json({
      error: 'Wrong url format, make sure you have a valid protocol and real site.'
    })
    return
  }

  const formShortUrl = uniq => {
    const localPort = process.env.NODE_ENV === 'development' ? ':' + port : ''
    return `${process.env.BASE_DOMAIN}${localPort}/${uniq}`
  }

  const coll = DbConn.getColl()
  const mongoRes = await coll.findOne({origin: url})

  if (!mongoRes) {
    const uniq = uniqueValue()

    await coll.insert({
      origin: url,
      short: uniq
    })

    res.json({
      original_url: url,
      short_url: formShortUrl(uniq)
    })
    return
  }

  res.json({
    original_url: mongoRes.origin,
    short_url: formShortUrl(mongoRes.short)
  })
})

app.get('/:link', async (req, res) => {
  const {link} = req.params

  const coll = DbConn.getColl()

  const mongoRes = await coll.findOne({short: link})

  if (!mongoRes) {
    res.json({
      error: 'This url is not on the database.'
    })
    return
  }

  const redirectLink = mongoRes.origin.includes('http') ? mongoRes.origin : `http://${mongoRes.origin}`
  res.redirect(redirectLink)
})


async function startUp() {
  await DbConn.init()

  app.listen(port, () => debug.info('url-microservice is on port', port))
}

startUp()
