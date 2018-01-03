const answerCount = (res) => parseInt(res.slice(12, 16))

function separateAnswers(req, res) {
  const answers = res.slice(req.length)
  return answers.split('c00c').filter((cur) => cur.length > 0)
}

function getObject(req, res, name) {
  const answerArray = []
  const answers = separateAnswers(req, res)
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
        obj.address = getMXAddress(cur.slice(24)) + name
        break
      case 'AAAA':
        obj.address = getIPv6Address(cur.slice(20))
        break
      case 'NS':
        obj.address = getNSAddress(cur.slice(20)) + name
        break
      case 'CNAME':
        obj.address = getCnameAddress(cur.slice(20))
        break
      default: obj.address = null
    }

    answerArray.push(obj)
  })
  return answerArray
}

function getCnameAddress(res) {
  let address = ''
  return address
}

function getNSAddress(res) {
  const array = res.match(/.{2}/g)
  return hexToString(array.join('')) + '.'
}

function getPreference(res) {
  return parseInt(res, 16)
}

function getMXAddress(res) {
  const array = res.match(/.{2}/g)
  return hexToString(array.join('')) + '.'
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
  let address
  address = res.match(/.{4}/g).join(':')
  address = address.replace(':0000:', ':0:')
  return address
}

function getIPv4Address(res) {
  const string = res.match(/.{2}/g)
  let address = ''
  string.map((cur) => {
    address += parseInt(cur, 16) + '.'
  })
  return address.slice(0, address.length-1)
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

module.exports = {
  getObject
}
