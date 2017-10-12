const tmp = require('tmp')
const fs = require('fs')
const requireDir = require('require-dir')
const languages = requireDir('./languages')

const timeout = 5000 // ms

function result(id, ok, stderr) {
    this.id = id
    this.ok = ok
    this.stderr = stderr
}

async function runTests(request) {
    const codeFile = tmp.fileSync()
    fs.writeFileSync(codeFile.fd, request.code)
    let res = {results: []} 
    let langModule = resolveLanguage(request.lang)
    let executable = langModule.prepare(codeFile.name)
    for (const test of request.tests) {
        try {
            let output = await validateAndRun(executable, test, langModule)
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

function validateAndRun(file, test, langModule) {
    if (!test.hasOwnProperty('args')) {
        test.args = []
    }
    if (!test.hasOwnProperty('stdin')) {
        test.stdin = ''
    }
    return langModule.run(file, test, timeout)
}

function resolveLanguage(lang) {
    const langModule = languages[lang]
    if (!langModule) {
        throw new Error('lang `' + lang + '`is not supported')
    }
    if (!langModule.hasOwnProperty('prepare')) {
        langModule.prepare = (file) => {return file}
    }
    return langModule
}

exports.runTests = runTests
