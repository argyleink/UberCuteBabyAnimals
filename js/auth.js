var oAuth = (function () {
    "use strict";

    var authzInProgress = false;
    var clientID = 590172364346601;
    var secret = 'aaa7ef084f4ffba73091315cd884ee65';
    var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=";
    var callbackURL = 'https://www.facebook.com/connect/login_success.html';
    var extendTokenURL = 'https://graph.facebook.com/oauth/access_token?';
    var accessToken = null;
    var tokenFile = null;
    var localFolder = Windows.Storage.ApplicationData.current.localFolder;
    var debug = false;

    function launchFacebookWebAuth() {
        debug && console.log('launching facebook authentication');
        facebookURL += clientID + "&redirect_uri=" + encodeURIComponent(callbackURL) + "&scope=publish_actions&display=popup&response_type=token";

        var startURI = new Windows.Foundation.Uri(facebookURL);
        var endURI = new Windows.Foundation.Uri(callbackURL);

        authzInProgress = true;
        Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(
            Windows.Security.Authentication.Web.WebAuthenticationOptions.none, startURI, endURI)
            .done(function (result) {
                if (result.responseStatus !== Windows.Security.Authentication.Web.WebAuthenticationStatus.errorHttp) {
                    debug && console.log('facebook connected');

                    YeahToast.show({
                        imgsrc: "/images/facebook-icon.png",
                        title: "Logged In!",
                        textContent: "Find the Like button in the app bar, while looking at a baby animal full screen."
                    });

                    var responseObj = parseResponse(result);
                    oAuth.accessToken = responseObj.access_token;
                    if (oAuth.accessToken) {
                        extendAccessToken().then(function (response) {
                            oAuth.accessToken = response.access_token;
                            writeText(oAuth.accessToken);
                        });
                        setUserData();
                    }
                }
                authzInProgress = false;
            }, function (err) {
                debug && console.log('facebook connect has failed');
                WinJS.log("Error returned by WebAuth broker: " + err, "Web Authentication SDK Sample", "error");
                authzInProgress = false;
            });
    }

    function extendAccessToken() {
        return new WinJS.Promise(function (c, e, p) {
            var url = extendTokenURL + 'grant_type=fb_exchange_token&client_id=' + clientID + '&client_secret='+secret+'&fb_exchange_token=' + oAuth.accessToken;
            WinJS.xhr({ url: url }).done(function (result) {
                var responseObj = processHashString(result.responseText);
                c(responseObj);
            });

        });
    }

    function parseResponse(result) {
        var parser = document.createElement('a');
        parser.href = result.responseData;
        var hashString = parser.hash.substr(1, parser.hash.length);

        return processHashString(hashString);
    }

    function processHashString(string) {
        var tokens = string.split('&');
        var responseObj = {};

        for (var i in tokens) {
            var keyValues = tokens[i].split('=');
            responseObj[keyValues[0]] = keyValues[1];
        }

        return responseObj;
    }

    function getToken() {
        debug && console.log('checking for a local auth token');
        return new WinJS.Promise(function (c, e, p) {
            localFolder.getFileAsync("token.ubercutedata").done(
            function (file) {
                debug && console.log('local auth token exists');
                tokenFile = file;
                readText(tokenFile).then(function () {
                    c();
                }, function (error) {
                    e(error);
                });
            },
            function (err) {
                debug && console.log('no local auth token, creating one now...');
                localFolder.createFileAsync("token.ubercutedata", Windows.Storage.CreationCollisionOption.replaceExisting).done(function (file) {
                    debug && console.log('local auth token created');
                    tokenFile = file;
                    e('no authentication token');
                });
            });
        });
    }

    function authenticate() {
        getToken().then(function success() {
            //authenticated

            Facebook.connected = true;
            setUserData();
        }, function error(e) {
            launchFacebookWebAuth();
        });

        addSettingsFlyout();
    }

    function setUserData() {
        Facebook.getUserData().then(function (data) {
            debug && console.log('data exists!');
            Facebook.user = JSON.parse(data.responseText);;
        }, function (error) {
            Facebook.user = null;
            debug && console.log('getUserDataFailed: ' + error);
        });
    }

    function writeText(text) {
        if (tokenFile !== null) {
            Windows.Storage.FileIO.writeTextAsync(tokenFile, text).done(function () {
                //success!
            },
            function (error) {
                WinJS.log && WinJS.log(error, "sample", "error");
            });
        }
    }

    function readText(file) {
        return new WinJS.Promise(function (c, e, p) {
            if (file !== null) {
                Windows.Storage.FileIO.readTextAsync(file).done(function (fileContent) {
                    if (fileContent) {
                        oAuth.accessToken = fileContent;
                        c();
                    } else {
                        e('no access token');
                    }
                },
                function (error) {
                    WinJS.log && WinJS.log(error, "sample", "error");
                    e(error);
                });
            }
        });
    }

    function logOut() {
        debug && console.log('logged out');
        oAuth.accessToken = null;
        Facebook.user = null;
        addSettingsFlyout();
        localFolder.createFileAsync("token.ubercutedata", Windows.Storage.CreationCollisionOption.replaceExisting);

        YeahToast.show({
            imgsrc: "/images/facebook-icon.png",
            title: "Logged Out",
            textContent: "See ya later"
        });
    }

    function addSettingsFlyout() {
        var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
        settingsPane.addEventListener("commandsrequested", onCommandsRequested);
    }

    function onLogIn() {
        authenticate();
    }

    function onLogout() {
        logOut();
    }

    function onCommandsRequested(eventArgs) {
        if (oAuth.accessToken) {
            var settingsCommand = new Windows.UI.ApplicationSettings.SettingsCommand("logout", "Log out of Facebook", onLogout);
        } else {
            var settingsCommand = new Windows.UI.ApplicationSettings.SettingsCommand("login", "Connect Facebook", onLogIn);
        }

        eventArgs.request.applicationCommands.append(settingsCommand);
    }

    function initialize() {
        getToken().done(function () {
            addSettingsFlyout();
            setUserData();
        },
        function () {
            addSettingsFlyout();

            Storage.exists('facebook_prompts').done(function (result) {
                if (result == false) {
                    Storage.add({
                        key: 'facebook_prompts',
                        value: '1'
                    });

                    YeahToast.show({
                        imgsrc: "/images/facebook-icon.png",
                        title: "Now you can Like babies!",
                        textContent: "Sign in to Facebook from the settings (charms)."
                    });
                }
            });
        });
    }

    return {
        initialize: initialize,
        facebook: authenticate,
        accessToken: accessToken
    };
})();
