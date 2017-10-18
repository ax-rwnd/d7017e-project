var request = require('supertest')
var assert = require('assert')

// Setup code, server requires command line arguments
var old_args = process.argv
process.argv = [process.argv[0], process.argv[1], "19100"]

describe('testing runner', function() {
    var runner;
    beforeEach(function() {
        runner = require('../server.js');
    });

    afterEach(function() {
        runner.server.close()
    });

    it('tests ping', function testPing(done) {
        request(runner.server)
            .get('/ping')
            .expect(200, done);
    });

    it('test post', function testPost(done) {
        const req = {
            'lang':'python3',
            'code':'import sys;print("hello world");print("debug", file=sys.stderr)',
            'tests': [
                {'stdin': '', 'stdout': 'hello world\n', 'id': 0},
                {'stdin': 'hi', 'args': [], 'stdout' :'bad test\n', 'id': 1}
            ],
            'optional_tests': []
        }

        const resp = {
            results: [
                {id: 0, ok: true, stderr: 'debug\n'},
                {id: 1, ok: false, stderr: 'debug\n'}
            ]
        }
        const expected = JSON.stringify(resp);

        request(runner.server)
            .post('/')
            .send(req)
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res) {
                assert.equal(expected, JSON.stringify(res.body.resp));
                done();
            });
    });

});
