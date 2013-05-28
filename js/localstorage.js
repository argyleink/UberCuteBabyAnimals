(function () {
    "use strict";

    var applicationData = Windows.Storage.ApplicationData.current
      , localSettings = applicationData.localSettings
      , localStorage = WinJS.Application.local
      , sessionState = WinJS.Application.sessionState
      , cacheJSON;

    function setCache(data) {
        console.info('new data');
        localStorage.writeText('feed', JSON.stringify(data));
    }

    function getCache() {
        localStorage.readText('feed').done(
            function (data) {
                cacheJSON = JSON.parse(data);
            },
            error
        );
    }
    
    function existsCache() {
        if (cacheJSON) return true;

        localStorage.exists('feed').done(
            function (data) {
                return true;
            },
            function () {
                return false;
            }
        );
    }

    function newItem(item) {
        if (cacheJSON) {
            cacheJSON.posts.push(item);
        }
        else {
            cache().done(function (cache) {
                cache.posts.push(item);
            });
        }
    }

    function newItems(items) {
        if (cacheJSON) {
            items.forEach(function (item) {
                cacheJSON.posts.push(item);
            });
        }
        else {
            cache().done(function (cache) {
                items.forEach(function (item) {
                    cache.posts.push(item);
                });
            });
        }
    }

    function error(error) {
        console.error('error: ' + error);
    }

    WinJS.Namespace.define("Storage", {
        settings: localSettings,
        local: localStorage,
        session: sessionState,
        hasCache: existsCache,
        update: setCache,
        newItem: newItem
    });

    //getCache();

})();
