(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState
      , ui = WinJS.UI
      , appheight = window.innerHeight - 220
      , pageList
      , sorted = false;

    ui.Pages.define("/pages/collection/collection.html", {
        _items: null,

        ready: function (element, options) {
            var listView = element.querySelector(".itemslist").winControl;
            var group = options.groupData.slug;

            this._items = Data.getItemsFromGroup(group);
            pageList = this._items;

            if (options.group === 'New') {
                pageList = pageList.createFiltered(function (item) {
                    return item.new;
                });
                sorted = true;
            }

            element.querySelector("header[role=banner] .pagetitle").textContent = options.groupData.title;

            listView.itemDataSource = pageList.dataSource;
            listView.itemTemplate = this.itemRenderer;
            listView.oniteminvoked = this._itemInvoked.bind(this);

            CategoryHeader.create(filter_list, group);
            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
        },

        unload: function () {
            this._items.dispose();
        },

        updateLayout: function (element, viewState, lastViewState) {
            var listView = element.querySelector(".itemslist").winControl;
            appheight = window.innerHeight;

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

        _itemInvoked: function (args) {
            var item = pageList.getAt(args.detail.itemIndex);

            WinJS.Navigation.navigate("/pages/detail/detail.html", {
                item: item,
                index: item.catIndex - 1
            });
        },

        itemRenderer: function (itemPromise) {
            return itemPromise.then(function (item) {
                var div = document.createElement('div')
                  , figure = document.createElement('figure');

                div.className = 'item';

                Pic.load(item.data.attachments[0].images.medium.url).then(function (src) {
                    figure.style.backgroundImage = 'url(' + src + ')';
                    figure.classList.remove('loading');
                });

                figure.className = item.data.new ? 'collection-tile new loading' : 'collection-tile loading';
                figure.style.height = (appheight / 2) + 'px';
                figure.style.width = (appheight / 2) + 'px';

                div.appendChild(figure);

                return div;
            });
        }

    });
})();
