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
    let executable = langModule.prepare(codeFile.name);

    // Run mandatory IO tests
    if (!request.tests.hasOwnProperty('io')) {
        request.tests.io = [];
    }
    for (const test of request.tests.io) {
        try {
            let output = await validateAndRun(executable, test, langModule);
            if (output.stdout !== test.stdout) {
                // TODO: tell them what broke our expectations
                res.results.io.push(new result(test.id, false, output.stderr, output.time));
            } else {
                // test succeeded
                res.results.io.push(new result(test.id, true, output.stderr, output.time));
            }
        } catch (e) {
            // SIGTERM is sent to the child process on timeout
            if (e.signal == 'SIGTERM') {
                // TODO: tell them that the failure was from a timeout
                console.log('Execution timed out on test:', test.id);
                res.results.io.push(new result(test.id, false, '', output.time));
            } else {
                throw e;
            }
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
        langModule.prepare = (file) => {return file;};
    }
    if (!langModule.hasOwnProperty('lint')) {
        langModule.prepare = (file) => {return '';};
    }
    return langModule;
}

exports.runTests = runTests;
