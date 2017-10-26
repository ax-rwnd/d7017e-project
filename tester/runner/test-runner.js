/* jshint node: true */
'use strict';

var tmp = require('tmp');
var fs = require('fs');
var requireDir = require('require-dir');
var languages = requireDir('./languages');

const timeout = 5000; // ms

function result(id, ok, stderr, time) {
    // Build a result struct
    return {id:id, ok:ok, stderr:stderr, time:time};
}

async function runTests(request) {
    // Run some tests on the tester

    const codeFile = tmp.fileSync();
    fs.writeFileSync(codeFile.fd, request.code);
    fs.closeSync(codeFile.fd);

    let res = {results: {io: []}};
    let langModule = resolveLanguage(request.lang);

    //Prepare should return a list of two objects, the first being the filepath to an executable, the second being compiler/other errors.
    let preparation = await langModule.prepare(codeFile.name);
    let executable = preparation[0];
    res.results.prepare = preparation[1];

    //If there was a prepare error, stop here
    if (res.results.prepare != '') {
        return res;
    }

    // Measure code size
    if (typeof(request.code) === 'string') {
        res.results.code_size = request.code.length;
    } else {
        throw new Error('code is not a string');
    }

    // Run mandatory IO tests
    let testsPassed = true;
    if (!request.tests.hasOwnProperty('io')) {
        request.tests.io = [];
    }
    for (const test of request.tests.io) {
        let result = await runTest(test, executable, langModule);
        res.results.io.push(result);
        if(!result.ok) {
            testsPassed = false;
            break;
        }
    }

    // Run optional tests if mandatory IO tests passed
    if(testsPassed) {
        res.results.optional_tests = [];
        if (!request.tests.hasOwnProperty('optional_tests')) {
            request.tests.optional_tests = [];
        }
        for (const test of request.optional_tests.io) {
            res.results.optional_tests.push(await runTest(test, executable, langModule));
        }
    }

    // Lint
    if (request.tests.lint === true) {
        try {
            res.results.lint = await langModule.lint(codeFile.name);
        } catch (e) {
            res.results.lint = 'Unknown linter error: ' + e;
        }
    }

    codeFile.removeCallback();
    return res;
}

async function runTest(test, executable, langModule) {
    try {
        let output = await validateAndRun(executable, test, langModule);
        if (output.stdout !== test.stdout) {
            // TODO: tell them what broke our expectations
            return new result(test.id, false, output.stderr, output.time);
        } else {
            // test succeeded
            return new result(test.id, true, output.stderr, output.time);
        }
    } catch (e) {
        // SIGTERM is sent to the child process on timeout
        if (e.signal == 'SIGTERM') {
            console.log('Execution timed out on test:', test.id);
            return new result(test.id, false, 'Test took too long', undefined);
        } else {
            return new result(test.id, false, e.message, undefined);
            //throw e;
        }
    }
}

function validateAndRun(file, test, langModule) {
    // Make sure that required fields are present before running

    if (!test.hasOwnProperty('args')) {
        test.args = [];
    }
    if (!test.hasOwnProperty('stdin')) {
        test.stdin = '';
    }
    return timedRun(file, test, langModule);
}

async function timedRun(file, test, langModule) {
    const start_time = process.hrtime();
    let res = await langModule.run(file, test, timeout);
    const diff = process.hrtime(start_time);
    const NS_PER_SEC = 1e9;
    res.time = diff[0] * NS_PER_SEC + diff[1];
    return res;
}


function resolveLanguage(lang) {
    // Lookup language module from lang-string

    const langModule = languages[lang];
    if (!langModule) {
        throw new Error('lang `' + lang + '`is not supported');
    }
    if (!langModule.hasOwnProperty('prepare')) {
        let error = '';
        langModule.prepare = (file) => {return [file, error];};
    }
    if (!langModule.hasOwnProperty('lint')) {
        langModule.lint = (file) => {return '';};
    }
    return langModule;
}

exports.runTests = runTests;
