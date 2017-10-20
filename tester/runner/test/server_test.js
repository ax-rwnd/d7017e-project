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

        const expected = JSON.stringify(resp);

        request(runner.server)
            .post('/')
            .send(req)
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res) {
                assert.equal(JSON.stringify(res.body.resp), expected);
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
