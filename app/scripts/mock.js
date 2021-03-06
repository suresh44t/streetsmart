'use strict';
(function($, window) {

	if (window.location.host.indexOf('localhost') === -1) {
		return;
	}

	$.mockjax({
		url: '/inputurl',
		contentType: 'text/json',
		responseTime: 2000,
		responseText: {
			productName: 'Apple iPhone 5S',
			productImage: 'http://img5a.flixcart.com/image/mobile/z/h/f/apple-iphone-5s-400x400-imadpppc54zfpj9c.jpeg',
			productPrice: 45940,
			seller: 'Flipkart'
		}
	});

	$.mockjax({
		url: '/queue',
		contentType: 'text/json',
		responseTime: 1000,
		responseText: {
			status: 'Sweet! We\'ll keep you posted as the price changes.'
		}
	});

	$.mockjax({
		url: '/stats',
		contentType: 'text/json',
		responseTime: 1000,
		responseText: {
			emailsSent: 16756
		}
	});

	$.mockjax({
		url: '/api/tracks/1',
		contentType: 'text/json',
		responseTime: 1500,
		proxy: '/scripts/page1results.json'
	});

	$.mockjax({
		url: '/api/tracks/2',
		contentType: 'text/json',
		responseTime: 1500,
		proxy: '/scripts/page2results.json'
	});

	$.mockjax({
		url: '/api/tracks/3',
		contentType: 'text/json',
		responseTime: 1500,
		proxy: '/scripts/page3results.json'
	});

	$.mockjax({
		url: '/copy',
		contentType: 'text/json',
		responseTime: 500,
		responseText: {
			status: 'ok',
			id: '5433870387adc5161cce89d2'
		}
	});

	$.mockjax({
		url: '/user/*',
		contentType: 'text/json',
		responseTime: 500,
		responseText: {
			status: 'ok',
			id: '5433870387adc5161cce89d2'
		}
	});

})(jQuery, window);
