const answerCount = (res) => parseInt(res.slice(12, 16))

function separateAnswers(req, res) {
  const answers = res.slice(req.length)
  return answers.split('c00c').filter((cur) => cur.length > 0)
}

function getObject(req, res) {
  let obj = {}
  obj.header = getHeaderObject(res.slice(0, 24))
  obj.queries = getQueriesObject(res.slice(24, res.indexOf('c00c')))
  obj.answers = getAnswerObject(req, res, obj.queries.name)
  return obj
}

function getHeaderObject(res) {
  let obj = {}
  obj.transactionID = res.slice(0, 4)
  obj.flags = flagObject(res.slice(4, 8))
  obj.questions = getDecimalValue(res.slice(8, 12))
  obj.answerRRs = getDecimalValue(res.slice(12, 16))
  obj.authorityRRs = getDecimalValue(res.slice(16, 20))
  obj.additionalRRs = getDecimalValue(res.slice(20))
  return obj
}

function flagObject(hex) {
  let obj = {}
  const bits = getBits(hex)
  obj.messageType = (bits.slice(0, 1) === '1') ? 'response' : 'request'
  obj.queryType = queryType(bits.slice(1, 5))
  obj.truncated = bits.slice(6, 7) === '1'
  obj.recursionDesired = bits.slice(7, 8) === '1'
  obj.recursionAvailable = bits.slice(8, 9) === '1'
  obj.answerAuthenticated = bits.slice(10, 11) === '1'
  obj.errors = getErrors(bits.slice(12, 16))
  return obj
}

function getErrors(res) {
  switch (res) {
    case '0001':
      return 'format error'
    case '0002':
      return 'server failure'
    case '0003':
      return 'name error'
    case '0004':
      return 'not implemented'
    case '0005':
      return 'refused'
    default:
      return null
  }
}

function queryType(res) {
  switch (res) {
    case '0000':
      return 'standard'
    case '0001':
      return 'inverse'
    case '0010':
      return 'server status'
    default:
      return undefined
  }
}

function getBits(hex) {
  const bits = hex.match(/.{1}/g).map((cur) => {
    const value = parseInt(cur).toString(2)
    if (value.length === 1) return '000' + value
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
  obj.class = getClass(res.slice(-4))
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
        obj.address = getMXAddress(cur.slice(24)) // + name
        break
      case 'AAAA':
        obj.address = getIPv6Address(cur.slice(20))
        break
      case 'NS':
        obj.address = getNSAddress(res, cur.slice(20), name) // + name
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

function getMXAddress(res) {
  const array = res.match(/.{2}/g)
  return hexToString(array.join(''))
}

function getPreference(res) {
  return parseInt(res, 16)
}

function getNSAddress(complete, res, name) { // mx
  const array = res.match(/.{2}/g)
  let address = ''
  for (let i = 0; i < array.length; i++) {
    if (array[i].startsWith('c')) {
      address += getFromPointer(complete, array[i] + array[i + 1])
      i += 2
    } else {
      address += newHexToString(array[i])
    }
  }
  if (address.endsWith('com.')) return address.slice(1) + '.' + name
  return address.slice(1)
}

function getFromPointer(res, offset) {
  const array = res.match(/.{2}/g)
  const numOffset = getOffset(offset)
  const newArray = array.slice(numOffset)
  return '.' + hexToString(newArray.slice(0, newArray.indexOf('00')).join(''))
}

function getOffset(hex) {
  const array = hex.match(/.{1}/g)
  const newArray = array.map((cur) => {
    const value = parseInt(cur, 16).toString(2)
    if (value.length === 4) return value
    switch (value.length) {
      case 1:
        return '000' + value
      case 2:
        return '00' + value
      case 3:
        return '0' + value
    }
  })
  const string = newArray.join('').slice(2)
  return parseInt(string, 2)
}

function newHexToString(hex) {
  if (parseInt(hex, 16) < 20) return '.'
  return (String.fromCharCode(parseInt(hex, 16)))
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

function getClass(res) {
  switch (res) {
    case '0001':
      return 'IN'
    case '0002':
      return 'CS'
    case '0003':
      return 'CH'
    case '0004':
      return 'HS'
    default:
      return undefined
  }
}

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

module.exports = {
  getObject
}
