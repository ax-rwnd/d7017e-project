var assert = require('assert');
var runner = require('../test-runner.js');

describe('testing runner', () => {
    it('runs tests in containers', (done) => {
        const req = {
            'lang':'python3',
            'code':'import sys\nprint("hello world")\nprint("debug", file=sys.stderr)\n',
            'tests': {
                'io': [
                    {'stdin': '', 'stdout': 'hello world\n', 'id': 0},
                    {'stdin': 'hi', 'args': [], 'stdout' :'bad test\n', 'id': 1}
                ],
                'lint': true
            },
            'optional_tests': []
        };

        const resp = {
            results: {
                io: [
                    {id: 0, ok: true, stderr: 'debug\n'},
                    {id: 1, ok: false, stderr: 'debug\n'}
                ],
                prepare: '',
                code_size: 64,
                lint: ''
            }
        };

        var promise = new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(runner.runTests(req));
            }, 2000);
        });

        promise.then((result) => {
            try {
                result.results.io.forEach(iores => {
                    // just test that the type is correct since the time varies
                    assert.equal(typeof(iores.time), 'number');
                    // delete it so it's not checked later
                    delete iores.time;
                });
                assert.equal(JSON.stringify(result.results), JSON.stringify(resp.results));
                done();
            } catch (err) {
                done(err);
            }
        });

    }).timeout(10000);

    it('run java tests', (done) => {
        const req = {
            'lang':'java',
            'code':'public class main {\npublic static void main(String[] args){\nfor (String s: args) {\nSystem.out.println(s);\n}\n}\n}',
            'tests': {
                'io': [
                    {'stdin': '', 'args': [5], 'stdout': '5\n', 'id': 0},
                    {'stdin': 'hi', 'args': [], 'stdout' :'bad test\n', 'id': 1}
                ],
                'lint': false
            },
            'optional_tests': []
        };

        const resp = {
            results: {
                io: [
                    {id: 0, ok: true, stderr: ''},
                    {id: 1, ok: false, stderr: ''}
                ],
                prepare: '',
                code_size: 111
            }
        };

        var promise = new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(runner.runTests(req));
            }, 2000);
        });

        promise.then((result) => {
            try {
                result.results.io.forEach(iores => {
                    // just test that the type is correct since the time varies
                    assert.equal(typeof(iores.time), 'number');
                    // delete it so it's not checked later
                    delete iores.time;
                });
                assert.equal(JSON.stringify(result.results), JSON.stringify(resp.results));
                done();
            } catch (err) {
                done(err);
            }
        });

    }).timeout(10000);

    it('run c tests', (done) => {
        const req = {
            'lang':'c',
            'code':'#include<stdio.h>\nint main(){\nprintf("Hello World");\nfflush(stdout);\nreturn 0;\n}',
            'tests': {
                'io': [
                    {'stdin': '', 'args': [], 'stdout': 'Hello World', 'id': 0},
                    {'stdin': 'hi', 'args': [], 'stdout' :'bad test\n', 'id': 1}
                ],
                'lint': false
            },
            'optional_tests': []
        };

        const resp = {
            results: {
                io: [
                    {id: 0, ok: true, stderr: ''},
                    {id: 1, ok: false, stderr: ''}
                ],
                prepare: '',
                code_size: 80
            }
        };

        var promise = new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(runner.runTests(req));
            }, 2000);
        });

        promise.then((result) => {
            try {
                result.results.io.forEach(iores => {
                    // just test that the type is correct since the time varies
                    assert.equal(typeof(iores.time), 'number');
                    // delete it so it's not checked later
                    delete iores.time;
                });
                assert.equal(JSON.stringify(result.results), JSON.stringify(resp.results));
                done();
            } catch (err) {
                done(err);
            }
        });

    }).timeout(10000);

    it('run prepare error test', (done) => {
        const req = {
            'lang':'java',
            'code':'public class main {\npublic static void main(String[] args){\nfor (String s: args) {\nSystem.out.printttln(s);\n}\n}\n}',
            'tests': {
                'io': [
                    {'stdin': '', 'args': [5], 'stdout': '5\n', 'id': 0},
                    {'stdin': 'hi', 'args': [], 'stdout' :'bad test\n', 'id': 1}
                ],
                'lint': false
            },
            'optional_tests': []
        };

        var promise = new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(runner.runTests(req));
            }, 2000);
        });

        promise.then((result) => {
            try {
                result.results.io.forEach(iores => {
                    // just test that the type is correct since the time varies
                    assert.equal(typeof(iores.time), 'number');
                    // delete it so it's not checked later
                    delete iores.time;
                });
                var regex = /cannot find symbol/;
                assert.ok(regex.test(result.results.prepare));
                assert.deepEqual(result.results.io, []);
                done();
            } catch (err) {
                done(err);
            }
        });

    }).timeout(10000);

    it('run haskell tests', (done) => {
        const req = {
            'lang':'haskell',
            'code':'import System.Environment\nmain = do\n[a,b]<-getArgs\nputStrLn(a)',
            'tests': {
                'io': [
                    {'stdin': '', 'args': ['Hello World','b'], 'stdout': 'Hello World\n', 'id': 0},
                    {'stdin': '', 'args': ['Bad','Test'], 'stdout' :'bad test\n', 'id': 1}
                ],
                'lint': false
            },
            'optional_tests': []
        };

        const resp = {
            results: {
                io: [
                    {id: 0, ok: true, stderr: ''},
                    {id: 1, ok: false, stderr: ''}
                ],
                prepare: '',
                code_size: 62,
            }
        };

        var promise = new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(runner.runTests(req));
            }, 2000);
        });

        promise.then((result) => {
            try {
                result.results.io.forEach(iores => {
                    // just test that the type is correct since the time varies
                    assert.equal(typeof(iores.time), 'number');
                    // delete it so it's not checked later
                    delete iores.time;
                });
                assert.equal(JSON.stringify(result.results), JSON.stringify(resp.results));
                done();
            } catch (err) {
                done(err);
            }
        });

    }).timeout(10000);
    
});
