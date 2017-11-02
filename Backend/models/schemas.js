'use strict';
//Mongoose schemas.

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

var testSchema = new Schema({
    stdout: {type: String, required: true},
    stdin: String,
    args: [String]
});

var userSchema = new Schema({
	username: {type: String, required: true},
    email: {type: String, required: true},
    admin: {type: Boolean, required: true},
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: false}],
    providers: [{type: String, required: true}]
});

var courseSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    teachers: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    students: [{ type: Schema.Types.ObjectId, ref: 'User', required: false }],
    assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment', required: false }],
    features: { type: Schema.Types.ObjectId, ref: 'Features', required: true }
});

var badgesSchema = new Schema([{
    icon: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    tests: [{ type: Schema.Types.ObjectId, ref: 'Test', required: true}]
}]);

var featuresSchema = new Schema({
    progress: [{ type: Schema.Types.ObjectId, ref: 'FeaturesProgress', required: true }],
    timing: [{ type: Schema.Types.ObjectId, ref: 'FeaturesTiming', required: true }],
    performance: [{ type: Schema.Types.ObjectId, ref: 'FeaturesPerformance', required: true }],
    badges: [{ type: Schema.Types.ObjectId, ref: 'FeaturesBadges', required: true }]
});

var featuresProgressSchema = new Schema([{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignment: [{ type: Schema.Types.ObjectId, ref: 'Assignment'}]
}]);

var featuresTimingSchema = new Schema([{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timing: [{
        assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
        timing: {type: Number, required: true},
    }]
}]);

var featuresPerformanceSchema = new Schema([{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performances: [{
        assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true},
        performance: {type: Number, required: true}
    }]
}]);

var featuresBadgesSchema = new Schema([{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badges: [{ type: Schema.Types.ObjectId, ref: 'Badges'}]
}]);

var Assignment = mongoose.model('Assignment', assignmentSchema);
var Test = mongoose.model('Test', testSchema);
var User = mongoose.model('User', userSchema);
var Course = mongoose.model('Course', courseSchema);
var Badges = mongoose.model('Badges', badgesSchema);
var Features = mongoose.model('Features', featuresSchema);
var FeaturesProgress = mongoose.model('FeaturesProgress', featuresProgressSchema);
var FeaturesTiming = mongoose.model('FeaturesTiming', featuresTimingSchema);
var FeaturesPerformance = mongoose.model('FeaturesPerformance', featuresPerformanceSchema);
var FeaturesBadges = mongoose.model('FeaturesBadges', featuresBadgesSchema);
var models = {Assignment: Assignment, Test: Test, User: User, Course: Course,
    Badges: Badges, Features: Features, FeaturesProgress: FeaturesProgress,
    FeaturesTiming: FeaturesTiming, FeaturesPerformance: FeaturesPerformance,
    FeaturesBadges: FeaturesBadges};

module.exports = models;
