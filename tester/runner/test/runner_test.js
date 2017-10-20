var assert = require('assert');
var runner = require('../test-runner.js');

describe('testing runner', () => {
    it('runs tests in containers', (done) => {
        const req = {
            'lang':'python3',
            'code':'import sys;print("hello world");print("debug", file=sys.stderr)',
            'tests': {
                'io': [
                    {'stdin': '', 'stdout': 'hello world\n', 'id': 0},
                    {'stdin': 'hi', 'args': [], 'stdout' :'bad test\n', 'id': 1}
                ],
                'lint': true
            },
            'optional_tests': []
        };

        const resp = {
            results: {
                io: [
                    {id: 0, ok: true, stderr: 'debug\n'},
                    {id: 1, ok: false, stderr: 'debug\n'}
                ],
                lint: `hello.py:1:11: E702 multiple statements on one line (semicolon)
hello.py:1:11: E231 missing whitespace after ';'
hello.py:1:32: E702 multiple statements on one line (semicolon)
hello.py:1:32: E231 missing whitespace after ';'`
            }
        };
        
        var promise = new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(runner.runTests(req));
            }, 2000);
        });

        promise.then((result) => {
            try {
                assert.equal(JSON.stringify(result.results), JSON.stringify(resp.results));
                done();
            } catch (err) {
                done(err);
            }
        });

    }).timeout(10000);
});
