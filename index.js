const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const PORT = 53
const HOST = '8.8.8.8'

function sendQuery (buf) {
  client.send(buf, PORT, HOST, (err) => {
    if (err) throw err
    console.log('sent')
  })
}

client.on('message', (msg, cb) => {
  console.log('res', msg.toString('hex'))
  closeIt()
})

function closeIt () {
  console.log('closing')
  client.close()
}

function hexToString (hex) {
  const arr = []
  hex.match(/.{2}/g).map((cur) => {
    arr.push(String.fromCharCode(parseInt(cur, 16)))
  })
  return arr.join('')
}

function stringToHex (string) {
  const hex = []
  string.match(/.{1}/g).map((cur) => {
    const h = cur.charCodeAt().toString(16)
    if (h.length === 1) hex.push('0' + h)
    else hex.push(h)
  })
  return hex.join('')
}

function makeQuery (site) {
  const splitup = site.split('.')
  const hexString = []
  splitup.map((cur) => {
    const length = cur.length.toString(16)
    if (length.length === 1) hexString.push('0' + length)
    else hexString.push(length)

    hexString.push(stringToHex(cur))
  })
  hexString.push('00') // for the last . in url
  hexString.push('0001') // type
  hexString.push('0001') // class
  return hexString.join('')
}

const header = '26f501000001000000000000'
// const query = '14746865626573746d6f746865726675636b696e6707776562736974650000010001'
const query = makeQuery('thebestmotherfucking.website')
const buf1 = Buffer.from(header + query, 'hex')

sendQuery(buf1)
