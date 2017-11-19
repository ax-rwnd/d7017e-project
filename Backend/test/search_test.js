'use strict';

var features_helper = require('../features/features_helper');
const request = require('supertest');
const assert = require('assert');
var config = require('config');

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

describe('/search', () => {

    let access_token;

    before(() => {
        return auth().then(at => access_token = at);
    });

    describe('Check config so that minimun query length is set', () => {

        it('Minimum query length is set', () => {
            assert(config.get('Search.min_query_length') !== undefined, 'Search.min_query_length in config is not set');
        });
    });

    describe('GET /api/search', () => {

        it('Fails on bad query parameter', () => {

            let query = '?iambad=program';
            let route = '/api/search';

            return request(runner.server)
                .get(route+query)
                .set('Authorization', 'Bearer ' + access_token)
                .expect(400)
                .then(res => {
                    assert(res.error.text == 'HTTP error: 400 Bad input. Expected: "?query=XYZ"', 'query was misspelled');
                });
        });
    });

    describe('GET /api/search', () => {

        it('Too short query data', () => {

            let query = '?query=hi';
            let route = '/api/search';

            return request(runner.server)
                .get(route+query)
                .set('Authorization', 'Bearer ' + access_token)
                .expect(400)
                .then(res => {
                    assert(res.error.text == 'HTTP error: 400 Bad input. Expected query with length atleast '+config.get('Search.min_query_length'), 'Too short query data');
                });
        });
    });

    describe('GET /api/search', () => {

        it('Return search results', () => {

            let query = '?query=program';
            let route = '/api/search';

            return request(runner.server)
                .get(route+query)
                .set('Authorization', 'Bearer ' + access_token)
                .expect(200)
                .then(res => {
                    assert(res.body.hasOwnProperty('courses'), 'Result did not have property courses');
                    assert(Array.isArray(res.body.courses), 'Property courses was not an array');
                    assert(res.body.hasOwnProperty('assignments'), 'Result did not have property assignments');
                    assert(Array.isArray(res.body.assignments), 'Property assignments was not an array');
                    assert(res.body.hasOwnProperty('users'), 'Result did not have property users');
                    assert(Array.isArray(res.body.users), 'Property users was not an array');

                    assert(res.body.assignments.length > 0, 'Property assignments was empty');
                });
        });
    });

    describe('GET /api/search', () => {

        it('Return search results with "categories" as filter', () => {

            let query = '?query=program&categories=users,courses';
            let route = '/api/search';

            return request(runner.server)
                .get(route+query)
                .set('Authorization', 'Bearer ' + access_token)
                .expect(200)
                .then(res => {
                    assert(res.body.hasOwnProperty('courses'), 'Result did not have property courses');
                    assert(Array.isArray(res.body.courses), 'Property courses was not an array');
                    assert(res.body.hasOwnProperty('assignments'), 'Result did not have property assignments');
                    assert(Array.isArray(res.body.assignments), 'Property assignments was not an array');
                    assert(res.body.hasOwnProperty('users'), 'Result did not have property users');
                    assert(Array.isArray(res.body.users), 'Property users was not an array');

                    assert(res.body.assignments.length == 0, 'Property assignments was not empty');
                });
        });
    });
});
