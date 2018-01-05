const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const response = require('./response')

function sendQuery(buf, HOST = '8.8.8.8', cb) {
  let query
  client.send(buf, 53, HOST, (err) => {
    if (err) throw err
    console.log('sent request')
    query = buf.toString('hex')
  })

  client.on('message', (msg) => {
    const responseObject = response.getObject(query, msg.toString('hex'))
    client.close(() => {
      console.log('closed socket')
    })
    cb(null, responseObject)
  })
}

module.exports = {
  sendQuery
}
