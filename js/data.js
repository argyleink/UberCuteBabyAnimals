﻿(function () {
    "use strict";

    var homeList = new WinJS.Binding.List()
      , babyList = new WinJS.Binding.List()
      , babyGroupedList
      , homeGroupedList
      , itemCount = 0
      , categories = []
      , newTotal = 0
      , liveTileService = App.LiveTile
      , liveTileContent = []
      , rawData
      , rawJSON
      , readyComplete
      , readyError;

    // group function
    function groupKeySelector(item) {
        return item.categories[0].slug;
    }

    function groupDataSelector(item) {
        return item.categories[0];
    }

    function sortGroupAscending(leftKey, rightKey) {
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

    function sortDescending(leftKey, rightKey) {
        var deep
          , left = 0
          , right = 0;

        leftKey = leftKey.title;
        rightKey = rightKey.title;

        if (leftKey === rightKey)
            return 0;

        if (leftKey[0] === rightKey[0]) deep = 1;
        if (deep === 1 && leftKey[1] === rightKey[1]) deep = 2;
        if (deep === 2 && leftKey[2] === rightKey[2]) deep = 3;
        if (deep === 3 && leftKey[3] === rightKey[3]) deep = 4;
        if (deep === 4 && leftKey[40] === rightKey[4]) deep = 5;

        if (deep === 0)
            return leftKey[0] - rightKey[0];
        if (!deep)
            return leftKey[0] - rightKey[0];

        for (var i = 0; i <= deep; i++) {
            left += leftKey[i];
            right += rightKey[i];
        }

        return right - left;
    }

    // init group lists
    babyGroupedList = babyList.createGrouped(groupKeySelector, groupDataSelector, sortGroupAscending);
    homeGroupedList = homeList.createGrouped(groupKeySelector, groupDataSelector, sortGroupAscending);

    function dataRecieved(data) {
        rawData = data.response;
        rawJSON = JSON.parse(data.response);

        rawJSON.posts.forEach(function (item) {
            item.title = decodeHtml(item.title);
            item.categories[0].image = item.attachments[0].images.large.url;

            babyList.push(item);

            if (!categoryContains(item.categories[0].slug)) {
                categories.push({
                    slug: item.categories[0].slug,
                    title: item.categories[0].title,
                    image: item.attachments[0].images.medium.url,
                    newCount: 0
                });
            }

            Storage.exists(item.id).done(function(result) {
                if (result == false) {
                    item.new = true;
                    newTotal++;
                    getCategory(item.categories[0].slug).newCount += 1;
                }
                itemComplete();
            });

            // make 5 live tiles
            if (itemCount < 4) {
                liveTileContent.push({
                    srcWide: item.attachments[0].images.large.url,
                    srcSmall: item.attachments[0].images.medium.url,
                    text: item.title
                });
            }

            itemCount++;
        });
    }

    function dataCompleted() {
        updateLiveTiles();
        createHomeHubsList();
    }

    var itemsCompleted = 0;
    function itemComplete() {
        itemsCompleted++;

        if (itemsCompleted >= itemCount) {
            dataCompleted();
        }
    }

    function ready() {
        return new WinJS.Promise(function (comp, err, prog) {
            readyComplete = comp;
            readyError = err;

            Wordpress.getAll().then(dataRecieved, error);
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
                    cat.cur += 1;

                    item.catIndex = cat.cur;
                    item.allIndex = index;
                    
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
        categories.sort(function (a,b) {
            var nameA = a.title.toLowerCase(),
                nameB = b.title.toLowerCase();

            if (nameA < nameB)
                return -1
            if (nameA > nameB)
                return 1
            return 0 
        });
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

    function getDescendingSortedList() {
        return babyGroupedList.createSorted(sortDescending);
    }

    function getAscendingSortedList() {
        return babyGroupedList.createSorted(sortAscending);
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

    function getNewTotal() {
        return newTotal;
    }

    function categoryContains(item) {
        var i = categories.length;
        while (i--)
            if (categories[i].slug === item) return true;
        return false;
    }

    var Wordpress = {

        queryVars: '&include=id,title,slug,categories,tags,date,attachments',

        getAll: function () {
            return new WinJS.xhr({
                url: 'http://www.argyleink.com/babyanimals/?json=1&count=500' + this.queryVars
                      , type: 'GET'
                      , responseType: 'json'
                });
        },

        getMostRecent: function () {
            return new WinJS.xhr({
                url: 'http://www.argyleink.com/babyanimals/?get_most_recent' + this.queryVars
                      , type: 'GET'
                      , responseType: 'json'
            });
        },
        
        getAuthorPostsFor: function (author) {
            return new WinJS.xhr({
                url:    'http://www.argyleink.com/babyanimals/?get_author_posts&slug=' + author
                      , type: 'GET'
                      , responseType: 'json'
            });
        }
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
        ready:                  ready(),
        items:                  babyGroupedList,
        homeList:               homeGroupedList,
        categories:             getCategories,
        newTotal:               getNewTotal,
        getCategory:            getCategory,
        getItemReference:       getItemReference,
        getItemsFromGroup:      getItemsFromGroup,
        getItemIndex:           getItemIndex,
        getDescendingList:      getDescendingSortedList,
        getAscendingList:       getAscendingSortedList,
        resolveGroupReference:  resolveGroupReference,
        resolveItemReference:   resolveItemReference,
        getWordpressJSON:       Wordpress.getAll,
        getItemsFromQuery:      getItemsFromQuery
    });

})();
