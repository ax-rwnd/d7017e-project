'use strict';

// force test mode BEFORE starting the server
process.env.NODE_ENV = 'test';

const request = require('supertest');
const assert = require('assert');
const ObjectId = require('mongoose').Types.ObjectId;
const config = require('config');
const jwt = require('jsonwebtoken');

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

// extracts the user id from a web token
function get_id_from_token(token) {
    return jwt.verify(token, config.get('App.secret')).id;
}

describe('/api', () => {
    let access_tokens;
    let user_id;
    let admin_id;
    let course_id;
    let assignmentgroup_id1;
    let assignmentgroup_id2;
    let assignment_id1;
    let assignment_id2;
    let test_id;
    let test_id2;
    let invitecode;
    let badge_id;
    let badge_id2;
    let badge_id3;
    let badge_id4;

    before(() => {
        access_tokens = {};

        let user_promise = request(runner.server)
            .get('/auth/login/fake')
            .expect(200)
            .then(res => {
                access_tokens.user = res.body.access_token;
                user_id = get_id_from_token(res.body.access_token);
            });
        let admin_promise = request(runner.server)
            .get('/auth/login/fake')
            .query({admin: 'true'})
            .expect(200)
            .then(res => {
                access_tokens.admin = res.body.access_token;
                admin_id = get_id_from_token(res.body.access_token);
            });
        return Promise.all([user_promise, admin_promise]);
    });

    function it_rejects_non_admin_post(route) {
        it('rejects non-admin users', () => {
            return request(runner.server)
                .post(route)
                .set('Authorization', 'Bearer ' + access_tokens.user)
                .expect(401);
        });
    }

    describe('/courses', () => {

        describe('POST /api/courses', () => {
            let route = '/api/courses';
            it_rejects_unauthorized_post(route);
            let course = {
                name: 'Introduction to Automated Testing in JavaScript',
                description: 'In this course you will use Mocha and supertest to create automated tests for NodeJS applications.',
                hidden: false,
                course_code: 'D00testingE',
                enabled_features: {badges: true}
            };
            it('returns the new id', () => {
                return request(runner.server)
                    .post(route)
                    .send(course)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(201)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        course_id = res.body._id;
                    });
            });
        });

        describe('GET /api/courses', () => {
            let route = '/api/courses';
            it_rejects_unauthorized_get(route);

            it('should get some courses', () => {
                return request(runner.server)
                    .get(route)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        let courses = res.body.courses;
                        assert(Array.isArray(courses), 'should be an array');
                        assert(courses.length > 0, 'array should not be empty');
                    });
            });
        });

        describe('GET /api/courses/:course_id', () => {
            it('finds the course', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert.equal(res.body.name, 'Introduction to Automated Testing in JavaScript');
                    });
            });
        });

        describe('PUT /api/courses/:course_id', () => {
            it('modifies the course code successfully', () => {
                let course_updated = {
                    name: 'Introduction to Automated Testing in JavaScript with small m in mocha (updated)',
                    description: 'In this course you will use Mocha and supertest to create automated tests for NodeJS applications. (updated)',
                    hidden: false,
                    course_code: 'DtestingtestingE',
                    enabled_features: {badges: false, progressbar: true}
                };
                return request(runner.server)
                    .put('/api/courses/' + course_id)
                    .send(course_updated)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200);
            });
        });


        describe('POST /api/courses/:course_id/assignmentgroups', () => {

            let assignmentgroup = {
                name: "assignmentgroup"
            };

            it('create an assignmentgroup', () => {

                assignmentgroup.name = "assignmentgroup1";

                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignmentgroups')
                    .send(assignmentgroup)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        assignmentgroup_id1 = res.body._id;
                    });
            });
            it('create another assignmentgroup that will be removed later', () => {

                assignmentgroup.name = "assignmentgroup2";

                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignmentgroups')
                    .send(assignmentgroup)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        assignmentgroup_id2 = res.body._id;
                    });
            });
        });



        describe('GET /api/courses/:course_id/assignmentgroups', () => {
            it('get all assignmentgroup in a course', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/assignmentgroups')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.assignmentgroups), 'should be an array');
                        assert(res.body.assignmentgroups.length === 2, 'not length 2');
                    });
            });
        });

        describe('PUT /api/courses/:course_id/assignmentgroups/:assignmentgroup_id', () => {
            it('update an assignmentgroup', () => {

                let new_data = {
                    name: 'new name1'
                };

                return request(runner.server)
                    .put('/api/courses/' + course_id + '/assignmentgroups/' + assignmentgroup_id1)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .send(new_data)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        assert(assignmentgroup_id1 == res.body._id, 'response is not the requested test');
                        assert(res.body.name === new_data.name, 'name was wrong');
                    });
            });
        });

        describe('DELETE /api/courses/:course_id/assignmentgroups/:assignmentgroup_id', () => {
            it('delete assignmentgroup2', () => {
                return request(runner.server)
                    .delete('/api/courses/' + course_id + '/assignmentgroups/' + assignmentgroup_id2)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        return request(runner.server)
                            .get('/api/courses/' + course_id + '/assignmentgroups')
                            .set('Authorization', 'Bearer ' + access_tokens.user)
                            .expect(200)
                            .then(res => {
                                assert(Array.isArray(res.body.assignmentgroups), 'should be an array');
                                assert(res.body.assignmentgroups.length === 1, 'not length 1');
                            });
                    });
            });
        });

        describe('POST /api/courses/:course_id/assignments', () => {
            it('returns an assignment id', () => {
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignments')
                    .send({
                        name: 'Introduction to Mocha tests',
                        description: 'Write tests with Mocha',
                        hidden: false,
                        tests: {lint: true},
                        languages: 'javascript'
                    })
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(201)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        assignment_id1 = res.body._id;
                    });
            });

            it('returns an assignment id for an assignment that will be removed later', () => {
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignments')
                    .send({
                        name: 'Lesson 2 in Mocha tests',
                        description: 'Write tests with Mocha',
                        hidden: false,
                        tests: {lint: true},
                        languages: 'javascript'
                    })
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(201)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        assignment_id2 = res.body._id;
                    });
            });
        });

        describe('PUT /api/courses/:course_id/assignmentgroups/:assignmentgroup_id', () => {
            it('add assignment to assignmentgroup', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/assignmentgroups/' + assignmentgroup_id1)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        let assignemntgroupsData = res.body;

                        assignemntgroupsData.name = "AssGrp with Ass in. Ass ass baby!";
                        let assignment = {
                            assignment: assignment_id2
                        };
                        assignemntgroupsData.assignments.push(assignment);

                        return request(runner.server)
                            .put('/api/courses/' + course_id + '/assignmentgroups/' + assignmentgroup_id1)
                            .set('Authorization', 'Bearer ' + access_tokens.admin)
                            .send(assignemntgroupsData)
                            .set('Content-Type', 'application/json')
                            .expect(200)
                            .then(res => {
                                assert(res.body.assignments.length === 1, 'not length 1');
                            });
                    });
            });
        });

        describe('GET /api/courses/:course_id/assignmentgroups', () => {
            it('get all assignmentgroup in a course', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/assignmentgroups')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.assignmentgroups), 'should be an array');
                        assert(res.body.assignmentgroups.length === 1, 'not length 1');
                    });
            });
        });

        describe('GET /api/courses/:course_id/assignmentgroups/:assignmentgroup_id', () => {
            it('get an assignmentgroup', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/assignmentgroups/' + assignmentgroup_id1)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        assert(assignmentgroup_id1 == res.body._id, 'response is not the requested test');
                    });
            });
        });

        describe('DELETE /api/courses/:course_id/assignments/:assignment_id', () => {
            it('completes without an error', () => {
                return request(runner.server)
                    .delete('/api/courses/' + course_id + '/assignments/' + assignment_id2)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        return request(runner.server)
                            .get('/api/courses/' + course_id + '/assignmentgroups/' + assignmentgroup_id1)
                            .set('Authorization', 'Bearer ' + access_tokens.user)
                            .expect(200)
                            .then(res => {
                                assert(res.body.assignments.length === 0, 'not length 0');
                            });
                    });
                // TODO: add assertions to check if there is some data left
            });
        });

        describe('GET /api/courses/:course_id/assignments', () => {
            it('returns a non-empty list of assignments', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/assignments')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.assignments), 'should be an array');
                        assert(res.body.assignments.length > 0, 'array should not be empty');
                    });
            });
        });

        describe('PUT /api/courses/:course_id/assignments/:assignment_id', () => {
            it('modifies decription and tests.lint successfully', () => {
                return request(runner.server)
                    .put('/api/courses/' + course_id + '/assignments/' + assignment_id1)
                    .send({
                        description: 'Write tests with Mocha (modified)',
                        tests: {lint: false}
                    }).set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200);
            });
        });

        describe('GET /api/courses/:course_id/assignments/:assignment_id', () => {
            it('returns the correct assignment', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/assignments/' + assignment_id1)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(res.body.description === 'Write tests with Mocha (modified)', 'description does not match expected value');
                        assert(res.body.tests.lint === false, 'tests.lint does not match expected value');
                    });
            });
        });

        describe('POST /api/courses/:course_id/assignments/:assignment_id/tests', () => {
            it('returns a test id', () => {
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/tests')
                    .send({
                        stdout: 'hej\n',
                        stdin: '',
                        args: []
                    })
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(201)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        test_id = res.body._id;
                    });
            });
        });

        describe('POST /api/courses/:course_id/assignments/:assignment_id/tests', () => {
            it('returns a test id that will be removed after it has been added as a goal for a badge', () => {
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/tests')
                    .send({
                        stdout: 'hello world2\n',
                        stdin: '',
                        args: []
                    })
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(201)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        test_id2 = res.body._id;
                    });
            });
        });

        describe('GET /api/courses/:course_id/assignments/:assignment_id/tests', () => {
            it('returns a non-empty list of tests and a lint bool', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/tests')
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.tests.io), 'should be an array');
                        assert(res.body.tests.io.length > 0, 'array should not be empty');
                    });
            });
        });

        describe('GET /api/courses/:course_id/assignments/:assignment_id/tests/:test_id', () => {
            it('returns a test object', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/tests/' + test_id)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        assert(test_id == res.body._id, 'response is not the requested test');
                    });
            });
        });

        describe('PUT /api/courses/:course_id/assignments/:assignment_id/tests/:test_id', () => {
            it('modifies stdout successfully', () => {
                return request(runner.server)
                    .put('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/tests/' + test_id)
                    .send({
                        stdout: 'hello world2\n'
                    }).set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200);
            });
        });

        describe('POST /:course_id/assignments/:assignment_id/draft', () => {
            it('saves an empty draft to the database', () => {
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/draft')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .send()
                    .expect(201)
                    .then(res => {
                        assert(assignment_id1 == res.body.assignment, 'response does not contain the correct assignment_id');
                        assert(res.body.lang == "", 'response param lang is not empty');
                        assert(res.body.code == "", 'response param code is not empty');
                    });
            });
            it('saves a draft to the database', () => {
                let draft = {
                    lang: 'python3',
                    code: 'print(\"hello world\")\n'
                };
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/draft')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .send(draft)
                    .expect(201)
                    .then(res => {
                        assert(assignment_id1 == res.body.assignment, 'response does not contain the correct assignment_id');
                        assert(draft.lang == res.body.lang, 'response does not contain the correct lang');
                        assert(draft.code == res.body.code, 'response does not contain the correct code');
                    });
            });
        });

        describe('GET /:course_id/assignments/:assignment_id/draft', () => {
            it('retrieves a draft from the database', () => {
                let lang = 'python3';
                let code = 'print(\"hello world\")\n';
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/draft')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .send()
                    .expect(200)
                    .then(res => {
                        assert(assignment_id1 == res.body.assignment, 'response does not contain the correct assignment_id');
                        assert(res.body.lang == lang, 'response does not contain the correct lang');
                        assert(res.body.code == code, 'response does not contain the correct code');
                    });
            });
        });

        describe('GET /api/courses/:course_id/enabled_features', () => {
            it('returns a non-empty list of enabled_features', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/enabled_features')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200);
            });
        });

        describe('POST /api/courses/:course_id/invitecodes', () => {
            it('Generate invite code', () => {
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/invitecodes')
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(201)
                    .then(res => {
                        assert(res.body.code, 'does not return a code');
                        assert.equal(res.body.course, course_id);

                        invitecode = res.body.code;
                    });
            });
            it('Try generating invite code without permission', () => {
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/invitecodes')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(403);
            });
        });

        describe('POST /api/courses/invitecodes/:code/join', () => {
            it('Join a course using an invite code', () => {
                return request(runner.server)
                    .post('/api/courses/invitecodes/' + invitecode + '/join')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert.equal(res.body.user, user_id);
                        assert.equal(res.body.course, course_id);
                        assert.equal(res.body.role, "student");
                        assert(res.body.features, "did not return user");
                    });
            });
        });

        describe('GET /api/courses/invitecodes/:code', () => {
            it('Get an invite code', () => {
                return request(runner.server)
                    .get('/api/courses/invitecodes/' + invitecode)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert.equal(res.body.course, course_id);
                        assert.equal(res.body.code, invitecode);
                        assert.equal(res.body.uses, 1);
                    });
            });
        });

        describe('GET /api/courses/:course_id/invitecodes', () => {
            it('Get all invite codes', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/invitecodes')
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {

                    });
            });
        });

        describe('DELETE /api/courses/invitecodes/:code', () => {
            it('Revoke an invite code', () => {
                return request(runner.server)
                    .delete('/api/courses/invitecodes/' + invitecode)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert.equal(res.body.course, course_id);
                        assert.equal(res.body.code, invitecode);
                    });
            });
        });
    });

    describe('/users', () => {
        describe('GET /api/users/me', () => {
            let route = '/api/users/me';
            it_rejects_unauthorized_get(route);

            it('gets some user information', () => {
                return request(runner.server)
                    .get(route)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert.equal(res.body.username, 'fake-student-00');
                        assert(!res.body.admin, 'should not be admin');
                    });
            });
        });


        describe('GET /api/users/:user_id', () => {
            it('gets some user information', () => {
                return request(runner.server)
                .get('/api/users/' + admin_id)
                .set('Authorization', 'Bearer ' + access_tokens.user)
                .expect(200)
                .then(res => {
                    assert.equal(res.body.username, 'fake-admin-00');
                });
            });
        });
    });

    describe('/features', () => {
        describe('GET /api/:course_id/features/', () => {
            it('Get features for all users in course', () => {
                let route = '/api/courses/'+course_id+'/features/';
                return request(runner.server)
                    .get(route)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.features), 'not an array');
                    });
            });
        });

        describe('GET /api/courses/:course_id/features/me', () => {
            it('Get feature for user in course', () => {
                let route = '/api/courses/'+course_id+'/features/me';
                return request(runner.server)
                    .get(route)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.badges), 'not an array');
                        assert(Array.isArray(res.body.progress), 'not an array');
                    });
            });
        });

        describe('POST /api/courses/:course_id/badges', () => {
            it('Create a badge', () => {

                let badge = {
                    // missing course_id is set later
                    icon: 'pretty_icon',   //name of an icon image file
                    title: 'Pretty badge',
                    description: 'Very impossibru badgeererer',
                    goals: {
                        badges: [],
                        assignments: [{
                            assignment: assignment_id1,
                            tests: [test_id, test_id2]
                        }]
                    }
                };

                return request(runner.server)
                    .post('/api/courses/'+ course_id + '/badges')
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .send(badge)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        badge_id = res.body._id;
                    });
            });

            it('Create a badge that will be removed', () => {

                let badge = {
                    // missing course_id is set later
                    icon: 'pretty_icon',   //name of an icon image file
                    title: 'Another badge',
                    description: 'Very impossibru badgeererer',
                    goals: {
                        badges: [],
                        assignments: []
                    }
                };

                return request(runner.server)
                    .post('/api/courses/'+ course_id + '/badges')
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .send(badge)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        badge_id2 = res.body._id;
                    });
            });

            it('Create a badge that will be removed', () => {

                let badge = {
                    // missing course_id is set later
                    icon: 'pretty_icon',   //name of an icon image file
                    title: 'Another badge',
                    description: 'Very impossibru badgeererer',
                    goals: {
                        badges: [badge_id],
                        assignments: []
                    }
                };

                return request(runner.server)
                    .post('/api/courses/'+ course_id + '/badges')
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .send(badge)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        badge_id3 = res.body._id;
                    });
            });

            it('Create a badge with no goals that user should not get on submit of assignment', () => {

                let badge = {
                    // missing course_id is set later
                    icon: 'pretty_icon',   //name of an icon image file
                    title: 'Another badge',
                    description: 'Very impossibru badgeererer',
                    goals: {
                        badges: [],
                        assignments: []
                    }
                };

                return request(runner.server)
                    .post('/api/courses/'+ course_id + '/badges')
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .send(badge)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        assert(ObjectId.isValid(res.body._id), 'response is not a valid ObjectId');
                        badge_id4 = res.body._id;
                    });
            });
        });

        describe('PUT /api/courses/:course_id/badges/:badge_id', () => {
            it('Update a badge', () => {
                let new_title = 'Another title1';

                let badge = {
                    title: new_title
                };
                return request(runner.server)
                    .put('/api/courses/' + course_id + '/badges/' + badge_id)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .send(badge)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        assert(res.body.title == new_title, 'Updated badge did not have title '+new_title+' but '+res.body.title);
                    });
            });
        });

        describe('GET /api/courses/:course_id/badges/:badge_id', () => {
            it('Fetch a badge', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/badges/' + badge_id)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert(res.body.goals.assignments[0].tests.length === 2, 'Too few tests in badge');
                        assert(res.body._id == badge_id, 'Badge IDs did not match');
                    });
            });
        });

        describe('DELETE /api/courses/:course_id/badges/:badge_id', () => {
            it('Return all badge of a course', () => {
                return request(runner.server)
                    .delete('/api/courses/' + course_id + '/badges/' + badge_id2)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200);
            });
        });

        describe('GET /api/courses/:course_id/badges', () => {
            it('Return all badge of a course', () => {
                return request(runner.server)
                    .get('/api/courses/' + course_id + '/badges')
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.badges), 'not an array');
                        assert(res.body.badges.length === 3, 'not length 2');
                    });
            });
        });

        describe('GET /api/courses/:course_id/features/me', () => {
            it('Get feature for user in course. Progress should be empty', () => {
                let route = '/api/courses/'+course_id+'/features/me';
                return request(runner.server)
                    .get(route)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.badges), 'not an array');
                        assert(Array.isArray(res.body.progress), 'not an array');
                        assert(res.body.badges.length === 0, 'not length 0');
                        assert(res.body.progress.length === 0, 'not length 0');
                    });
            });
        });

        describe('POST /api/courses/:course_id/assignments/:assignment_id/submit', () => {
            it('run assignments tests', () => {
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/submit')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .send({
                        'lang': 'python3',
                        'code': 'print(\"hello world2\")\n'
                    })
                    .expect(200)
                    .then(res => {
                        assert(res.body.features.badges.length === 2, 'not length 2');
                        assert(res.body.features.progress.completed === 1, 'completed not 1');
                        assert(assignment_id1 == res.body.assignment_id, 'response is not contain the correct assignment_id');
                    });
            }).timeout(15000);
        });

        describe('GET /api/courses/:course_id/features/me', () => {
            it('Get feature for user in course, is now updated', () => {
                let route = '/api/courses/'+course_id+'/features/me';
                return request(runner.server)
                    .get(route)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.badges), 'not an array');
                        assert(Array.isArray(res.body.progress), 'not an array');
                        assert(res.body.badges.length === 2, 'not length 0');
                        assert(res.body.progress.length === 1, 'not length 0');
                    });
            });
        });

        describe('POST /api/courses/:course_id/assignments/:assignment_id/submit', () => {
            it('run same assignments tests now the same badges should not be obtained', () => {
                return request(runner.server)
                    .post('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/submit')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .send({
                        'lang': 'python3',
                        'code': 'print(\"hello world2\")\n'
                    })
                    .expect(200)
                    .then(res => {
                        assert(res.body.features.badges.length === 0, 'not length 0');
                        assert(res.body.features.progress.completed === 1, 'completed not 1');
                        assert(assignment_id1 == res.body.assignment_id, 'response is not contain the correct assignment_id');
                    });
            }).timeout(15000);
        });

        describe('DELETE /api/courses/:course_id/assignments/:assignment_id/tests/:test_id', () => {
            it('delete test and now badge should be updated aswell', () => {
                return request(runner.server)
                    .delete('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/tests/' + test_id2)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        return request(runner.server)
                            .get('/api/courses/' + course_id + '/assignments/' + assignment_id1)
                            .set('Authorization', 'Bearer ' + access_tokens.admin)
                            .expect(200)
                            .then(res => {
                                assert(res.body.tests.io.length === 1, 'Too many tests in assignments');
                                return request(runner.server)
                                    .get('/api/courses/' + course_id + '/badges/' + badge_id)
                                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                                    .expect(200)
                                    .then(res => {
                                        assert(res.body.goals.assignments[0].tests.length === 1, 'Too many tests in badge');
                                        assert(res.body._id == badge_id, 'Badge IDs did not match');
                                    });
                            });
                    });
            });
        });

        describe('DELETE /api/courses/:course_id/badges/:badge_id', () => {
            it('Should remove badge from feature aswell', () => {
                return request(runner.server)
                    .delete('/api/courses/' + course_id + '/badges/' + badge_id3)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200)
                    .then(res => {
                        return request(runner.server)
                            .get('/api/courses/' + course_id + '/badges')
                            .set('Authorization', 'Bearer ' + access_tokens.admin)
                            .expect(200)
                            .then(res => {
                                assert(Array.isArray(res.body.badges), 'not an array');
                                assert(res.body.badges.length === 2, 'not length 2');
                                return request(runner.server)
                                    .get('/api/courses/'+course_id+'/features/me')
                                    .set('Authorization', 'Bearer ' + access_tokens.user)
                                    .expect(200)
                                    .then(res => {
                                        assert(Array.isArray(res.body.badges), 'not an array');
                                        assert(Array.isArray(res.body.progress), 'not an array');
                                        assert(res.body.badges.length === 1, 'not length 1');
                                    });
                            });

                    });
            });
        });
    });

    describe('/search', () => {
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
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(400)
                    .then(res => {
                        assert(res.body.error.message == 'Bad input. Expected: "?query=XYZ"', 'query was misspelled');
                    });
            });
        });

        describe('GET /api/search', () => {
            it('Too short query data', () => {
                let query = '?query=hi';
                let route = '/api/search';
                return request(runner.server)
                    .get(route+query)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(400)
                    .then(res => {
                        assert(res.body.error.message == 'Bad input. Expected query with length atleast ' + config.get('Search.min_query_length'), 'Too short query data');
                    });
            });
        });

        describe('GET /api/search', () => {
            it('Return search results', () => {
                let query = '?query=mocha';
                let route = '/api/search';
                return request(runner.server)
                    .get(route+query)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(res.body.hasOwnProperty('courses'), 'Result did not have property courses');
                        assert(Array.isArray(res.body.courses), 'Property courses was not an array');
                        assert(res.body.hasOwnProperty('assignments'), 'Result did not have property assignments');
                        assert(Array.isArray(res.body.assignments), 'Property assignments was not an array');
                        assert(res.body.hasOwnProperty('users'), 'Result did not have property users');
                        assert(Array.isArray(res.body.users), 'Property users was not an array');

                        assert(res.body.courses.length > 0, 'Property courses was empty');
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
                    .set('Authorization', 'Bearer ' + access_tokens.user)
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

        describe('GET /api/search', () => {
            it('Search with hyphen', () => {
                let query = '?query=fake-admin-00';
                let route = '/api/search';
                return request(runner.server)
                    .get(route+query)
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(res.body.users.length == 1, 'Wrong number of users where found');
                    });
            });
        });
    });

    describe('tester', () => {
        describe('GET /api/tester/languages', () => {
            it('Get supported languages from tester', () => {
                return request(runner.server)
                    .get('/api/tester/languages')
                    .set('Authorization', 'Bearer ' + access_tokens.user)
                    .expect(200)
                    .then(res => {
                        assert(Array.isArray(res.body.languages), 'Property languages was not an array');
                    });
            });
        });
    });

    describe('deletion', () => {
        describe('DELETE /api/courses/:course_id/assignments/:assignment_id/tests/:test_id', () => {
            it('completes without an error', () => {
                return request(runner.server)
                    .delete('/api/courses/' + course_id + '/assignments/' + assignment_id1 + '/tests/' + test_id)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200);
                // TODO: add assertions to check if there is some data left
            });
        });

        describe('DELETE /api/courses/:course_id', () => {
            it('completes without an error', () => {
                return request(runner.server)
                    .delete('/api/courses/' + course_id)
                    .set('Authorization', 'Bearer ' + access_tokens.admin)
                    .expect(200);
                // TODO: add assertions to check if there is some data left
            });
        });
    });
});
