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
    case 'aaaa':
      return '001c'
    case 'mx':
      return '000f'
    case 'ns':
      return '0002'
    case 'cname':
      return '0005'
    case 'txt':
      return '0010'
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

const generateID = () => 'ffff'

function generateFlags (recursive) {
  if (recursive === true) return '0100'
  else return '0000'
}

const generateQuestionCount = (count = 1) => '000' + count

const answerRRs = () => '0000'

const authorityRRs = () => '0000'

const additionalRRs = () => '0000'

function formRequest (url, type, recursive = true) {
  const header = generateID() + generateFlags(recursive) + generateQuestionCount() + answerRRs() + authorityRRs() + additionalRRs()
  const query = makeQuery(url, type)
  return header + query
}

module.exports = {
  formRequest
}
