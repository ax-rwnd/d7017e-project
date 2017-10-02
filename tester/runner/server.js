var http = require('http');
//consider using express

http.createServer(function (req, res) {
    const { headers, method, url } = req

    var body = []
    req.on('error', (err) => {
        console.error(err)
        res.statusCode = 400
        res.end()
    }).on('data', (chunk) => {
        body.push(chunk)
    }).on('end', () => {
        try {
            //Convert the array of Buffers to a javascript object
            body = JSON.parse(Buffer.concat(body).toString())
            let response = runTests(body).then( (resp) => {
                const resBody = { headers, method, url, resp }
                res.writeHead(200, {'Content-Type': 'application/json'})
                res.write(JSON.stringify(resBody))
                res.end()
            })
        } catch (e) {
            console.log(e)
            res.statusCode = 400
            res.end()
        }
    });
}).listen(8080)