(function () {
    "use strict";

    var element
      , showing = false;

    function show() {
        appstatus.classList.remove('out');
    }

    function hide() {
        appstatus.classList.add('out');
    }

    WinJS.Namespace.define("Appstat", {
        show: show,
        hide: hide
    });

})();