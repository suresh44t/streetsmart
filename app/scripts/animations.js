'use strict';
/*globals twttr*/

(function($, window) {
	var Counters = {
		// $usersCount: $('#ca-counters-users'),
		// $itemsCount: $('#ca-counters-products'),
		$emailsCount: $('#ca-counters-emails'),
		init: function() {
			$.getJSON('/stats', function(res) {
				// Counters.$usersCount.html(res.totalUsers);
				// Counters.$itemsCount.html(res.itemsTracked);
				Counters.$emailsCount.html(res.emailsSent);
				var odometer = new Odometer({
					el: Counters.$emailsCount[0],
					value: res.emailsSent,
					theme: 'car'
				});
				odometer.render();
			});
		}
	};

	var LandingBackground = {
		$el: $('.landing-image'),
		imgSrc: '../img/cover3.jpg',
		init: function () {
			var bgImg = new Image();
			bgImg.onload = function(){
			   LandingBackground.$el.css({
					'background-image': 'url(' + bgImg.src + ')'
			   })
			   .addClass('animated fadeIn');
			};
			bgImg.src = LandingBackground.imgSrc;
		}
	};

	var SocialProof = {
		$el: $('#social-proof'),
		init: function () {
			twttr.events.bind(
				'loaded',
				function () {
					var handler = SocialProof.$el.find('>li');
					handler.each(function() {
						//hack for safari (width returned as 0)
						$(this).css({
							height: $(this).height() + 'px',
							width: ($(this).width() || 500) + 'px'
						});
					});

					handler.wookmark({
						container: SocialProof.$el,
						autoResize: true
					});
				}
			);
		}
	};

	window.App.Counters = Counters;
	window.App.LandingBackground = LandingBackground;
	window.App.SocialProof = SocialProof;

})(jQuery, window);