'use strict';
var util = require('util');
var config = require('config');

function BadInputError(inputErrors) {
    this.name = this.constructor.name;
    this.httpCode = 400;
    this.message = "Wrong input. Read Documentation";
    this.inputErrors = inputErrors;
}

function createBadInputError (inputError) {
    return new BadInputError(inputError);
}
util.inherits(BadInputError, Error);

exports.BAD_INPUT = createBadInputError;