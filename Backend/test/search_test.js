'use strict';

var features_helper = require('../features/features_helper');
const request = require('supertest');
const assert = require('assert');
var config = require('config');

let runner = require('../bin/www');

console.log(process.env.NODE_ENV);

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

describe('GET /api/search', () => {

    let access_token;

    before(() => {
        return auth().then(at => access_token = at);
    });

    it('Minimum query length is set', () => {
        assert(config.get('Search.min_query_length') !== undefined, 'Search.min_query_length in config is not set');
    });

    it('Fails on bad query parameter', () => {

        let query = '?iambad=program';
        let route = '/api/search';

        return request(runner.server)
            .get(route+query)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(400)
            .then(res => {
                //console.log(res.body);
            });
    });

    it('Too short query data', () => {

        let query = '?query=hi';
        let route = '/api/search';

        return request(runner.server)
            .get(route+query)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(400)
            .then(res => {
                //console.log(res.body);
            });
    });

    it('Return search results', () => {

        let query = '?query=program';
        let route = '/api/search';

        return request(runner.server)
            .get(route+query)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200)
            .then(res => {
                //console.log(res.body);
            });
    });
});
