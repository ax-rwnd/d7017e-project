'use strict';

const request = require('supertest');
const assert = require('assert');
const ObjectId = require('mongoose').Types.ObjectId;

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

function it_rejects_unauthorized_get(route) {
    it('fails when not provided with an access token', () => {
        return request(runner.server)
            .get(route)
            .expect(401);
    });
}

function it_rejects_unauthorized_post(route) {
    it('fails when not provided with an access token', () => {
        return request(runner.server)
            .post(route)
            .expect(401);
    });
}

describe('/api', () => {
    let access_tokens;

    before(() => {
        access_tokens = {};

        let user_promise = request(runner.server)
            .get('/auth/login/fake')
            .expect(200)
            .then(res => {
                access_tokens.admin = res.body.access_token;
            });
        let admin_promise = request(runner.server)
            .get('/auth/login/fake')
            .query({admin: 'true'})
            .expect(200)
            .then(res => {
                access_tokens.user = res.body.access_token;
            });
        return Promise.all([user_promise, admin_promise]);
    });

    function it_rejects_non_admin_post(route) {
        it('rejects non-admin users', () => {
            return request(runner.server)
                .get(route)
                .set('Authorization', 'Bearer ' + access_tokens.user)
                .expect(401);
        });
    }

    describe('/courses', () => {
        describe('GET /api/courses', () => {
            let route = '/api/courses';
            it_rejects_unauthorized_get(route);

            it('should get some courses', () => {
                return request(runner.server)
                    .get(route)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body), 'not an array');
                        assert(res.body.length > 0, 'array is empty');
                    });
            });
        });

        describe.skip('POST /api/courses', () => {
            let route = '/api/courses';
            it_rejects_unauthorized_post(route);
            it_rejects_non_admin_post(route);

            it('returns the new id', () => {
                return request(runner.server)
                    .post(route)
                    .send({
                        name: 'Introduction to Automated Testing in JavaScript',
                        description: 'In this course you will use Mocha and supertest to create automated tests for NodeJS applications.'
                    })
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        console.log(res.body);
                        assert(ObjectId.isValid(res.body.id), 'response is not a valid ObjectId');
                    });
            });
        });

        describe('GET /api/courses/me', () => {
            let route = '/api/courses/me';
            it_rejects_unauthorized_get(route);

            it('gets a list of courses for the fake user', () => {
                return request(runner.server)
                    .get(route)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.courses));
                        // TODO: make assertions about the courses returned
                    });
            });
        });

        describe('GET /api/courses/:course_id', () => {
            let route = '/api/courses/59f6f88b1ac36c0762eb46a9';
            it_rejects_unauthorized_get(route);

            it('finds the course', () => {
                return request(runner.server)
                    .get(route)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert.equal(res.body.name, "Introduktion till skattedeklaration");
                    });
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
