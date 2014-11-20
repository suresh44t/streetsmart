'use strict';
var kue = require('kue');
var logger = require('../../logger').logger;
var jobUtils = require('./jobs.js');
var queue;

function queueGetJobById (id, callback) {
	kue.Job.get(id, callback);
}

function queueJob (jobData) {
    //title is a field necessary for the kue lib
    jobData.title = 'Processing ' + jobData.productName;
    delete jobData.productPriceHistory;

    queue
    .create('scraper', jobData)
    .save();
}

function queueGracefulShutDown(callback) {
    logger.log('info', 'about to shut down queue');
    queue.shutdown(callback, 5000);
}

function queueProcess(callback) {
    queue.process('scraper', callback);
}

function handleJobError (id) {
    logger.log('info', 'job error event received', {id: id});
}

function handleJobFailure (id) {
    queueGetJobById(id, function(err, job) {
        if (err) {
            logger.log('error', 'error getting job id when job failed', {id: id});
            return;
        }
        jobUtils.remove(job);
    });
}

function handleJobComplete (id) {
	queueGetJobById(id, function(err, job) {
	    if (err) {
	        logger.log('error', 'error getting job id when job completed', {id: id});
	        return;
	    }
	    jobUtils.handleJobComplete(job);
	});
}

function queueCreateInstance (handlers) {
    queue = kue.createQueue();
    if (!handlers) {
    	handlers = {};
    }
    if (!handlers.handleJobError) {
    	handlers.handleJobError = handleJobError;
    }
    if (!handlers.handleJobFailure) {
    	handlers.handleJobFailure = handleJobFailure;
    }
    if (!handlers.handleJobComplete) {
    	handlers.handleJobComplete = handleJobComplete;
    }
    queue.on('job error'   , handlers.handleJobError);
    queue.on('job failed'  , handlers.handleJobFailure);
    queue.on('job complete', handlers.handleJobComplete);
}

function getCurrentQueueInstance () {
    return queue;
}

module.exports = {
	create: queueCreateInstance,	//create a new kue instance
	getInstance: getCurrentQueueInstance,	//get the current instance
	insert: queueJob,	//insert job in the queue
	process: queueProcess,	//call .process on the queue
	shutdown: queueGracefulShutDown,	//gracefully shutdown queue
	getJobById: queueGetJobById	//return job by id
};