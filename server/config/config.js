'use strict';

var path = require('path'),
rootPath = path.normalize(__dirname + '/..'),
env = process.env.NODE_ENV || 'development';

var config = {
    development: {
        root: rootPath,
        app: {
            name: 'streetsmart'
        },
        port: 3000,
        server: 'http://localhost:3000',
        db: 'mongodb://localhost/streetsmart-development',
        requestTimeout: 1*60*1000,    //1 minute
        cronPattern: '*/5 * * * *'    //every 5 minutes
    },

    test: {
        root: rootPath,
        app: {
            name: 'streetsmart'
        },
        port: 3000,
        server: 'localhost:3000',
        db: 'mongodb://localhost/streetsmart-test',
        requestTimeout: 1*60*1000,    //1 minute
        cronPattern: '*/5 * * * *'    //every 5 minutes
    },

    production: {
        root: rootPath,
        app: {
            name: 'streetsmart'
        },
        port: 3000,
        server: 'http://becheap.in',
        db: 'mongodb://localhost/streetsmart-production',
        requestTimeout: 30*60*1000,    //30 minutes
        cronPattern: '* */2 * * *'    //every 2 hours
    }
};

module.exports = config[env];
