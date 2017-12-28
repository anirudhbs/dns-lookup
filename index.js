const dgram = require('dgram')
const client = dgram.createSocket('udp4')

const PORT = 53
const HOST = '8.8.8.8'
const buf1 = Buffer.from('26f50100000100000000000014746865626573746d6f746865726675636b696e6707776562736974650000010001', 'hex')
// const buf2 = Buffer.from('World!')

client.send(buf1, PORT, HOST, (err) => {
  if (err) throw err
  console.log('UDP message sent to', HOST, ':', PORT)
})

client.on('message', (msg) => {
  console.log(msg.toString('hex'))
})

// client.close()
