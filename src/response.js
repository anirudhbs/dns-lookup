const helper = require('./helper')

function getObject(res) {
  const obj = {}
  obj.header = getHeaderObject(res.slice(0, 24))
  obj.query = getQueryObject(res.slice(24))
  obj.answers = getAnswerObject(res.slice(res.indexOf('c00c')), res)
  return obj
}

function getHeaderObject(res) {
  const obj = {}
  obj.transactionID = res.slice(0, 4)
  obj.flags = getFlagObject(res.slice(4, 8))
  obj.questions = parseInt(res.slice(8, 12), 16)
  obj.answerRRs = parseInt(res.slice(12, 16), 16)
  obj.authorityRRs = parseInt(res.slice(16, 20), 16)
  obj.additionalRRs = parseInt(res.slice(20), 16)
  return obj
}

function getFlagObject(hex) {
  const obj = {}
  const bits = helper.getBits(hex)
  obj.messageType = (bits.slice(0, 1) === '1') ? 'response' : 'request'
  obj.queryType = helper.getQueryType(bits.slice(1, 5))
  obj.truncated = bits.slice(6, 7) === '1'
  obj.recursionDesired = bits.slice(7, 8) === '1'
  obj.recursionAvailable = bits.slice(8, 9) === '1'
  obj.answerAuthenticated = bits.slice(10, 11) === '1'
  obj.errors = helper.getErrors(bits.slice(12, 16))
  return obj
}

function getQueryObject(res) {
  const obj = {}
  obj.name = helper.hexToString(res.slice(0, res.indexOf('00')))
  obj.length = obj.name.length
  obj.labelCount = obj.name.split('.').length
  obj.type = helper.getType(res.slice(res.indexOf('00'), res.indexOf('00') + 4))
  obj.class = helper.getClass(res.slice(res.indexOf('00') + 6, res.indexOf('00') + 10))
  return obj
}

function getAnswerObject(res, complete) {
  const answers = []
  const arrayOfAnswers = res.split('c00c').map((cur) => 'c00c' + cur).slice(1)
  arrayOfAnswers.map((cur) => {
    const obj = {}
    const array = cur.match(/.{2}/g)
    if (array[0].startsWith('c')) {
      obj.name = getFromPointer(complete, getOffset(array[0] + array[1]))
      obj.type = helper.getType(cur.slice(4, 8))
      obj.class = helper.getClass(cur.slice(8, 12))
      obj.ttl = helper.getDecimalValue(cur.slice(12, 20))
      obj.length = helper.getDecimalValue(cur.slice(20, 24))
      obj.address2 = getAddress(cur.slice(24), obj.type, complete)
    } else {

    }
    answers.push(obj)
  })
  return answers
}

function getFromPointer(complete, offset) {
  const array = complete.match(/.{2}/g)
  const temp = array.slice(offset)
  if (array.includes('c0')) {
    return hexToString(complete, temp.slice(0, temp.indexOf('00')).join(''))
  }
}

function hexToString(complete, hex) {
  const arr = []
  const temp = hex.match(/.{2}/g)
  if (temp.includes('c0')) {
    const index = temp.indexOf('c0')
    arr.push(hexToString(getFromPointer(complete, temp[index] + temp[index + 1])))
  }
  temp.map((cur) => {
    if (parseInt(cur, 16) < 20) arr.push('.')
    else arr.push(String.fromCharCode(parseInt(cur, 16)))
  })
  return arr.join('').slice(1)
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

function getAddress (cur, type, complete) {
  switch (type) {
    case 'A':
      return getIPv4Address(cur)
    case 'AAAA':
      return getIPv6Address(cur)
    case 'TXT':
      return getTxtAddress(cur)
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
  const address = res.match(/.{4}/g).join(':')
  return address
}

const getTxtAddress = res => helper.hexToString(res)

module.exports = {
  getObject
}
