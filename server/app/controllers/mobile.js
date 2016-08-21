'use strict';
require('es6-promise').polyfill();
require('isomorphic-fetch');
var Emails = require('./emails');
var jobUtils = require('../lib/jobs');
var _ = require('underscore');
_.str = require('underscore.string');
var mongoose = require('mongoose');
var User = mongoose.model('User');
// var Job = mongoose.model('Job');
var config = require('../../config/config');
var logger = require('../../logger').logger;

module.exports = {
	initiateDeviceRegistration: function(req, res) {
		var payload = req.body.email ? req.body : req.query;
		var registrationData = _.pick(payload, ['email']);

		if (!registrationData.email) {
			res.json({status: 'error', message: 'Please enter an email id'});
			return;
		}

		//generate a 6 digit number and store it in the db corresponding to the email id
		var verificationCode = Math.floor(Math.random()*999999+1);

		User.update(
			{email: registrationData.email},
			{$push: {verificationCodes: verificationCode}},
			{upsert: true}, function() {
				registrationData.verificationCode = verificationCode;
				Emails.sendDeviceVerificationCode(registrationData, function() {
					res.json({status: 'ok'});
				});
			}
		);
	},
	verifyDeviceRegistration: function(req, res) {
		var payload = req.body.email ? req.body : req.query;
		var registrationData = _.pick(payload, ['email', 'verify_code']);

		if (!registrationData.email) {
			res.json({status: 'error', message: 'Please enter an email id'});
			return;
		}

		if (!registrationData.verify_code) {
			res.json({status: 'error', message: 'Please enter the verification code'});
			return;
		}

		User.findOne({email: registrationData.email}).lean().exec(function(err, userDoc) {
			var verificationCodes = userDoc.verificationCodes;
			var isValidVerificationCode = !!(_.find(verificationCodes, function(verificationCode) {
				return verificationCode === registrationData.verify_code;
			}));

			if (isValidVerificationCode) {
				res.json({status: true});
			} else {
				res.json({status: false});
			}
		});

	},
	finalizeDeviceRegistration: function(req, res) {
		var registrationData = _.pick(req.body, ['email', 'token']);

		if (!registrationData.email) {
			res.json({status: 'error', message: 'Please send an email id'});
			return;
		}

		if (!registrationData.token) {
			res.json({status: 'error', message: 'Please send the device id'});
			return;
		}

		User.update({email: registrationData.email}, {androidDeviceToken: registrationData.token}, {}, function(err, updatedDoc) {
			if (err || !updatedDoc) {
				res.json({status: 'error', message: err});
				return;
			}
			res.json({status: 'ok'});
		});

	},
	simulateNotification: function(req, res) {
		var payload = _.pick(req.query, ['email']);
		if (payload.email === 'aakash.lpin@gmail.com') {
			var emailUser = {
				email: payload.email
			};

			var emailProduct = {
				productPrice: 69999,
				productName: 'Apple iPhone 6 Plus',
				productURL: 'http://www.flipkart.com/apple-iphone-5s/p/itmdv6f75dyxhmt4?pid=MOBDPPZZDX8WSPAT',
				currentPrice: 69999,
				oldPrice: 80000,
				seller: 'Flipkart',
				measure: 'dropped'
			};

			jobUtils.sendNotifications(emailUser, emailProduct);
			res.json({status: 'ok'});

		} else {
			res.json({status: 'error', message: 'email id not a developer'});
		}
	},
	simulateIOSNotification: function (req, res) {
		var emailProduct = {
			productName: 'Fitbit Charge Wireless Activity Tracker and Sleep Wristband, Large (Black)',
			productURL: 'http://www.flipkart.com/apple-iphone-5s/p/itmdv6f75dyxhmt4?pid=MOBDPPZZDX8WSPAT',
			currentPrice: 7990,
			oldPrice: 9990,
			seller: 'amazon',
			measure: 'dropped'
		};

		jobUtils.sendNotifications({email: 'aakash.lpin@gmail.com'}, emailProduct);
		res.json({status: 'ok'});
	},
	storeIOSDeviceToken: function (req, res) {
		var props = _.pick(req.body, ['email', 'parsePayload']);
		if (!props.email || !props.parsePayload) {
			return res.json({status: 'error', message: 'Invalid Request. Expected email and parsePayload'});
		}

		logger.log('info', 'installation data is ', props.email, props.parsePayload);

		var url = 'https://api.parse.com';
		url += '/1/installations';
		fetch(url, {
				method: 'post',
				headers: {
						'Accept': 'application/json',
						'X-Parse-Application-Id': config.PARSE.APP_ID,
						'X-Parse-REST-API-Key': config.PARSE.REST_KEY,
						'Content-Type': 'application/json'
				},
				body: JSON.stringify(props.parsePayload)
		})
		.then(function (response) {
			return response.json();
		})
		.then(function (response) {
			logger.log('info', 'response from Parse to POST request to create a new installation', response);
			var resourceURI;
			if (response.Location) {
				resourceURI = response.Location;
			} else {
				resourceURI = 'https://api.parse.com/1/installations/' + response.objectId;
			}
			return fetch(resourceURI, {
				method: 'put',
				headers: {
					'Accept': 'application/json',
					'X-Parse-Application-Id': config.PARSE.APP_ID,
					'X-Parse-REST-API-Key': config.PARSE.REST_KEY,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: props.email
				})
			})
		})
		.then(function (response) {
			return response.json();
		})
		.then(function (response) {
			logger.log('info', 'response from parse PUT request to attach email to Installation', response);
			User.update({email: props.email}, {$push: {iOSDeviceTokens: props.parsePayload.deviceToken}}, {}, function(err, updatedDoc) {
				if (err || !updatedDoc) {
					res.json({status: 'error', message: 'Internal Server Error', error: err});
					return;
				}
				res.json({status: 'ok'});
			})
		})
		.catch(function (e) {
			res.json({status: 'error', message: 'Internal Server Error in Catch', error: e});
		});
	}
};
