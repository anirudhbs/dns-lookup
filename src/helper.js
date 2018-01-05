const getDecimalValue = (res) => parseInt(res, 16)

function getClass (res) {
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

function getType (type) {
  switch (type) {
    case '0002':
      return 'NS'
    case '0006':
      return 'SOA'
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

function setType (type) {
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

function getErrors (res) {
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

function getQueryType (res) {
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

function individualHexToString (hex) {
  if (parseInt(hex, 16) < 20) return '.'
  return (String.fromCharCode(parseInt(hex, 16)))
}

function hexToString (hex) {
  const arr = []
  hex.match(/.{2}/g).map((cur) => {
    if (parseInt(cur, 16) < 20) arr.push('.')
    else arr.push(String.fromCharCode(parseInt(cur, 16)))
  })
  return arr.join('').slice(1)
}

module.exports = {
  getDecimalValue,
  getClass,
  getType,
  setType,
  getErrors,
  getQueryType,
  hexToString,
  individualHexToString
}
