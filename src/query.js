const helper = require('./helper')

function makeQuery (url, queryType) {
  const splitUp = url.split('.')
  const hexString = []
  splitUp.map((cur) => {
    hexString.push(getHex(cur.length.toString(16)))
    hexString.push(stringToHex(cur))
  })
  hexString.push('00') // last . in url
  hexString.push(helper.setType(queryType)) // type
  hexString.push('0001') // class
  return hexString.join('')
}

const getHex = h => (h.length === 1) ? '0' + h : h

function stringToHex (string) {
  const hex = []
  string.match(/.{1}/g).map((cur) => {
    const h = cur.charCodeAt().toString(16)
    hex.push(getHex(h))
  })
  return hex.join('')
}

const generateID = () => 'ffff'

const generateFlags = recursive => (recursive === true) ? '0100' : '0000'

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
