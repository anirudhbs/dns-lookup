const answerCount = (res) => parseInt(res.slice(12, 16))

function separateAnswers(req, res) {
  const answers = res.slice(req.length)
  return answers.split('c00c').filter((cur) => cur.length > 0)
}

function getObject(req, res, name) {
  let obj = {}
  obj.header = getHeaderObject(res, name)
  obj.queries = getQueriesObject(res.slice(24, res.indexOf('c00c')), name)
  obj.answers = getAnswerObject(req, res, name)
  // console.log(obj)
  return obj
}

function getHeaderObject(res, name) {
  let obj = {}
  obj.id = res.slice(0, 4)
  obj.flags = flagObject(res.slice(4, 8))
  obj.questions = getDecimalValue(res.slice(8, 12))
  obj.answerRRs = getDecimalValue(res.slice(12, 16))
  obj.authorityRRs = getDecimalValue(res.slice(16, 20))
  obj.additionalRRs = getDecimalValue(res.slice(20, 24))
  return obj
}

function flagObject(hex) {
  let obj = {}
  const bits = getBits(hex)
  obj.messageType = (bits.slice(0, 1) === '1') ? 'response' : 'request'
  obj.OPCODE = bits.slice(1, 5)
  obj.truncated = bits.slice(6, 7) === '1'
  obj.recursionDesired = bits.slice(7, 8) === '1'
  obj.recursionAvailable = bits.slice(8, 9) === '1'
  obj.AnswerAuthenticated = bits.slice(10, 11) === '1'
  obj.replyCode = bits.slice(12, 16)
  return obj
}

function getBits(hex) {
  const bits = hex.match(/.{1}/g).map((cur) => {
    const value = parseInt(cur).toString(2)
    if (value === '0') return '0000'
    if (value === '1') return '0001'
    return value
  })
  return bits.join('')
}

function getQueriesObject(res) {
  let obj = {}
  obj.name = hexToString(res.slice(0, res.length - 8))
  obj.length = obj.name.length - 1
  obj.labelCount = obj.name.match(/\./g).length
  obj.type = getType(res.slice(-8, -4))
  obj.class = 'IN'
  return obj
}

function getAnswerObject(req, res, name) {
  const answerArray = []
  const answers = separateAnswers(req, res)
  answers.map((cur) => {
    let obj = {}
    obj.name = name
    obj.type = getType(cur.slice(0, 4))
    obj.class = getClass()
    obj.ttl = getDecimalValue(cur.slice(8, 16))
    obj.length = getDecimalValue(cur.slice(16, 20))

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
      default:
        obj.address = null
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
  return address.slice(0, address.length - 1)
}

const getClass = () => 'IN'

const getDecimalValue = (res) => parseInt(res, 16)

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

// getObject('ffff01000001000000000000077477697474657203636f6d0000010001', 'ffff81800001000200000000077477697474657203636f6d0000010001c00c0001000100000605000468f42a41c00c0001000100000605000468f42ac1', 'placeholder')

module.exports = {
  getObject
}
