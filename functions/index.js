const functions = require('firebase-functions')
const admin = require('firebase-admin')
const ipfsClient = require('ipfs-http-client')

// NOTE: Other projects are initializing firebase too. Check them out.
if (!admin.apps.length) {
  admin.initializeApp()
}

exports.ipfs = functions.https.onRequest((req, res) => {
  if (req.method === 'POST') {
    // Required config to pin files using infura IPFS.
    // const projectId = ''
    // const projectSecret = ''
    // const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

    const client = ipfsClient.create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      // headers: {
      //   authorization: auth
      // }
    })

    const errorHandler = error => {
      console.error(error)
      res.json({
        error: true,
      })
    }

    if (req.get('Content-Type') === 'application/octet-stream') {
      return client
        .add(req.body)
        .then(data => {
          const uri = 'https://ipfs.io/ipfs/' + data.path
          res.json({
            uri,
            success: true,
          })
        })
        .catch(errorHandler)
    }

    if (req.get('Content-Type') === 'application/json') {
      let metadata

      try {
        metadata = JSON.stringify(req.body)
      } catch (error) {
        return errorHandler(error)
      }

      return client
        .add(metadata)
        .then(data => {
          const uri = data.path
          res.json({
            uri,
            success: true,
          })
        })
        .catch(errorHandler)
    }
  }

  if (req.method === 'GET') {
    return res.json({
      status: 'ok',
    })
  }

  res.end()
})
