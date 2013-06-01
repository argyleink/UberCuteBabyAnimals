(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState
      , searchPane = Windows.ApplicationModel.Search.SearchPane.getForCurrentView()
      , ui = WinJS.UI
      , appheight = window.innerHeight - 220
      , pageList
      , listView
      , query;

    ui.Pages.define("/pages/search/search.html", {
        _items: null,

        ready: function (element, options) {
            searchPane.placeholderText = 'puppies';

            listView = search_list.winControl;
            query = (options && options.queryText) ? options.queryText : '';

            // get bindable list from Data.js
            Data.ready.then(function () {
                this._items = Data.getItemsFromQuery(query);
                pageList = this._items;
                this.initList();
            }.bind(this));

            // set title
            element.querySelector("header[role=banner] .pagetitle").textContent = '“' + query + '”';
            resultslength.textContent = this._items.length + ' results';

            CategoryHeader.create(filter_list);
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
            var item = this._items.getAt(args.detail.itemIndex);
            item = Data.resolveItemReference(item);
            var index = Data.getItemIndex(item);
            WinJS.Navigation.navigate("/pages/detail/detail.html", { item: item, index: index });
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

                figure.className = 'collection-tile loading';
                figure.style.height = (appheight / 2) + 'px';
                figure.style.width = (appheight / 2) + 'px';

                div.appendChild(figure);

                return div;
            });
        },

        initList: function () {


            listView.itemDataSource = pageList.dataSource;
            listView.itemTemplate = this.itemRenderer;
            listView.oniteminvoked = this._itemInvoked.bind(this);
        }

    });
})();
