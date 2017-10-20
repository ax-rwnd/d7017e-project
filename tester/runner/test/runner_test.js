var assert = require('assert');
var runner = require('../test-runner.js');

describe('testing runner', () => {
    it('runs tests in containers', (done) => {
        const req = {
            'lang':'python3',
            'code':'import sys\nprint("hello world")\nprint("debug", file=sys.stderr)\n',
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
                lint: ''
            }
        };

        var promise = new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(runner.runTests(req));
            }, 2000);
        });

        promise.then((result) => {
            try {
                result.results.io.forEach(iores => {
                    // just test that the type is correct since the time varies
                    assert.equal(typeof(iores.time), 'number');
                    // delete it so it's not checked later
                    delete iores.time;
                });
                assert.equal(JSON.stringify(result.results), JSON.stringify(resp.results));
                done();
            } catch (err) {
                done(err);
            }
        });

    }).timeout(10000);
});
