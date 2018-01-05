const helper = require('./helper')

function separateAnswers (req, res) {
  const answers = res.slice(req.length)
  return answers.split('c00c').filter((cur) => cur.length > 0)
}

function getObject (req, res) {
  const obj = {}
  obj.header = getHeaderObject(res.slice(0, 24))
  obj.queries = getQueriesObject(res.slice(24, res.indexOf('c00c')))
  obj.answers = getAnswerObject(req, res, obj.queries.name)
  return obj
}

function getHeaderObject (res) {
  const obj = {}
  obj.transactionID = res.slice(0, 4)
  obj.flags = flagObject(res.slice(4, 8))
  obj.questions = helper.getDecimalValue(res.slice(8, 12))
  obj.answerRRs = helper.getDecimalValue(res.slice(12, 16))
  obj.authorityRRs = helper.getDecimalValue(res.slice(16, 20))
  obj.additionalRRs = helper.getDecimalValue(res.slice(20))
  return obj
}

function flagObject (hex) {
  const obj = {}
  const bits = getBits(hex)
  obj.messageType = (bits.slice(0, 1) === '1') ? 'response' : 'request'
  obj.queryType = helper.getQueryType(bits.slice(1, 5))
  obj.truncated = bits.slice(6, 7) === '1'
  obj.recursionDesired = bits.slice(7, 8) === '1'
  obj.recursionAvailable = bits.slice(8, 9) === '1'
  obj.answerAuthenticated = bits.slice(10, 11) === '1'
  obj.errors = helper.getErrors(bits.slice(12, 16))
  return obj
}

function getBits (hex) {
  const bits = hex.match(/.{1}/g).map((cur) => {
    const value = parseInt(cur).toString(2)
    if (value.length === 1) return '000' + value
    return value
  })
  return bits.join('')
}

function getQueriesObject (res) {
  const obj = {}
  obj.name = helper.hexToString(res.slice(0, res.length - 8))
  obj.length = obj.name.length - 1
  obj.labelCount = obj.name.match(/\./g).length
  obj.type = helper.getType(res.slice(-8, -4))
  obj.class = helper.getClass(res.slice(-4))
  return obj
}

function getAnswerObject (req, res, name) {
  const answerArray = []
  const answers = separateAnswers(req, res)
  answers.map((cur) => {
    const obj = {}
    obj.name = name
    obj.type = helper.getType(cur.slice(0, 4))
    obj.class = helper.getClass(cur.slice(4, 8))
    obj.ttl = helper.getDecimalValue(cur.slice(8, 16))
    obj.length = helper.getDecimalValue(cur.slice(16, 20))

    switch (obj.type) {
      case 'A':
        obj.address = getIPv4Address(cur.slice(20))
        break
      case 'MX':
        obj.preference = getPreference(cur.slice(20, 24))
        obj.address = getMXAddress(res, cur.slice(24), name)
        break
      case 'AAAA':
        obj.address = getIPv6Address(cur.slice(20))
        break
      case 'NS':
        obj.address = getNSAddress(res, cur.slice(20), name)
        break
      case 'CNAME':
        obj.address = getCnameAddress(cur.slice(20))
        break
      case 'TXT':
        obj.address = getTxtAddress(cur.slice(20))
        break
      default:
        obj.address = null
    }
    answerArray.push(obj)
  })
  return answerArray
}

const getTxtAddress = res => helper.hexToString(res)

function getCnameAddress (res) {
  let address = ''
  return address
}

function getMXAddress (complete, res, name) {
  const array = res.match(/.{2}/g)
  let address = ''
  for (let i = 0; i < array.length; i++) {
    if (array[i].startsWith('c')) {
      address += getFromPointer(complete, array[i] + array[i + 1])
      i += 2
    } else {
      address += helper.individualHexToString(array[i])
    }
  }
  if (!(address.endsWith('com.') || address.endsWith('com'))) return address.slice(1) + '.' + name
  return address.slice(1)
}

const getPreference = res => parseInt(res, 16)

const getNSAddress = (complete, res, name) => getMXAddress(complete, res, name)

function getFromPointer (res, offset) {
  const array = res.match(/.{2}/g)
  const numOffset = getOffset(offset)
  const newArray = array.slice(numOffset)
  const temp = newArray.slice(0, newArray.indexOf('00')).join('')
  if (temp[temp.length - 4] === 'c') return getFromPointer(res, temp.slice(-4))
  return '.' + helper.hexToString(temp)
}

function getOffset (hex) {
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

function getIPv6Address (res) {
  let address
  address = res.match(/.{4}/g).join(':')
  return address
}

function getIPv4Address (res) {
  const string = res.match(/.{2}/g)
  let address = ''
  string.map((cur) => {
    address += parseInt(cur, 16) + '.'
  })
  return address.slice(0, address.length - 1)
}

module.exports = {
  getObject
}
