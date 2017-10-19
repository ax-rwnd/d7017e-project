var assert = require('assert');
var docker = require('../docker.js');

describe('tests docker integration', function() {
    it('gets from uninitialized docker', function(done) {
            assert.throws((()=>docker.getContainer('dummy-lang')), Error, 'docker is not initialized');
            done();
    }).timeout(2000);
});
