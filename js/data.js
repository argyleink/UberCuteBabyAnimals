(function () {
    "use strict";

    var homeList = new WinJS.Binding.List()
      , babyList = new WinJS.Binding.List()
      , babyGroupedList
      , homeGroupedList
      , categories = []
      , liveTileService = App.LiveTile
      , liveTileContent = []
      , rawData
      , rawJSON
      , readyComplete
      , readyError;

    // if we have cache, init list with cache

    // else create new list

    // group function
    function groupKeySelector(item) {
        return item.categories[0].slug;
    }

    function groupDataSelector(item) {
        return item.categories[0];
    }

    function getGroupKey(leftKey, rightKey) {
        var deep
          , left = 0
          , right = 0;

        if (leftKey === rightKey)
            return 0;

        if (leftKey.charCodeAt(0) === rightKey.charCodeAt(0)) deep = 1;
        if (deep === 1 && leftKey.charCodeAt(1) === rightKey.charCodeAt(1)) deep = 2;
        if (deep === 2 && leftKey.charCodeAt(2) === rightKey.charCodeAt(2)) deep = 3;
        if (deep === 3 && leftKey.charCodeAt(3) === rightKey.charCodeAt(3)) deep = 4;
        if (deep === 4 && leftKey.charCodeAt(4) === rightKey.charCodeAt(4)) deep = 5;

        if (deep === 0)
            return leftKey.charCodeAt(0) - rightKey.charCodeAt(0);
        if (!deep)
            return leftKey.charCodeAt(0) - rightKey.charCodeAt(0);

        for (var i = 0; i <= deep; i++) {
            left += leftKey.charCodeAt(i);
            right += rightKey.charCodeAt(i);
        }

        return left - right;
    }

    // init group lists
    babyGroupedList = babyList.createGrouped(groupKeySelector, groupDataSelector, getGroupKey);
    homeGroupedList = homeList.createGrouped(groupKeySelector, groupDataSelector, getGroupKey);

    function dataRecieved(data) {
        var itemCount = 0;

        rawData = data.response;
        rawJSON = JSON.parse(data.response);

        rawJSON.posts.forEach(function (item) {
            item.title = decodeHtml(item.title);
            item.categories[0].image = item.attachments[0].images.large.url;

            babyList.push(item);

            if (!categoryContains(item.categories[0].slug)) {
                categories.push({
                    slug: item.categories[0].slug, 
                    image: item.attachments[0].images.medium.url,
                    newCount: 0
                });
            }

            Storage.exists(item.id).done(function(result) {
                if (result == false) {
                    item.new = true;
                    getCategory(item.categories[0].slug).newCount += 1;
                }
            });

            // make 5 live tiles
            if (itemCount < 5) {
                liveTileContent.push({
                    srcWide: item.attachments[0].images.large.url,
                    srcSmall: item.attachments[0].images.medium.url,
                    text: item.title
                });
            }

            itemCount++;
        });

        updateLiveTiles();

        //console.info('data loaded');
        createHomeHubsList();
        //Storage.updateFeed(rawJSON);
    }

    function ready() {
        return new WinJS.Promise(function (comp, err, prog) {
            readyComplete = comp;
            readyError = err;

            getWordpressJSON().then(dataRecieved, error);
        });
    }

    function createHomeHubsList() {
        var hubs = {
            large: 5,
            medium: 3,
            small: 1
        };
        var cat = {
            slug: '',
            cur: 0,
            changed: false,
            size: hubs.large
        };

        babyGroupedList.forEach(function (item, index) {
            if (cat.slug !== item.categories[0].slug) {
                cat.changed = true;
                cat.cur = 1;
                cat.slug = item.categories[0].slug;
                cat.group = resolveGroupReference(cat.slug);

                //if (cat.group.post_count > 5) cat.size = 'large';
                if (cat.group.post_count < 5 && cat.group.post_count > 3) cat.size = hubs.medium;
                if (cat.group.post_count < 3) cat.size = hubs.small;
            }
            else {
                if (cat.cur >= 4) {
                    return;
                }
                cat.cur += 1;
            }

            if (cat.cur == 1) {
                homeList.push(fakeItem('See All', cat, item));
                homeList.push(fakeItem('New', cat, item));
            }
            
            item.catIndex = cat.cur;
            item.allIndex = index;

            homeList.push(item);
        });

        readyComplete();
    }

    function fakeItem(title, cat, item) {
        var item = {
            box: true,
            title: title,
            catIndex: cat.cur,
            count: title === 'New' ? 0 : cat.group.post_count,
            image: item.attachments[0].images.large.url,
            attachments: item.attachments,
            categories: item.categories
        };
        return item;
    }

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    function getCategories() {
        return categories;
    }

    function getCategory(slug) {
        var cat;
        categories.some(function (item) {
            if (item.slug === slug) {
                cat = item;
                return item;
            }
        });
        return cat;
    }

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.categories[0].slug, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(slug) {
        return babyGroupedList.createFiltered(function (item) {
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
            if (babyGroupedList.groups.getAt(i).slug === key) {
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

    function getItemsFromQuery(query) {
        var query = RegExp(query, 'ig');

        return babyGroupedList.createFiltered(function (item) {
            return query.test(JSON.stringify(item));
        });
    }

    function isNewItem(item) {
        return babyList.indexOf(item) > 0 ? true : false;
    }

    function categoryContains(item) {
        var i = categories.length;
        while (i--)
            if (categories[i].slug === item) return true;
        return false;
    }

    function getWordpressJSON() {
        return new WinJS.xhr({
            url: 'http://www.argyleink.com/babyanimals/?json=1'
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
        homeList: homeGroupedList,
        categories: getCategories,
        getCategory: getCategory,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        getItemIndex: getItemIndex,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        getWordpressJSON: getWordpressJSON,
        getItemsFromQuery: getItemsFromQuery
    });

})();
