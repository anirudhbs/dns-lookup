const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const response = require('./response')

let query

function sendQuery(buf, HOST = '8.8.8.8', PORT = 53) {
  client.send(buf, PORT, HOST, (err) => {
    if (err) throw err
    query = buf.toString('hex')
    console.log('sent request')
  })
}

client.on('message', (msg) => {
  const responseObject = response.getObject(query, msg.toString('hex'))
  printResponse(responseObject)
  closeIt()
})

function closeIt() {
  client.close(() => {
    console.log('closed socket')
  })
}

function printResponse(res) {
  console.log(JSON.stringify(res, null, 2))
}

module.exports = {
  sendQuery
}
