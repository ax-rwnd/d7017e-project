const { execFile } = require('child_process')

const timeout = 5000 // ms

const testRunners = {
    'python3': python3
}

function python3(file, test) {
    return new Promise((resolve, reject) => {
        const child = execFile('python3', [file].concat(test.args), {timeout: timeout}, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            }
            let result = {stdout, stderr}
            resolve(result)
        })
        child.stdin.end(test.stdin)
    })
}

function runTest(file, test, lang) {
    if (!test.hasOwnProperty('args')) {
        test.args = []
    }
    if (!test.hasOwnProperty('stdin')) {
        test.stdin = ''
    }
    // TODO: handle unknown lang
    const runner = testRunners[lang]
    if (runner) {
        return runner(file, test)
    } else {
        throw new Error('lang `' + lang + '`is not supported')
    }
}

exports.runTest = runTest
