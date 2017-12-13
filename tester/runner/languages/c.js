const { execFile, spawnSync } = require('child_process');
const fs = require('fs');
const config = require('config');

const uid = config.get('uid');

function run(file, test, timeout) {
    return new Promise((resolve, reject) => {
        try {
            child = spawnSync(file, test.args, {uid: uid, timeout: timeout, input:test.stdin});
            var out = child.stdout.toString();
            var err = child.stderr.toString();
            resolve({stdout: out, stderr: err});
        } catch(e) {
            reject(e);
        }
    });
}

function prepare(file) {
    return new Promise((resolve, reject) => {
        let newfile = file.replace('.tmp', '.c');
        let output = file.replace('.tmp','.out');
        let args = ['-o', output, newfile];
        fs.copyFileSync(file, newfile, (err) => {
            if (err) {
                reject(err);
            }
        });
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
