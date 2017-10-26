const { execFile } = require('child_process');
const config = require('config');

const uid = config.get('uid');

function run(file, test, timeout) {
    return new Promise((resolve, reject) => {
        const child = execFile('python', [file].concat(test.args), {uid: uid, timeout: timeout}, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            let result = {stdout, stderr};
            resolve(result);
        });
        child.stdin.end(test.stdin);
    });
}

function lint(file) {
    return new Promise((resolve, reject) => {
        const child = execFile('flake8', [file], {uid: uid}, (err, stdout, stderr) => {
            if (err && err.code !== 1) {
                reject(err);
            }
            let result = stdout;
            resolve(result);
        });
    });
}

exports.run = run;
exports.lint = lint;
