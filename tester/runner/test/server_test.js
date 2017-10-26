var request = require('supertest');
var assert = require('assert');

// Setup code, server requires command line arguments
var old_args = process.argv;
process.argv = [process.argv[0], process.argv[1], "19100"];

describe('testing server for runner', function() {
    var runner;
    beforeEach(function() {
        runner = require('../server.js');
    });

    afterEach(function() {
        runner.server.close();
    });

    it('tests ping', function testPing(done) {
        request(runner.server)
            .get('/ping')
            .expect(200, done);
    });

    it('tests tester', function testPost(done) {
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

        const expected_resp = {
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

        const expected = JSON.stringify(expected_resp);

        request(runner.server)
            .post('/')
            .send(req)
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res) {
                const response = res.body.resp;
                response.results.io.forEach(iores => {
                    // just test that the type is correct since the time varies
                    assert.equal(typeof(iores.time), 'number');
                    // delete it so it's not checked later
                    delete iores.time;
                });
                assert.equal(JSON.stringify(response), expected);
                done();
            });
    });

    it('tests invalid get', function testInvalidGet(done) {
        request(runner.server)
            .get('/dummy')
            .expect(404, done);
    });

    it('tests invalid post', function testInvalidPost(done) {
        request(runner.server)
            .post('/dummy')
            .expect(404, done);
    });

});
