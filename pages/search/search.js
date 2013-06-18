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
            searchPane.placeholderText = 'puppies, kittens, bears...';
            searchPane.onquerychanged = this.keyPressed;

            listView = search_list.winControl;
            query = (options && options.queryText) ? options.queryText : '';

            // get bindable list from Data.js
            Data.ready.then(function () {
                this._items = Data.getItemsFromQuery(query);
                pageList = this._items;
            }.bind(this));

            // set title
            element.querySelector("header[role=banner] .pagetitle").textContent = '“' + query + '”';
            resultslength.textContent = this._items.length + ' results';

            //CategoryHeader.create(filter_list, );
            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
        },

        unload: function () {
            this._items.dispose();
        },

        updateLayout: function (element, viewState, lastViewState) {
            this._initializeLayout(listView, viewState);
        },

        _initializeLayout: function (listView, viewState) {
            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout();
            } else {
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "left" });
            }
            this.setAppSize();

            listView.itemDataSource = pageList.dataSource;
            listView.itemTemplate = this.itemRenderer;
            listView.oniteminvoked = this._itemInvoked.bind(this);
        },

        _itemInvoked: function (args) {
            var item = pageList.getAt(args.detail.itemIndex);

            WinJS.Navigation.navigate("/pages/detail/detail.html", {
                item: item,
                index: item.catIndex - 1
            });
        },

        setAppSize: function () {
            if (Windows.UI.ViewManagement.ApplicationView.value === appViewState.fullScreenPortrait)
                appheight = window.innerHeight / 2 - 120;
            else
                appheight = window.innerHeight - 210;
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
