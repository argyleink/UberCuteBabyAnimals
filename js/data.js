(function () {
    "use strict";

    var babyList = new WinJS.Binding.List()
      , babyGroupedList;

    babyGroupedList = babyList.createGrouped(
        function groupKeySelector(item) {
            return item.categories[0].slug;
        },
        function groupDataSelector(item) {
            return item.categories[0];
        },
        function getGroupKey(leftKey, rightKey) {
            return leftKey.charCodeAt(0) - rightKey.charCodeAt(0);
        }
    );

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.categories[0].slug, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(slug) {
        return babyList.createFiltered(function (item) { return item.category.slug === slug; });
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
            if (item.categories[0].slug === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

    function isNewItem(item) {
        return babyList.indexOf(item) > 0 ? true : false;
    }

    function getWordpressJSON() {
        return new WinJS.xhr({ url: "http://dork.local/ubercute/?json=1" });
    }

    // init data as soon as this module is ready, 
    // other will resolve their promises immediately if it's complete
    getWordpressJSON().then(
        function (data) {
            data = JSON.parse(data.response);
            data.posts.forEach(function (item) {
                babyList.push(item);
                //Storage.newItem(item);
            });
        },
        function (error) {
            console.error(error);
        }
    );

    WinJS.Namespace.define("Data", {
        items: babyGroupedList,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        getWordpressJSON: getWordpressJSON
    });

})();
