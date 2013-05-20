(function () {
    "use strict";

    var username,
        signout,
        edit_account,
        me;

    WinJS.UI.Pages.define("/pages/settings/sources/index.html", {

        ready: function (element, options) {
            me = this;

            //this.cacheDomElements();
            //this.attachListeners();

            //this.getUsername();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            // TODO: Respond to changes in viewState.
        },

        cacheDomElements: function () {
            username        = document.getElementById('username');
            signout         = document.getElementById('signout');
            edit_account    = document.getElementById('edit-account');
        },

        attachListeners: function () {
            signout.addEventListener('click', this.signoutClicked);
            edit_account.addEventListener('click', this.editAccountClicked);
        },

        setTextElementValue: function (element, value) {
            element.innerText = value;
        },

        getUsername: function () {
            var dataService = Inject("NIM.DataService");

            var userName;

            try {
                userName = dataService.userName();
            }
            catch (e) {
                userName = "not logged in";
            }

            this.setTextElementValue(username, userName);
        },

        signoutClicked: function (e) {
            var that = this;
            var dataService = Inject("NIM.DataService");

            dataService.terminateSessionAsync(true).then(function() {
                me.setTextElementValue(username, "not logged in");
                signout.disabled = true;
                WinJS.Navigation.navigate('/pages/home/Home.html', {strategy : "relogin"});
            });
        },

        editAccountClicked: function (e) {
        }

    });
})();
