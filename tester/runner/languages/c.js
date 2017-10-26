const { execFile } = require('child_process');
const fs = require('fs');
const config = require('config');

const uid = config.get('uid');

function run(file, test, timeout) {
    return new Promise((resolve, reject) => {
        const child = execFile(file, test.args, {uid: uid, timeout: timeout}, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            let result = {stdout, stderr};
            resolve(result);
        });
        child.stdin.end(test.stdin);
    });
}

function prepare(file) {
    let newfile = file.replace('.tmp', '.c');
    let output = file.replace('.tmp','.exe');
    let args = ['-o', output, newfile];
    fs.copyFileSync(file, newfile, (err) => {
        if (err) {
            reject(err);
        }
    });
    return new Promise((resolve, reject) => {
        execFile('gcc', args, {uid: uid}, (err, stdout, stderr) => {
            if (err && err.code !== 1) {
                reject(err);
            }
            let error = stderr;
            let result = [output, error];
            resolve(result);
        });
    });
}

exports.run = run;
exports.prepare = prepare;
