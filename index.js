const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const PORT = 53
const HOST = '8.8.8.8'

function sendQuery(buf) {
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

function stringToHex(string) {
  const hex = []
  string.match(/.{1}/g).map((cur) => {
    const h = cur.charCodeAt().toString(16)
    hex.push(getHex(h))
  })
  return hex.join('')
}

function makeQuery(url, queryType) {
  const splitUp = url.split('.')
  const hexString = []
  splitUp.map((cur) => {
    hexString.push(getHex(cur.length.toString(16)))
    hexString.push(stringToHex(cur))
  })
  hexString.push('00') // last . in url
  hexString.push(getType(queryType)) // type
  hexString.push('0001') // class
  return hexString.join('')
}

function getHex(h) {
  return (h.length === 1) ? '0' + h : h
}

function getType(type) {
  switch (type) {
    case 'ns':
      return '0002'
    case 'soa':
      return '0006'
    case 'cname':
      return '0005'
    case 'mx':
      return '000f'
    case 'txt':
      return '0010'
    case 'aaaa':
      return '001c'
    default:
      return '0001'
  }
}

function giveID () {
  const string = '0123456789abcdef'
  let id = ''
  let i = 0
  while (i < 4) {
    id += string.charAt(Math.floor(Math.random() * string.length))
    i += 1
  }
  return id
}

const id = giveID()
const flags = '0100'
const questionCount = '0001'
const answerRRs = '0000'
const authorityRRs = '0000'
const additionalRRs = '0000'
const header = id + flags + questionCount + answerRRs + authorityRRs + additionalRRs
const query = makeQuery('google.com', 'a')
const buf1 = Buffer.from(header + query, 'hex')

sendQuery(buf1)
