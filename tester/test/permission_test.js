const assert = require('assert');
const runner = require('./run-container.js');
const request = require('request');
const fs = require('fs');

const exploit = fs.readFileSync('./test/exploit.py').toString();

const req = {
    lang : 'python27',
    code: exploit,
    tests: {
        io: [
            {stdin: '', stdout: 'our expected output', id: 0}
        ]
    }
};

describe('tests permissions for user code in container', function() {
    it('tries to dump the process memory to find the tests', function(done) {
        runner.startRunner(req.lang).then(container => {
            request.post({
                url: 'http://' + container.extra.address + '/',
                headers: {'Content-Type': 'application/json'},
                json: req
            }, (error, response, body) => {
                if(error) {
                    throw error;
                }
                var stderr = body.resp.results.io[0].stderr;
                var out = /Permission denied/.test(stderr);
                assert(out, 'User was allowed to read /proc/1/maps and /proc/1/mem');
                container.stop();
                done();
            });
        });
    }).timeout(10000);
});
