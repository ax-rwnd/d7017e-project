'use strict';
var features_helper = require('../features/features_helper');
const request = require('supertest');
const assert = require('assert');

let runner = require('../bin/www');

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

function auth() {
    return request(runner.server)
        .get('/auth/login/fake')
        .query({admin: 'false'})
        .expect(200)
        .then(res => {
            return res.body.access_token;
        });
}


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

        let course_id = '59f6f88b1ac36c0762eb46a9';
        let user_id = '59f9f5a51ac36c0762eb46b0';
        let route = '/api/features/feature/';

        return request(runner.server)
            .get(route+course_id+'/'+user_id)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200)
            .then(res => {
                //console.log(res.body);
            });
    });

});


describe('Tester', () => {
    let access_token;

    before(() => {
        return auth().then(at => access_token = at);
    });

    it('GET /api/tests/languages', () => {

        let route = '/api/tests/languages';

        return request(runner.server)
            .get(route)
            .set('Authorization', 'Bearer ' + access_token)
            .expect(200)
            .then(res => {
                console.log(res.text);
            }).catch(err => {
                console.log(err);
            });
    });
});
