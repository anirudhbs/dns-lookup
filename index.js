const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const PORT = 53
const HOST = '8.8.8.8'

function sendQuery (buf) {
  client.send(buf, PORT, HOST, (err) => {
    if (err) throw err
    console.log('sent request')
  })
}

client.on('message', (msg, cb) => {
  console.log('res', msg.toString('hex'))
  closeIt()
})

function closeIt () {
  console.log('closing socket')
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

function makeQuery (url, queryType) {
  const splitUp = url.split('.')
  const hexString = []
  splitUp.map((cur) => {
    const length = cur.length.toString(16)
    if (length.length === 1) hexString.push('0' + length)
    else hexString.push(length)

    hexString.push(stringToHex(cur))
  })
  hexString.push('00') // for the last . in url
  hexString.push(getType(queryType)) // type
  hexString.push('0001') // class
  return hexString.join('')
}

function getType (type) {
  switch (type) {
    case 'ns': return '0002'
    case 'soa': return '0006'
    case 'cname': return '0005'
    case 'mx': return '000f'
    case 'txt': return '0010'
    case 'aaaa': return '001c'
    default: return '0001' // 'a'
  }
}

const header = '26f501000001000000000000'
const query = makeQuery('google.com', 'a')
const buf1 = Buffer.from(header + query, 'hex')

sendQuery(buf1)
