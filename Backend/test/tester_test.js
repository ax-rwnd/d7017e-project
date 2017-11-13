'use strict';

var features_helper = require('../features/features_helper');
const request = require('supertest');
const assert = require('assert');

let runner = require('../bin/www');

// https://github.com/visionmedia/supertest/issues/370#issuecomment-249410533
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

after(() => {
    runner.server.close(() => {
        // for some reason the program doesn't terminate
        // even after all tests are done
        // TODO: solve the termination problem with a less dirty hack
        process.exit(0);
    });
});

function auth() {
    return request(runner.server)
        .get('/auth/login/fake')
        .query({admin: 'false'})
        .expect(200)
        .then(res => {
            return res.body.access_token;
        });
}

describe('Tester', () => {
    let access_token;

    before(() => {
        return auth().then(at => access_token = at);
    });

    it('GET /api/tester/languages', () => {

        let route = '/api/tester/languages';

        return request(runner.server)
            .get(route)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200)
            .then(function(res) {
                //console.log(res.text);
            });
    });
});
