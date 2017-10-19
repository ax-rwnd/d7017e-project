const { execFile } = require('child_process');

function run(file, test, timeout) {
    return new Promise((resolve, reject) => {
        const child = execFile('python3', [file].concat(test.args), {timeout: timeout}, (err, stdout, stderr) => {
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
        const child = execFile('flake8', [file], (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            let result = stdout;
            resolve(result);
        });
    });
}

exports.run = run;
exports.lint = lint;
