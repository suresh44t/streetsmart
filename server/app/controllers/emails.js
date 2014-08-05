'use strict';

var path       = require('path'),
templatesDir   = path.resolve(__dirname, '..', 'templates'),
emailTemplates = require('email-templates'),
_              = require('underscore'),
config         = require('../../config/config');

var postmark = require('postmark')(config.postmarkAPIKey);

module.exports = {
    sendVerifier: function(user, product, callback) {
        emailTemplates(templatesDir, function(err, template) {
            if (err) {
                callback(err);

            } else {
                var encodedEmail = encodeURIComponent(user.email);
                var locals = {
                    user: user,
                    product: product,
                    verificationLink: config.server + '/verify?' + 'email=' + encodedEmail
                };

                template('verifier', locals, function(err, html) {
                    if (err) {
                        callback(err);
                    } else {
                        postmark.send({
                            'From': 'Cheapass India <notifications@cheapass.in>',
                            'To': locals.user.email,
                            'Bcc': 'aakash@cheapass.in',
                            'ReplyTo' : 'aakash@cheapass.in',
                            'HtmlBody': html,
                            'Subject': 'Confirm email to receive price change notifications'
                        }, function(err, responseStatus) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, responseStatus);
                            }
                        });
                    }
                });
            }
        });

    },
    sendNotifier: function(user, product, callback) {
        emailTemplates(templatesDir, function(err, template) {
            if (err) {
                callback(err);

            } else {
                var locals = {
                    user: user,
                    product: product,
                    server: config.server
                };

                var encodedEmail = encodeURIComponent(product.email);
                var encodedURL = encodeURIComponent(product.productURL);
                var baseUnsubscribeLink = config.server + '/unsubscribe?email=' + encodedEmail;
                _.extend(locals.product, {
                    productUnsubscribeLink: baseUnsubscribeLink + '&productURL=' + encodedURL,
                    allUnsubscribeLink: baseUnsubscribeLink,
                    selfProductRedirectURL: config.server + '/redirect?url=' + encodedURL
                });

                // Send a single email
                template('notifier', locals, function(err, html) {
                    if (err) {
                        callback(err);
                    } else {
                        postmark.send({
                            'From': 'Cheapass India <notifications@cheapass.in>',
                            'To': locals.user.email,
                            'ReplyTo' : 'aakash@cheapass.in',
                            'HtmlBody': html,
                            'Subject': 'Price change notification for ' + locals.product.productName,
                        }, function(err, responseStatus) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, responseStatus);
                            }
                        });
                    }
                });
            }
        });
    },
    sendHandshake: function(user, product, callback) {
        emailTemplates(templatesDir, function(err, template) {
            if (err) {
                callback(err);

            } else {
                var locals = {
                    user: user,
                    product: product
                };

                template('handshake', locals, function(err, html) {
                    if (err) {
                        callback(err);
                    } else {
                        postmark.send({
                            'From': 'Cheapass India <notifications@cheapass.in>',
                            'To': locals.user.email,
                            'Bcc': 'aakash@cheapass.in',
                            'ReplyTo' : 'aakash@cheapass.in',
                            'HtmlBody': html,
                            'Subject': 'Price Track added for ' + locals.product.productName
                        }, function(err, responseStatus) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, responseStatus);
                            }
                        });
                    }
                });
            }
        });
    },
    sendFeatureMail: function(users, callback) {
        //pass to this method an array of user emails
        emailTemplates(templatesDir, function(err, template) {
            if (err) {
                callback(err);

            } else {
                var locals = {
                    users: users
                };

                forEach(users, function(user) {
                    template('freecharge', user, function(err, html) {
                        if (err) {
                            callback(err);
                        } else {
                            postmark.send({
                                'From': 'Cheapass India <notifications@cheapass.in>',
                                'To': user.email,
                                'Bcc': 'aakash@cheapass.in',
                                'ReplyTo' : 'aakash@cheapass.in',
                                'HtmlBody': html,
                                'Subject': 'Win Rs. 25/- FreeCharge Coupon every time you track before buying'
                            }, function(err, responseStatus) {
                                if (err) {
                                    console.log('error', err);
                                } else {
                                    console.log('sent', responseStatus);
                                }
                            });
                        }
                    });
                });

                callback(null, 'emails queued');
            }
        });
    }
};
