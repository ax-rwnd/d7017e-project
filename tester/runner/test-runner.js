const tmp = require('tmp')
const fs = require('fs')
const { execFile } = require('child_process')

const timeout = 5000 // ms

const request = {
    'lang':'python3',
    'code':'print("hello world")',
    'tests': [
        {'stdin': '', 'stdout': 'hello world\n', 'id': 0},
        {'stdin': 'hi', 'args': [], 'stdout' :'hello world\n', 'id': 1}
    ],
    'optional_tests': []
}

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
            resolve(stdout)
        })
        child.stdin.end(test.stdin)
    })
}

function resultItem(id, ok) {
    return {id: id, ok: ok}
}

async function runTests(request) {
    const codeFile = tmp.fileSync()
    fs.writeFileSync(codeFile.fd, request.code)
    let res = {results: []}
    for (const test of request.tests) {
        try {
            let output = await runTest(codeFile.name, test)
            if (output !== test.stdout) {
                console.log('failed test, expected:')
                console.log(test.stdout)
                console.log('got:')
                console.log(output)
                // TODO: tell them what broke our expectations
                res.results.push(resultItem(test.id, false))
            } else {
                console.log('ok', test.id)
                res.results.push(resultItem(test.id, true))
            }
        } catch (e) {
            // SIGTERM is sent to the child process on timeout
            if (e.signal == 'SIGTERM') {
                // TODO: tell them that the failure was from a timeout
                console.log('Execution timed out on test:', test.id)
                res.results.push(resultsItem(test.id, false))
            } else {
                throw e
            }
        }
    }
    console.log('done')
    codeFile.removeCallback()
    return res
}

runTests(request)
    .then((res) => {
        console.log('Tests finished.')
        console.log(res)
    })
    .catch((err) => {
        console.log('Error:', err)
        process.exit(1)
    })
