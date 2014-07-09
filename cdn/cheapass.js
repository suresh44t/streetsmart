/*jshint quotmark: false */
/*jslint latedef:false*/
'use strict';
(function(){
    (function() {
        // the minimum version of jQuery we want
        var v = '1.11.1';
        function isCurrentjQueryOlderThan(required) {
            var current = window.jQuery.fn.jquery;
            var currentSplit = current.split('.').map(function(ele) {return parseInt(ele);});
            var requiredSplit = required.split('.').map(function(ele) {return parseInt(ele);});
            if (currentSplit[0] === requiredSplit[0]) {
                //1.1.11 1.7.4
                if (currentSplit[1] === requiredSplit[1]) {
                    //1.11.1 1.11.0
                    if (currentSplit[2] === requiredSplit[2]) {
                        //1.11.1 1.11.1
                        return true;
                    } else {
                        return currentSplit[2] < requiredSplit[2];
                    }
                } else {
                    return currentSplit[1] < requiredSplit[1];
                }
            } else {
                return currentSplit[0] < requiredSplit[0];
            }
        }

        // check prior inclusion and version
        if (window.jQuery === undefined || isCurrentjQueryOlderThan(v)) {
            var done = false;
            var script = document.createElement('script');
            script.src = 'http://ajax.googleapis.com/ajax/libs/jquery/' + v + '/jquery.min.js';
            script.onload = script.onreadystatechange = function(){
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    done = true;
                    initCheapass();
                }
            };
            document.getElementsByTagName('head')[0].appendChild(script);
        } else {
            initCheapass();
        }

        function initCheapass() {
            $.ajax({
                url: 'http://cdn.cheapass.in/cheapass.css?ts=' + new Date().getTime(),
                type: 'get',
                crossDomain: true,
                success: function(cssRes) {
                    //Check if the user theme element is in place - if not, create it.
                    if (!$('#cheapassCSS').length) {
                        $('head').append('<style id="cheapassCSS"></style>');
                    }

                    //populate the theme element with the new style (replace the old one if necessary)
                    $('#cheapassCSS').text(cssRes);

                    window.cheapass = function() {
                        var caPopup = '#caPopup';
                        var domTop =
                        '<div id="caPopup">' +
                        '<a id="caClose" class="caClose" title="Close" style="position: absolute; left: -10px; top: -10px;"><div class="circle" style="font-size: 17px; border: 2px solid #444546; padding: 0 0 0 0; width: 26px; height: 26px; background-color:#444546; color: #fff; border-radius: 50px; text-align: center;"> x </div></a>' +
                        '<a target="_blank" href="http://cheapass.in"><img class="caPopupLogo" src="http://cdn.cheapass.in/cheapass.png" /></a>' +
                        '<p class="caFinePrint">Track changes in price. Got notified by email.</p>';
                        var domBottom =
                        '</div>';

                        var url = document.location.href;
                        if ($(caPopup).length) {
                            $(caPopup).remove();
                        }

                        $.ajax({
                            url: 'http://cheapass.in/inputurl',
                            data: {url: url, jsonp: 1},
                            dataType: 'jsonp',
                            success: inputURLResponseHandler
                        });

                        function caClose() {
                            $(caPopup).remove();
                        }

                        function inputURLResponseHandler(response) {
                            if (response.price && response.name) {
                                inputURLSuccessHandler(response);
                            } else {
                                inputURLErrorHandler();
                            }
                        }

                        function inputURLErrorHandler() {
                            var dom = domTop +
                            '<div id="caResponseNotification" class="caResponseNotification">'+
                            '<p class="caTextError" style="margin-bottom: 15px;">Cheapass works only on product pages of <a href="http://cheapass.in" target="_blank">these sellers</a>.</p>'+
                            '<p>Is this a product page but I couldn\'t detect it? <a href="mailto:aakash@cheapass.in">Let me know</a>, please?</p>'+
                            '</div>'+
                            domBottom;

                            $('body').append(dom);
                            $('#caClose').on('click', caClose);
                        }

                        function inputURLSuccessHandler(response) {
                            var name = response.name,
                            price = response.price,
                            image = response.image;

                            var dom = domTop +
                            '<h1 class="caProductName">'+ name +'</h1>' +
                            '<p class="caProductPrice">Price: Rs. '+ price +'/-</p>' +
                            '<form id="caQueueForm" class="caQueueForm">' +
                            '<input type="hidden" name="productName" value="' + name + '" />' +
                            '<input type="hidden" name="productURL" value="' + url + '" />' +
                            '<input type="hidden" name="currentPrice" value="' + price + '" />' +
                            '<input type="hidden" name="productImage" value="' + image + '" />' +
                            '<input type="hidden" name="source" value="bookmarklet" />' +
                            '<input type="hidden" name="jsonp" value="1" />' +
                            '<div class="caFormGroup">' +
                            '<label for="caFormUserEmail">Email</label>' +
                            '<input required autofocus type="email" name="inputEmail" placeholder="Email" />' +
                            '</div>' +
                            '<div class="caFormGroup">' +
                            '<input type="submit" value="Keep me notified" />' +
                            '</div>' +
                            '</form>'+
                            '<div id="caResponseNotification" class="caResponseNotification" style="display:none">'+
                            '<p></p>'+
                            '</div>' +
                            domBottom;

                            $('body').append(dom);

                            $('#caQueueForm').on('submit', handleQueueFormSubmit);
                            $('#caClose').on('click', caClose);
                        }

                        function handleQueueFormSubmit(e) {
                            e.preventDefault();
                            var payload = $(this).serialize();
                            $.ajax({
                                url: 'http://cheapass.in/queue?' + payload,
                                dataType: 'jsonp',
                                success: queueSuccessHandler
                            });
                        }

                        function queueSuccessHandler(res) {
                            var message = res.status;
                            $('#caQueueForm input').attr('disabled', 'disabled');
                            $('#caResponseNotification').find('p').addClass('caTextSuccess').text(message).end().fadeIn();
                        }
                    };

                    window.cheapass();

                }
            });
        }
    })();
})();
