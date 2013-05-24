(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState
      , ui = WinJS.UI;

    ui.Pages.define("/pages/collection/collection.html", {
        _items: null,

        ready: function (element, options) {
            var listView = element.querySelector(".itemslist").winControl;
            var group = options.groupKey;
            this._items = Data.getItemsFromGroup(group);
            var pageList = this._items.createGrouped(
                function groupKeySelector(item) { return group.key; },
                function groupDataSelector(item) { return group; }
            );

            element.querySelector("header[role=banner] .pagetitle").textContent = group;

            listView.itemDataSource = pageList.dataSource;
            listView.itemTemplate = this.itemRenderer;
            listView.oniteminvoked = this._itemInvoked.bind(this);

            this.populateHeader();
            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
        },

        unload: function () {
            this._items.dispose();
        },

        updateLayout: function (element, viewState, lastViewState) {
            var listView = element.querySelector(".itemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    var firstVisible = listView.indexOfFirstVisible;
                    this._initializeLayout(listView, viewState);
                    if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
                        listView.indexOfFirstVisible = firstVisible;
                    }
                }
            }
        },

        _initializeLayout: function (listView, viewState) {
            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout();
            } else {
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "left" });
            }
        },

        populateHeader: function() {
            var cats = Data.categories()
              , pool = document.createDocumentFragment();

            for (var i = 0, l = cats.length; i < l; i++) {
                var cat = document.createElement('dt');
                cat.textContent = cats[i];
                //cat.style.backgroundColor = 'hsl(213, 92%, ' + (85 + i) + '%)';
                pool.appendChild(cat);
            }

            filter_list.appendChild(pool);

            filter_list.addEventListener('click', function (e) {
                WinJS.Navigation.navigate("/pages/collection/collection.html", { groupKey: e.srcElement.textContent });
            }.bind(this));
        },

        _itemInvoked: function (args) {
            var item = this._items.getAt(args.detail.itemIndex);
            item = Data.resolveItemReference(item);
            var index = Data.getItemIndex(item);
            WinJS.Navigation.navigate("/pages/detail/detail.html", { item: item, index: index });
        },

        itemRenderer: function (itemPromise) {
            return itemPromise.then(function (item) {
                var div = document.createElement('div')
                  , figure = document.createElement('figure');

                figure.style.backgroundImage = 'url(' + item.data.attachments[0].images.large.url + ')';
                figure.className = 'item';

                div.appendChild(figure);

                return div;
            });
        }

    });
})();
