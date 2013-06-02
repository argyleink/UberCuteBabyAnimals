(function () {
    "use strict";

    var auth = oAuth;

    WinJS.Namespace.define("Facebook", {
        userData: null,
        user: {
            get: function () {
                return this.userData;
            },
            set: function (val) {
                this.userData = val;

                if (val == null) {
                    console.log('user data null');
                    Facebook.unsetUser();
                    Facebook.connected = false;
                }
                else {
                    console.log('user data set: ' + val);
                    this.isConnected = true;
                    //Facebook.setUser();
                }
            }
        },

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

        postStatus: function (item) {
            console.log('posting: ' + item.title);

            return new WinJS.xhr({
                type: 'POST',
                url: 'https://graph.facebook.com/me/feed?' +
                     'access_token=' + oAuth.accessToken +
                     '&message=Found a yummy recipe! ' + item.title + '. Here\'s how you make them: ' + item.directions
            });

        },

        like: function (options) {
            console.info('liking ' + options.title);
            var that = this;

            return new WinJS.xhr({
                type: 'POST',
                url: 'https://graph.facebook.com/me/og.likes?' +
                     'access_token=' + oAuth.accessToken +
                     '&method=POST' + 
                     '&object=' + encodeURIComponent(options.url)
            });

        },

        unlike: function (options) {
            console.log('unliking ' + options.title);

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
        },

        getTotalLikes: function (id) {
            console.log('getting total likes for id:' + id);

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
        },

        getWhoLikes: function (id) {
            console.log('get who likes id: ' + id);

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
        },

        comment: function (options) {
            console.log('commenting on ' + options.title);

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
        },

        getUserData: function () {
            console.log('getting user data');

            return new WinJS.xhr({
                type: 'GET',
                url: 'https://graph.facebook.com/me?' +
                     'access_token=' + oAuth.accessToken
            });

        },

        setUser: function () {
            var user = this.userData;

            var container = document.getElementById('facebook-user');
            var name = container.querySelector('h2');
            var img = container.querySelector('img');

            name.innerText = user.first_name + ' ' + user.last_name;
            img.src = 'http://graph.facebook.com/' + user.id + '/picture';

            WinJS.UI.Animation.enterContent(
            container,
                {
                    top: "0px",
                    left: "30px",
                    rtlflip: false
                }
            );
        },

        unsetUser: function () {
            document.getElementById('facebook-user').style.opacity = '0';
        }

    });

})();