(function () {
    "use strict";

    var babyList = new WinJS.Binding.List()
      , babyGroupedList
      , categories = []
      , liveTileService = App.LiveTile
      , liveTileContent = []
      , readyComplete
      , readyError;

    // if we have cache, init list with cache

    // else create new list

    babyGroupedList = babyList.createGrouped(
        function groupKeySelector(item) {
            return item.categories[0].slug;
        },
        function groupDataSelector(item) {
            return item.categories[0];
        },
        function getGroupKey(leftKey, rightKey) {
            var left = leftKey.charCodeAt(0) + leftKey.charCodeAt(1);
            var right = rightKey.charCodeAt(0) + rightKey.charCodeAt(1);
            return left - right;
        }
    );

    function dataRecieved(data) {
        var itemCount = 0;

        data = JSON.parse(data.response);

        data.posts.forEach(function (item) {
            item.title = decodeHtml(item.title);
            item.categories[0].image = item.attachments[0].images.large.url;

            babyList.push(item);
            !categoryContains(item.categories[0].slug) && categories.push(item.categories[0].slug);

            // make 5 live tiles
            if (itemCount < 5) {
                liveTileContent.push({
                    srcWide: item.attachments[0].images.large.url,
                    srcSmall: item.attachments[0].images.medium.url,
                    text: item.title
                });
                itemCount++;
            }

            //Storage.newItem(item);
        });

        updateLiveTiles();

        console.info('data loaded');
        readyComplete();
    }

    function ready() {
        return new WinJS.Promise(function (comp, err, prog) {
            readyComplete = comp;
            readyError = err;

            getWordpressJSON().then(dataRecieved, error);
        });
    }

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    function getCategories() {
        return categories;
    }

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.categories[0].slug, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(slug) {
        return babyList.createFiltered(function (item) {
            for (var i = 0, l = item.categories.length; i < l; i++) {
                if (item.categories[i].slug === slug)
                    return true;
            }
            return false;
        });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < babyGroupedList.groups.length; i++) {
            if (babyGroupedList.groups.getAt(i).key === key) {
                return babyGroupedList.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < babyGroupedList.length; i++) {
            var item = babyGroupedList.getAt(i);
            if (item.id === reference.id) {
                return item;
            }
        }
    }

    function getItemIndex(reference) {
        for (var i = 0; i < babyGroupedList.length; i++) {
            var item = babyGroupedList.getAt(i);
            if (item.id === reference.id) {
                return i;
            }
        }
    }

    function isNewItem(item) {
        return babyList.indexOf(item) > 0 ? true : false;
    }

    function categoryContains(item) {
        var i = categories.length;
        while (i--)
            if (categories[i] === item) return true;
        return false;
    }

    function getWordpressJSON() {
        return new WinJS.xhr({
            url: 'http://dork.local/ubercute/?json=1'
          , type: 'GET'
          , responseType: 'json'
        });
    }

    function updateLiveTiles() {
        liveTileService.initialize();
        liveTileService.updateLiveTiles(liveTileContent);
    }

    function error(error) {
        console.error(error);
        readyError();
    }

    WinJS.Namespace.define("Data", {
        ready: ready(),
        items: babyGroupedList,
        categories: getCategories,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        getItemIndex: getItemIndex,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        getWordpressJSON: getWordpressJSON
    });

})();
