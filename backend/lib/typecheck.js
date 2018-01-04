'use strict';

function isString (value) {
    return typeof value === 'string' || value instanceof String;
}

function isNumber (value) {
    return typeof value === 'number' && isFinite(value);
}

function isBoolean (value) {
    return typeof value === 'boolean';
}

exports.isString = isString;
exports.isNumber = isNumber;
exports.isBoolean = isBoolean;
