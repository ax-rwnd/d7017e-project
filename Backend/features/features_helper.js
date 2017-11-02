'use strict';

//see if all mandatory tests are passed
function passAllMandatoryTests(data) {

    mandatoryTests = data.results.io;

    for (i = 0; i < mandatoryTests.length; i++) {
        if mandatoryTests[i].ok == false {
            return false;
        }
    }

    return true;
}


exports.passAllMandatoryTests = passAllMandatoryTests;
