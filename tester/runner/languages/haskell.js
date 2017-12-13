const { execFile } = require('child_process');
const config = require('config');

const uid = config.get('uid');
//STIDIN BROKEN
function run(file, test, timeout) {
    return new Promise((resolve, reject) => {
        const child = execFile('runhaskell', [file].concat(test.args), {uid: uid, timeout: timeout}, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            let result = {stdout, stderr};
            resolve(result);
        });
        child.stdin.end(test.stdin);
    });
}

exports.run = run;
