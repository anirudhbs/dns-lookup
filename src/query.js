function makeQuery (url, queryType) {
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

function getHex (h) {
  return (h.length === 1) ? '0' + h : h
}

function getType (type) {
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

function stringToHex (string) {
  const hex = []
  string.match(/.{1}/g).map((cur) => {
    const h = cur.charCodeAt().toString(16)
    hex.push(getHex(h))
  })
  return hex.join('')
}

function generateID () {
  const string = '0123456789abcdef'
  let id = ''
  let i = 0
  while (i < 4) {
    id += string.charAt(Math.floor(Math.random() * string.length))
    i += 1
  }
  return id
}

function generateFlags () {
  return '0100'
}

function generateQuestionCount () {
  return '0001'
}

function answerRRs () {
  return '0000'
}

function authorityRRs () {
  return '0000'
}

function additionalRRs () {
  return '0000'
}

function formRequest (url, type) {
  const header = generateID() + generateFlags() + generateQuestionCount() + answerRRs() + authorityRRs() + additionalRRs()
  const query = makeQuery('google.com', 'a')
  return header + query
}

module.exports = {
  formRequest
}
