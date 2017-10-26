var { languages } = require('./languages.js');

//This is the default configuration file for the docker manager
//other config files will overwrite some or all default fields
module.exports = {
    manager : {
        MAX_EXECUTE_TIME : 10000,
        MAX_QUEUE_SIZE : 32
    },
    docker : {
        LANGS : languages,
        MIN_UNUSED_CONTAINERS_PER_LANG : 1,
        MAX_CONTAINERS_PER_LANG : 6,
        MAX_GLOBAL_CONTAINERS : 8,
        START_PORT : 16000,
        IDLE_TIMEOUT : 10000,
        CONTAINER_MEMORY: 100000000, // bytes
        CONTAINER_CPU_PERIOD: 100000,
        CONTAINER_CPU_QUOTA: 50000 // quota/period = 50% cpu
    }
};
