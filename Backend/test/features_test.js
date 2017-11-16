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

describe('Features routes', () => {

    let access_token;

    before(() => {
        return auth().then(at => access_token = at);
    });

    it('GET /api/features/features/:course_id', () => {

        let course_id = '59f6f88b1ac36c0762eb46a9';
        let route = '/api/features/features/';

        return request(runner.server)
            .get(route+course_id)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200)
            .then(res => {
                //console.log(res.body);
            });
    });

    it('GET /api/features/feature/:course_id/:user_id', () => {

        let course_id = '5a0475bb1ac36c0762eb46b9';
        let user_id = '5a01c02d485d0220f8b9cca2';
        let route = '/api/features/feature';

        return request(runner.server)
            .get(route+'/'+course_id+'/'+user_id)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200)
            .then(res => {
                console.log(res.body);
            });
    });

});

describe('Badge routes', () => {

    let access_token;

    before(() => {
        return auth().then(at => access_token = at);
    });

    let badge = {
        course_id: "59f991991ac36c0762eb46af",
        icon: 'pretty_icon',   //name of an icon image file
        title: 'Pretty badgererer',
        description: 'Very impossibru badgeererer',
        goals: {
            badges: [],
            assignments: []
        }
    };

    let new_title = 'Another title';

    let badge_id;

    it('POST /api/features/badge', () => {

        let route = '/api/features/badge';

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

    it('PUT /api/features/badge', () => {

        badge.title = new_title;

        let route = '/api/features/badge';

        return request(runner.server)
            .put(route+'/'+badge_id)
            .set('Authorization', 'Bearer ' + access_token)
            .send(badge)
            .set('Content-Type', 'application/json')
            .expect(200)
            .then(res => {
                //console.log(res.body);
            });
    });

    it('GET /api/features/badge', () => {

        let route = '/api/features/badge';

        return request(runner.server)
            .put(route+'/'+badge_id)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200)
            .then(res => {
                assert(res.body.title == new_title, 'Updated badge did not have title '+new_title+' but '+res.body.title);
            });
    });

});
