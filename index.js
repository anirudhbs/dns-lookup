const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const query = require('./src/query')
const response = require('./src/response')

function sendQuery(buf, HOST = '8.8.8.8', PORT = 53) {
  client.send(buf, PORT, HOST, (err) => {
    if (err) throw err
    console.log('sent request')
  })
}

client.on('message', (msg) => {
  const responseObject = response.getObject(query1, msg.toString('hex'))
  printResponse(responseObject)
  closeIt()
})

function closeIt() {
  client.close(() => {
    console.log('closed socket')
  })
}

let query1

function lookup(domain, type, recursive) {
  query1 = query.formRequest(domain, type, true)
  const buf = Buffer.from(query1, 'hex')
  sendQuery(buf)
}

function printResponse(res) {
  console.log(JSON.stringify(res, null, 2))
}

lookup('geekskool.com', 'ns', true)
