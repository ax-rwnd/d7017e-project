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

// performs a deep copy assuming a is simple (no functions or circular references)
function clone(a) {
   return JSON.parse(JSON.stringify(a));
}

function auth() {
    return request(runner.server)
        .get('/auth/login/fake')
        .query({admin: 'false'})
        .expect(200)
        .then(res => {
            return res.body.access_token;
        }).catch(function(err) {
            console.log(err);
        });
}

describe('Test passAllMandatoryTests', () => {

    const input = {
        "results": {
            "io": [
                {
                    "id": "59f8a1401ac36c0762eb46ab",
                    "ok": true,
                    "stderr": "",
                    "time": 81440918
                },
                {
                    "id": "59f8a1541ac36c0762eb46ac",
                    "ok": true,
                    "stderr": "",
                    "time": 65636960
                }
            ],
            "prepare": "",
            "code_size": 20,
            "optional_tests": [
                {
                    "id": "59f8a1621ac36c0762eb46ad",
                    "ok": true,
                    "stderr": "",
                    "time": 23770657
                }
            ],
            "lint": "/tmp/tmp-21okZiNRuZOCOu.tmp:1:21: W292 no newline at end of file\n"
        }
    };

    it('should pass the mandatory tests', () => {
        assert(features_helper.passAllMandatoryTests(input));
    });

    it('should pass even if optional tests fail', () => {
        let i = clone(input);
        i.results.optional_tests[0].ok = false;
        assert(features_helper.passAllMandatoryTests(i));
    });

    let fail_one_test = (n) => {
        let i = clone(input);
        i.results.io[n].ok = false;
        assert(!features_helper.passAllMandatoryTests(i));
    };

    for (let n = 0; n < input.results.io.length; n++) {
        it(`should fail if mandatory test ${n} fails`, fail_one_test.bind(null, n));
    }
});

describe('/features', () => {

    let access_token;

    before(() => {
        return auth().then(at => access_token = at);
    });

    describe('GET /api/:course_id/features/', () => {


        it('Get features for all users in course', () => {

            let course_id = '59f6f88b1ac36c0762eb46a9';
            let route = '/api/courses/'+course_id+'/features/';

            return request(runner.server)
                .get(route)
                .set('Authorization', 'Bearer ' + access_token)
                .expect(200)
                .then(res => {
                    assert(Array.isArray(res.body.features), 'not an array');
                });
        });
    });

    describe('GET /api/courses/:course_id/features/me', () => {

        it('Get feature for user in course', () => {


            let course_id = '59f6f88b1ac36c0762eb46a9';
            let route = '/api/courses/'+course_id+'/features/me';

            return request(runner.server)
                .get(route)
                .set('Authorization', 'Bearer ' + access_token)
                .expect(200)
                .then(res => {
                    assert(Array.isArray(res.body.badges), 'not an array');
                    assert(Array.isArray(res.body.progress), 'not an array');
                });
        });
    });


    let badge = {
        course_id: "59f991991ac36c0762eb46af",
        icon: 'pretty_icon',   //name of an icon image file
        title: 'Pretty badge',
        description: 'Very impossibru badgeererer',
        goals: {
            badges: [],
            assignments: []
        }
    };

    let new_title = 'Another title';

    let badge_id;

    describe('POST /api/courses/:course_id/badges', () => {

        it('Create a badge', () => {

            let route = '/api/courses/:course_id/badges';

            return request(runner.server)
                .post(route)
                .set('Authorization', 'Bearer ' + access_token)
                .send(badge)
                .set('Content-Type', 'application/json')
                .expect(200)
                .then(res => {
                    badge_id = res.body._id;
                });
        });
    });

    describe('PUT /api/courses/:course_id/badges/:badge_id', () => {

        it('Update a badge', () => {

            badge.title = new_title;

            let route = '/api/courses/:course_id/badges/'+badge_id;

            return request(runner.server)
                .put(route)
                .set('Authorization', 'Bearer ' + access_token)
                .send(badge)
                .set('Content-Type', 'application/json')
                .expect(200)
                .then(res => {
                    assert(res.body._id == badge_id, 'Badge IDs did not match');
                });
        });
    });

    describe('GET /api/courses/:course_id/badges/:badge_id', () => {

        it('Fetch a badge', () => {

            let route = '/api/courses/:course_id/badges/'+badge_id;

            return request(runner.server)
                .put(route)
                .set('Authorization', 'Bearer ' + access_token)
                .expect(200)
                .then(res => {
                    assert(res.body.title == new_title, 'Updated badge did not have title '+new_title+' but '+res.body.title);
                });
        });

    });

    describe.skip('DELETE /api/courses/:course_id/badges/:badge_id', () => {
        it('TODO', () => {
        });
    });

});
