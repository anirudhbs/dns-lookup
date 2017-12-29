const dgram = require('dgram')
const client = dgram.createSocket('udp4')

const PORT = 53
const HOST = '8.8.8.8'
const buf1 = Buffer.from('26f50100000100000000000014746865626573746d6f746865726675636b696e6707776562736974650000010001', 'hex')

client.send(buf1, PORT, HOST, (err) => {
  if (err) throw err
  console.log('sent')
})

client.on('message', (msg, cb) => {
  console.log(msg.toString('hex'))
  console.log(hexToString(msg.toString('hex')))
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
