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
  console.log(JSON.stringify(response.getObject(query1, msg.toString('hex'), domain), null, 2))
  closeIt()
})

function closeIt() {
  client.close(() => {
    console.log('closed socket')
  })
}

function hexToString(hex) {
  const arr = []
  hex.match(/.{2}/g).map((cur) => {
    arr.push(String.fromCharCode(parseInt(cur, 16)))
  })
  return arr.join('')
}

const domain = 'reddit.com'
const type = 'mx'
const query1 = query.formRequest(domain, type, true)
const buf = Buffer.from(query1, 'hex')
sendQuery(buf)
