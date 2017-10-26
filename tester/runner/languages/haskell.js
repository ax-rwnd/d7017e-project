const { execFile } = require('child_process');
//STIDIN BROKEN
function run(file, test, timeout) {
    return new Promise((resolve, reject) => {
        const child = execFile('runhaskell', [file].concat(test.args), {timeout: timeout}, (err, stdout, stderr) => {
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
