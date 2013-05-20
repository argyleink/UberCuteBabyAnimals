(function () {
    "use strict";
    var applicationData = Windows.Storage.ApplicationData.current;
    var localSettings = applicationData.localSettings;

    var titles;

    //var localSettings = applicationData.localSettings;

    WinJS.UI.Pages.define("/pages/settings/options/index.html", {

        ready: function (element, options) {
            this.cacheDomElements();
            this.attachListeners();
            this.readLocalSettings();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            // TODO: Respond to changes in viewState.
        },

        cacheDomElements: function () {
            titles = document.getElementById('titles');
        },

        attachListeners: function () {
            titles.onchange = this.titlesChanged;
        },

        readLocalSettings: function() {
            titles.winControl.checked = localSettings.values["showHomeTitles"] == "on" ? true : false;
        },

        titlesChanged: function (e) {
            var checked = titles.winControl.checked; // bool on/off
            localSettings.values["showHomeTitles"] = checked ? "on" : "off";

            if (checked)
                WinJS.Utilities.removeClass(document.body, 'no-titles');
            else
                WinJS.Utilities.addClass(document.body, 'no-titles');
        }

    });

})();
