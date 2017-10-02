const test_runner = require('./test-runner.js')
const assert = require('assert')

const request = {
    'lang':'python3',
    'code':'import sys;print("hello world");print("debug", file=sys.stderr)',
    'tests': [
        {'stdin': '', 'stdout': 'hello world\n', 'id': 0},
        {'stdin': 'hi', 'args': [], 'stdout' :'bad test\n', 'id': 1}
    ],
    'optional_tests': []
}

const response = {
    results: [
        {id: 0, ok: true, stderr: 'debug\n'},
        {id: 1, ok: false, stderr: 'debug\n'}
    ]
}

test_runner.runTests(request)
    .then((res) => {
        assert.deepEqual(res, response, 'unexpected response')
        console.log('ok')
    })
    .catch((err) => {
        console.log('Error:', err)
        process.exit(1)
    })


