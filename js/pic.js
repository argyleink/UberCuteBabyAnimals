(function () {
    "use strict";

    function load(src) {
        return new WinJS.Promise(function (comp, err, prog) {
            var img = document.createElement('img');
            img.src = src;
            img.onload = function () {
                comp(src);
            }.bind(comp);
        });
    }

    WinJS.Namespace.define("Pic", {
        load: load
    });

})();
