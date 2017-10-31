'use strict';

var Assignment = require('../models/schemas').Assignment;
var Test = require('../models/schemas').Test;
var request = require('request');
var queries = require('../lib/queries');

const TESTER_IP = 'http://130.240.5.118:9100';

