const req = '8623010000010000000000000866616365626f6f6b03636f6d0000020001'
const res = '8623818000010002000000000866616365626f6f6b03636f6d0000020001c00c00020001000053ba00070161026e73c00cc00c00020001000053ba00040162c02c'
const name = 'PLACEHOLDERNAME'

const answerCount = () => parseInt(res.slice(12, 16))

function separateAnswers() {
  const answers = res.slice(req.length)
  const ans = answers.split('c00c').slice(1)
  return ans.slice(0, ans.length - 1)
}

function getObject() {
  const answerArray = []
  const answers = separateAnswers()
  answers.map((cur) => {
    let obj = {}
    obj.name = name
    obj.type = getType(cur.slice(0, 4))
    obj.class = getClass()
    obj.ttl = getTimeToLive(cur.slice(8, 16))
    obj.length = getLength(cur.slice(16, 20))
    switch (obj.type) {
      case 'A':
        obj.address = getIPv4Address(cur.slice(20))
        break
      case 'MX':
        obj.preference = getPreference(cur.slice(20, 24))
        obj.address = getMXAddress(cur.slice(24))
        break
      case 'AAAA':
        obj.address = getIPv6Address(cur.slice(20))
        break
    }
    answerArray.push(obj)
  })
  return answerArray
}

function getPreference(res) {
  return parseInt(res, 16)
}

function getMXAddress(res) {
  const array = res.match(/.{2}/g)
  return hexToString(array.join('')) + '.' + name
}

function hexToString(hex) {
  const arr = []
  hex.match(/.{2}/g).map((cur) => {
    if (parseInt(cur, 16) < 20) arr.push('.')
    else arr.push(String.fromCharCode(parseInt(cur, 16)))
  })
  return arr.join('').slice(1)
}

function getIPv6Address(res) {
  let address = ''
  return address
}

function getIPv4Address(res) {
  const string = res.match(/.{2}/g)
  let address = ''
  string.map((cur) => {
    address += parseInt(cur, 16) + '.'
  })
  return address.slice(-1)
}

const getClass = () => 'IN'

function getType(type) {
  switch (type) {
    case '0002':
      return 'NS'
    case '0006':
      return 'S0A'
    case '0005':
      return 'CNAME'
    case '000f':
      return 'MX'
    case '0010':
      return 'TXT'
    case '001c':
      return 'AAAA'
    default:
      return 'A'
  }
}

const getTimeToLive = (res) => parseInt(res, 16)
const getLength = (res) => parseInt(res, 16)

console.log(getObject())
