'use strict';

const request = require('supertest');
const assert = require('assert');

let runner = require('../bin/www');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

after(() => {
    runner.server.close(() => {
        // for some reason the program doesn't terminate
        // even after all tests are done
        // TODO: solve the termination problem with a less dirty hack
        process.exit(0);
    });
});

describe('api', () => {
    let access_token;

    before(() => {
        access_token = undefined;
        return request(runner.server)
        .get('/auth/login/fake')
        .query({admin: 'true'})
        .expect(200)
        .then(res => {
            access_token = res.body.access_token;
        });
    });

    describe('GET /api/courses/me', () => {
        it('fails when not provided with an access token', () => {
            return request(runner.server)
            .get('/api/courses/me')
            .expect(401);
        });

        it('gets courses for the fake user', () => {
            return request(runner.server)
            .get('/api/courses/me')
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200)
            .then(res => {
                console.log(res.body.courses);
                // TODO: make assertions about the courses returned
            });
        });
    });

    //describe('POST /api/assignment??', () => {
    //    it('stores the assignment in the database', (done) => {
    //        request(runner.server)
    //        .post('/api/assignment')
    //        .send({
    //            // TODO: real input
    //            course_id: '0000000',
    //            name: 'Assignment name',
    //            text: 'Assignment text'
    //        })
    //        .expect('Content-Type', 'application/json')
    //        .expect(200, {
    //            id: 1 // TODO: should be a mongo id
    //        }, done);
    //    });
    //});
});
