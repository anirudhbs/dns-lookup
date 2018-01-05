const query = require('./src/query')
const lookup = require('./src/lookup')

function lookMeUp (domain, type, server, recursive, cb) {
  let query1 = query.formRequest(domain, type, recursive)
  const buf = Buffer.from(query1, 'hex')
  lookup.sendQuery(buf, server, cb)
}

lookMeUp('google.com', 'mx', '8.8.8.8', true, (err, data) => {
  if (err) throw err
  console.log(JSON.stringify(data, null, 2))
})
