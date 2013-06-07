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
            var listView = collection_list.winControl;
            var group = options.groupData.slug;

            this._items = Data.getItemsFromGroup(group);
            pageList = this._items;

            if (options.group === 'New') {
                pageList = pageList.createFiltered(function (item) {
                    return item.new;
                });
                sorted = true;
            }

            collection_title.textContent = options.groupData.title;

            CategoryHeader.create(filter_list, group);
            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
        },

        updateLayout: function (element, viewState, lastViewState) {
            this.setAppSize();
        },

        unload: function () {
            this._items.dispose();
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

        setAppSize: function() {
            if (Windows.UI.ViewManagement.ApplicationView.value === appViewState.fullScreenPortrait)
                appheight = window.innerHeight / 2 - 120;
            else
                appheight = window.innerHeight - 210;
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
