const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const response = require('./response')

function sendQuery (buf, HOST = '8.8.8.8', cb) {
  const query = {}

  client.send(buf, 53, HOST, (err) => {
    if (err) throw err
    query.data = buf.toString('hex')
  })

  client.on('message', (msg) => {
    const responseObject = response.getObject(query.data, msg.toString('hex'))
    client.close(() => {
    })
    cb(null, responseObject)
  })
}

module.exports = {
  sendQuery
}
