const request = require('./src/request')
const lookup = require('./src/lookup')

function lookMeUp (domain, type, options, cb) {
  let query = request.formRequest(domain, type, options.recursive)
  const buf = Buffer.from(query, 'hex')
  lookup.sendQuery(buf, options.server, cb)
}

lookMeUp('google.com', 'mx', { server: '8.8.8.8', recursive: true }, (err, data) => {
  if (err) throw err
  console.log(JSON.stringify(data, null, 2))
})
