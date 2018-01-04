const query = require('./src/query')
const lookup = require('./src/lookup')

function lookMeUp(domain, type, server, recursive) {
  let query1 = query.formRequest(domain, type, recursive)
  const buf = Buffer.from(query1, 'hex')
  const res = lookup.sendQuery(buf, server)
}

lookMeUp('google.com', 'aaaa', '8.8.8.8', true)
