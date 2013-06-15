(function () {
    "use strict";

    var auth = oAuth;
    var debug = false;

    WinJS.Namespace.define("Facebook", {
        isConnected: false,
        connected: {
            get: function () {
                return this.isConnected;
            },
            set: function (val) {
                this.isConnected = val;

                if (val)
                    WinJS.Utilities.addClass(document.body, 'fb-connected');
                else
                    WinJS.Utilities.removeClass(document.body, 'fb-connected');
            }
        },

        like: function (item, url) {
            console.info('liking ' + item.title);

            return new WinJS.xhr({
                type: 'POST',
                url: 'https://graph.facebook.com/me/og.likes?' +
                     'access_token=' + oAuth.accessToken +
                     '&method=POST' + 
                     '&object=' + encodeURIComponent(url)
            });
        },

        getTotalLikes: function (id) {
            debug && console.log('getting total likes for id:' + id);

            return new WinJS.Promise(function (complete, error) {
                setTimeout(function () {
                    try {
                        complete(true);
                    }
                    catch (e) {
                        error(e);
                    }
                }, 1000);
            });
        }

    });

})();