(function () {
    "use strict";
    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;

    WinJS.UI.Pages.define("/pages/settings/options/index.html", {

        ready: function (element, options) {
            this.attachListeners();
            this.readLocalSettings();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            // TODO: Respond to changes in viewState.
        },

        attachListeners: function () {
            fb_toggle.onchange = this.fbChanged;
        },

        readLocalSettings: function() {
            fb_toggle.winControl.checked = Facebook.isConnected;
        },

        fbChanged: function (e) {
            var checked = fb_toggle.winControl.checked; // bool on/off

            if (checked)
                oAuth.login();
            else
                oAuth.logout();
        }

    });

})();
