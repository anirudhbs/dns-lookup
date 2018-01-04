const query = require('./src/query')
const lookup = require('./src/lookup')

function lookMeUp(domain, type, recursive) {
  let query1 = query.formRequest(domain, type, true)
  const buf = Buffer.from(query1, 'hex')
  lookup.sendQuery(buf)
}

lookMeUp('geekskool.com', 'ns', true)
