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
    return (value.length === 1) ? ('000' + value) : value
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
    if (obj.type === 'MX') {
      obj.preference = getPreference(cur.slice(20, 24))
    }
    obj.address = getAddress(cur, obj.type, res)
    answerArray.push(obj)
  })
  return answerArray
}

function getAddress (cur, type, res) {
  switch (type) {
    case 'A':
      return getIPv4Address(cur.slice(20))
    case 'MX':
      return getMXAddress(cur.slice(24), res)
    case 'AAAA':
      return getIPv6Address(cur.slice(20))
    case 'NS':
      return getNSAddress(cur.slice(24), res)
    case 'TXT':
      return getTxtAddress(cur.slice(20))
    case 'SOA':
      return getSoaAddress(cur.slice(20), res)
    default:
      return null
  }
}

function getIPv4Address (res) {
  const string = res.match(/.{2}/g)
  const address = []
  string.map((cur) => {
    address.push(parseInt(cur, 16))
  })
  return address.join('.')
}

function getIPv6Address (res) {
  let address
  address = res.match(/.{4}/g).join(':')
  return address
}

const getTxtAddress = res => helper.hexToString(res)

const getPreference = res => parseInt(res, 16)

function getMXAddress (res, complete) {
  const array = res.match(/.{2}/g)
  let address = ''
  for (let i = 0; i < array.length; i++) {
    if (array[i].startsWith('c')) {
      address += getFromPointer(complete, getOffset(array[i] + array[i + 1]))
      i += 2
    } else {
      address += helper.individualHexToString(array[i])
    }
  }
  if (address.endsWith('org.') || address.endsWith('uk.') || address.endsWith('net.') || address.endsWith('biz.')) return address.slice(1)
  if (address.endsWith('net')) return address
  if (!(address.endsWith('com.') || address.endsWith('com'))) {
    return address.slice(1) + '.' + getFromPointer(complete, getOffset('c00c'))
  }
  return address.slice(1)
}

const getNSAddress = (res, complete) => {
  const address = getMXAddress(res, complete)
  if (address.startsWith('ns')) return address
  if (address.startsWith('n')) return 'n' + address
  return 'ns' + address
}

function getFromPointer (res, offset) {
  const array = res.match(/.{2}/g)
  const newArray = array.slice(offset)
  const temp = newArray.slice(0, newArray.indexOf('00')).join('')
  if (temp[temp.length - 4] === 'c') {
    return getFromPointer(res, getOffset(temp.slice(-4)))
  }
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

function getSoaAddress (res, complete) {
  const obj = {}
  obj.primaryNS = ''
  obj.RAMailbox = ''
  obj.serialNumber = helper.hexToDecimal(res.slice(-40, -32))
  obj.refreshInterval = helper.getDecimalValue(res.slice(-32, -24))
  obj.retryInterval = helper.getDecimalValue(res.slice(-24, -16))
  obj.expireLimit = helper.getDecimalValue(res.slice(-16, -8))
  obj.minimumTTL = helper.getDecimalValue(res.slice(-8))
  return obj
}

module.exports = {
  getObject
}
