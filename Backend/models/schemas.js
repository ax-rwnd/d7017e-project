'use strict';
//Mongoose schemas.

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const INVITELINK_TTL = 24 * 60 * 60 * 1000;

/*
* Base schemas
*/
var assignmentSchema = new Schema({
    name: {type: String, required: true},
    description: String,
    hidden: { type: Boolean, required: true },
    tests: {
        io: [{ type: Schema.Types.ObjectId, ref: 'Test', required: true }],
        lint: Boolean
    },
    optional_tests: {
        io: [{ type: Schema.Types.ObjectId, ref: 'Test', required: false }],
        lint: Boolean
    },
    languages: [String]
});
assignmentSchema.index({name: 'text', description: 'text'}, {weights: {name: 5, description: 1}});

var testSchema = new Schema({
    stdout: {type: String, default: ''},
    stdin: String,
    args: [String]
});

var userSchema = new Schema({
	username: {type: String, required: true},
    email: {type: String, required: false},
    admin: {type: Boolean, required: true},
    access: {type: String, enum: ['admin', 'advanced', 'basic'], required: false}, //change to required: true later
    tokens: [{type: String, required: false}],
    courses: [{type: Schema.Types.ObjectId, ref: 'Course', required: false}],
    teaching: [{type: Schema.Types.ObjectId, ref: 'Course', required: false}],
    providers: [{type: String, required: true}] //LTU, KTH etc.
});
userSchema.index({username: 'text', email: 'text'});

//user code submissions
var draftSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
    code: { type: String, required: false },
    lang: { type: String, required: false }
});

var joinRequests = new Schema({
    inviteType: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    course: {type: Schema.Types.ObjectId, ref: 'Course', required: true}
});

var courseMembers = new Schema({
    role: {type: String, required: true},
    course: {type: Schema.Types.ObjectId, ref: 'Course', required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    features: {type: Schema.Types.ObjectId, ref: 'Features', required: false}
});

var inviteLinks = new Schema({
    code: {type: String, required: true},
    course: {type: Schema.Types.ObjectId, ref: 'Course', required: true},
    createdAt: {type: Date, default: Date.now()},
    expiresAt: {type: Date, default: (Date.now() + INVITELINK_TTL)}
});

var courseSchema = new Schema({
    course_code: {type: String, required: false},
    name: {type: String, required: true},
    description: {type: String, required: false},
    hidden: {type: Boolean, default: false},  //public or private course
    autojoin: {type: Boolean, default: false},
    owner: {type: Schema.Types.ObjectId, ref: 'User', required: false},
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    students: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment', required: false }],
    features: [{ type: Schema.Types.ObjectId, ref: 'Features', required: true }], //progress, badges etc.
    enabled_features: {
        badges: Boolean,
        progressbar: Boolean,
        leaderboard: Boolean,
        adventuremap: Boolean
    }
});
courseSchema.index({course_code: 'text', name: 'text', description: 'text'}, {weights: {course_code: 10, name: 5, description: 1}});

/*
* Feature schemas
*/

//a course-specific badge. Needs reference to a course, badge and goals that "unlocks" it.
var badgeSchema = new Schema({
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true},
    icon: {type: String, required: true},   //name of an icon image file
    title: {type: String, required: true},
    description: {type: String, required: true},
    //Goals that "unlocks" the badge. This can be other Badge(s), Assignment(s) etc.
    goals: {
        badges: [{ type: Schema.Types.ObjectId, ref: 'Badge', required: false}],
        assignments:
        [{
            assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
            tests: [{ type: Schema.Types.ObjectId, ref: 'Test', required: false}],
            code_size: Number
        }]
    }
});

var featuresSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    progress: [{
        assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
        tests: [{test: { type: Schema.Types.ObjectId, ref: 'Test', required: true}, result: Boolean, optional_test: Boolean}],
        timing: {type: Number, required: true},
        code_size: {type: Number, required: true}
    }],
    badges: [{ type: Schema.Types.ObjectId, ref: 'Badge', required: false}]
});


var Assignment = mongoose.model('Assignment', assignmentSchema);
var Test = mongoose.model('Test', testSchema);
var User = mongoose.model('User', userSchema);
var Draft = mongoose.model('Draft', draftSchema);
var JoinRequests = mongoose.model('JoinRequests', joinRequests);
var CourseMembers = mongoose.model('CourseMembers', courseMembers);
var Course = mongoose.model('Course', courseSchema);
var Badge = mongoose.model('Badge', badgeSchema);
var Features = mongoose.model('Features', featuresSchema);
var InviteLinks = mongoose.model('InviteLinks', inviteLinks);
var models = {Assignment: Assignment, Test: Test, User: User, Draft: Draft, 
        JoinRequests: JoinRequests, InviteLinks: InviteLinks, CourseMembers: CourseMembers, Course: Course, Badge: Badge, Features: Features};

module.exports = models;
