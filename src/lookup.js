const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const response = require('./response')

function sendQuery (buf, HOST = '8.8.8.8', cb) {

  client.send(buf, 53, HOST, (err) => {
    if (err) throw err
  })

  client.on('message', (msg) => {
    const responseObject = response.getObject(msg.toString('hex'))
    client.close(() => {
    })
    cb(null, responseObject)
  })
}

module.exports = {
  sendQuery
}
