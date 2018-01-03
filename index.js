const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const query = require('./src/query.js')

const HOST = '8.8.8.8'
const PORT = 53

function sendQuery (buf) {
  client.send(buf, PORT, HOST, (err) => {
    if (err) throw err
    console.log('sent request')
  })
}

client.on('message', (msg, cb) => {
  console.log('res', msg.toString('hex'))
  console.log(hexToString(msg.toString('hex')))
  closeIt()
})

function closeIt () {
  client.close(() => {
    console.log('closed socket')
  })
}

function hexToString (hex) {
  const arr = []
  hex.match(/.{2}/g).map((cur) => {
    arr.push(String.fromCharCode(parseInt(cur, 16)))
  })
  return arr.join('')
}

const query1 = query.formRequest('google.com', 'a')
const buf = Buffer.from(query1, 'hex')

sendQuery(buf)
