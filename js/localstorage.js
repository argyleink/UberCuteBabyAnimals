(function () {
    "use strict";

    var applicationData = Windows.Storage.ApplicationData.current
      , localSettings = applicationData.localSettings
      , localStorage = WinJS.Application.local
      , sessionState = WinJS.Application.sessionState
      , cacheJSON;

    function setFeedCache(data) {
        console.info('new data');
        if (!existsFeedCache()) {
            localStorage.writeText('feed', JSON.stringify(data));
        }
        else {
            compareFeeds(data);
        }
    }

    function compareFeeds(newList) {
        
    }

    function deepEquals(o1, o2) {
        var k1 = Object.keys(o1).sort();
        var k2 = Object.keys(o2).sort();
        if (k1.length != k2.length) return false;
        return k1.zip(k2, function(keyPair) {
            if(typeof o1[keyPair[0]] == typeof o2[keyPair[1]] == "object"){
                return deepEquals(o1[keyPair[0]], o2[keyPair[1]])
            } else {
                return o1[keyPair[0]] == o2[keyPair[1]];
            }
        }).all();
    }

    function getFeedCache() {
        localStorage.readText('feed').done(
            function (data) {
                cacheJSON = JSON.parse(data);
            },
            error
        );
    }
    
    function existsFeedCache() {
        if (cacheJSON) return true;

        localStorage.exists('feed').done(
            function (result) {
                return result;
            },
            function () {
                return false;
            }
        );
    }

    function newItem(item) {
        cache().done(function (cache) {
            cacheJSON.posts.push(item);
        });
    }

    function newItems(items) {
        cache().done(function (cache) {
            items.forEach(function (item) {
                cacheJSON.posts.push(item);
            });
        });
    }

    function viewImage(id) {
        hasViewedImage(id).done(function (result) {
            if (result == false) {
                localStorage.writeText(id, "true");
            }
        });
    }

    function hasViewedImage(id) {
        return localStorage.exists(id.toString());
    }

    function error(error) {
        console.error('error: ' + error);
    }

    WinJS.Namespace.define("Storage", {
        settings: localSettings,
        local: localStorage,
        session: sessionState,
        hasFeedCache: existsFeedCache,
        updateFeed: setFeedCache,
        exists: hasViewedImage,
        viewImage: viewImage
    });

    if (existsFeedCache())
        getFeedCache();

})();
