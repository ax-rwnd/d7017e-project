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
