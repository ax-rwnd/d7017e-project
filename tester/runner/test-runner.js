const tmp = require('tmp')
const fs = require('fs')
const { execFile } = require('child_process')

const timeout = 5000 // ms

function runTest(file, test) {
    return new Promise((resolve, reject) => {
        let args
        if (!test.hasOwnProperty('args')) {
            test.args = []
        }
        if (!test.hasOwnProperty('stdin')) {
            test.stdin = ''
        }
        const child = execFile('python3', [file].concat(args), {timeout: timeout}, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            }
            let result = {stdout, stderr}
            resolve(result)
        })
        child.stdin.end(test.stdin)
    })
}

function result(id, ok, stderr) {
    this.id = id
    this.ok = ok
    this.stderr = stderr
}

async function runTests(request) {
    const codeFile = tmp.fileSync()
    fs.writeFileSync(codeFile.fd, request.code)
    let res = {results: []}
    for (const test of request.tests) {
        try {
            let output = await runTest(codeFile.name, test)
            if (output.stdout !== test.stdout) {
                console.log('failed test, expected:')
                console.log(test.stdout)
                console.log('got:')
                console.log(output.stdout)
                // TODO: tell them what broke our expectations
                res.results.push(new result(test.id, false, output.stderr))
            } else {
                console.log('ok', test.id)
                res.results.push(new result(test.id, true, output.stderr))
            }
        } catch (e) {
            // SIGTERM is sent to the child process on timeout
            if (e.signal == 'SIGTERM') {
                // TODO: tell them that the failure was from a timeout
                console.log('Execution timed out on test:', test.id)
                res.results.push(new result(test.id, false, ''))
            } else {
                throw e
            }
        }
    }
    console.log('done')
    codeFile.removeCallback()
    return res
}

exports.runTests = runTests
