var { languages } = require('./languages.js');

module.exports = {
	manager : {
        MAX_EXECUTE_TIME : 10000
    },
    docker : {
        LANGS : languages,
        MIN_UNUSED_CONTAINERS_PER_LANG : 1,
        MAX_CONTAINERS_PER_LANG : 6,
        MAX_GLOABAL_CONTAINERS : 8,
        START_PORT : 16000,
        IDLE_TIMEOUT : 10000
    }
};
