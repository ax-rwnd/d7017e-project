const { execFile } = require('child_process');
const fs = require('fs');
const config = require('config');

const uid = config.get('uid');
const filename = 'main';

function run(file, test, timeout) {
    let args = ['-cp',file.replace(filename,''),filename].concat(test.args);
    return new Promise((resolve, reject) => {
        const child = execFile('java', args, {uid: uid, timeout: timeout}, (err, stdout, stderr) => {
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
    return new Promise((resolve, reject) => {
        let newfile = file.replace(/tmp-.*/,'main.java');
        fs.copyFileSync(file, newfile, (err) => {
            if (err) {
                reject(err);
            }
        });
        execFile('javac', [newfile], {uid: uid}, (err, stdout, stderr) => {
            if (err && err.code !== 1) {
                reject(err);
            }
            let file = newfile.replace('.java','');
            let error = stderr;
            let result = [file, error];
            resolve(result);
        });
    });
}

exports.run = run;
exports.prepare = prepare;
