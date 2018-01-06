const helper = require('./helper')

function formQuery (url, queryType) {
  const splitUp = url.split('.')
  const hexString = []
  splitUp.map((cur) => {
    hexString.push(helper.getHex(cur.length.toString(16)))
    hexString.push(helper.stringToHex(cur))
  })
  hexString.push('00') // .
  hexString.push(helper.setType(queryType))
  hexString.push('0001') // class
  return hexString.join('')
}

const generateID = () => 'dead'

const generateFlags = recursive => (recursive === true) ? '0100' : '0000'

const generateQuestionCount = (count = 1) => '000' + count

const answerRRs = () => '0000'

const authorityRRs = () => '0000'

const additionalRRs = () => '0000'

function formHeader (recursive) {
  return generateID() + generateFlags(recursive) + generateQuestionCount() + answerRRs() + authorityRRs() + additionalRRs()
}

function formRequest (url, type, recursive) {
  const header = formHeader(recursive)
  const query = formQuery(url, type)
  return header + query
}

module.exports = {
  formRequest
}
