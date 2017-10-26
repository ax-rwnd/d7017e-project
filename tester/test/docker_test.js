const assert = require('assert');
const docker = require('../docker.js');
const request = require('request');
const { startRunner } = require('./run-container.js');

describe('tests docker integration', function() {
    it('gets from uninitialized docker', function(done) {
            assert.throws((()=>docker.getContainer('dummy-lang')), Error, 'docker is not initialized');
            done();
    }).timeout(2000);
});

describe('language tests', function() {
    it('python27 test', function(done) {
        const req = {
            'lang':'python27',
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

        const expected = {
            results: {
                io: [
                    {id: 0, ok: true, stderr: 'debug\n'},
                    {id: 1, ok: false, stderr: 'debug\n'}
                ],
                prepare: '',
                code_size: 64,
                lint: ''
            }
        };

        startRunner(req.lang).then(container => {
            request.post({
                url: 'http://' + container.extra.address + '/',
                headers: {'Content-Type': 'application/json'},
                json: req
            }, (error, response, body) => {
                if(error) {
                    throw error;
                }

                body.resp.results.io.forEach(iores => {
                    // just test that the type is correct since the time varies
                    assert.equal(typeof(iores.time), 'number');
                    // delete it so it's not checked later
                    delete iores.time;
                });
                assert.equal(JSON.stringify(expected.results), JSON.stringify(body.resp.results));
                container.stop();
                done();
            });
        });
    }).timeout(10000);

    it('python3 test', function(done) {
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

        const expected = {
            results: {
                io: [
                    {id: 0, ok: true, stderr: 'debug\n'},
                    {id: 1, ok: false, stderr: 'debug\n'}
                ],
                prepare: '',
                code_size: 64,
                lint: ''
            }
        };

        startRunner(req.lang).then(container => {
            request.post({
                url: 'http://' + container.extra.address + '/',
                headers: {'Content-Type': 'application/json'},
                json: req
            }, (error, response, expected) => {
                console.log(response);
                if(error) {
                    throw error;
                }

                response.results.io.forEach(iores => {
                    // just test that the type is correct since the time varies
                    assert.equal(typeof(iores.time), 'number');
                    // delete it so it's not checked later
                    delete iores.time;
                });
                assert.equal(JSON.stringify(response.results), JSON.stringify(expected.results));
                container.stop();
                done();
            });
        });
    }).timeout(10000);
});
