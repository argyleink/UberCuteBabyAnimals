(function () {
    "use strict";

    var app                 = WinJS.Application
      , activation          = Windows.ApplicationModel.Activation
      , touchCapabilities   = new Windows.Devices.Input.TouchCapabilities()
      , searchPageURI       = '/pages/search/search.html';

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {

            configureSettingsFlyouts();

            args.setPromise(WinJS.UI.processAll().then(function () {
                return WinJS.Navigation.navigate(Application.navigator.home);
            }));
        }
        else if (args.detail.kind === activation.ActivationKind.search) {
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (!WinJS.Navigation.location) {
                    WinJS.Navigation.history.current = {
                        location: Application.navigator.home, initialState: {}
                    };
                }
                return WinJS.Navigation.navigate(searchPageURI, {
                    queryText: args.detail.queryText
                });
            }));
        }

        if (touchCapabilities.touchPresent)
            WinJS.Utilities.addClass(document.body, 'touch');
    });

    app.oncheckpoint = function (args) {
        console.log(args);
        return;
    };

    app.onsuspend = function (args) {
        return;
    };

    app.onsettings = function (e) {

        // Register settings flyouts
        e.detail.applicationcommands = {
            //"Options": {
            //    href: "/pages/settings/options/index.html",
            //    title: "Options"
            //}
            "About": {
                href: "/pages/settings/about/index.html",
                title: "About"
            }
            , "Privacy": {
                href: "/pages/settings/privacy/index.html",
                title: "Privacy Policy"
            }
        };

        WinJS.UI.SettingsFlyout.populateSettings(e);
    }

    app.onerror = function (eventInfo) {
        console.log(eventInfo.detail.error);
    }

    function configureSettingsFlyouts() {
        var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
    }

    //oAuth.initialize();
    app.start();
})();
