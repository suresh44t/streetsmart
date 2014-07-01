'use strict';
var _ = require('underscore');
module.exports = function($) {
	var priceDOM = $('[itemprop="price"]');
	var price;
	price = parseInt(priceDOM.text().split('Rs.')[1].replace(',', ''), 10);

	if (_.isNaN(price)) {
		price = false;
	}

	var imageDOM = $('[itemprop="image"]');

    return {
        price: price,
        name: $('[itemprop="name"]').text().replace(/^\s+|\s+$/g, ''),
        image: imageDOM.attr('src')
    };
};