(function () {
    "use strict";

    var appView             = Windows.UI.ViewManagement.ApplicationView
      , appViewState        = Windows.UI.ViewManagement.ApplicationViewState
      , nav                 = WinJS.Navigation
      , ui                  = WinJS.UI
      , grouplist
      , groupsezo
      , boundList;

    ui.Pages.define("/pages/groups/groups.html", {

        ready: function (element, options) {
            this.page = element;

            Storage.session['home'] = Storage.session.home || {}; // init home session

            boundList = Data.items;
            this.initLayout();
        },

        updateLayout: function (element, viewState, lastViewState) {
            this.page = this.page || element;
            viewState = viewState || appViewState;

            if (viewState === appViewState.snapped) {

                grouplist.groupHeaderTemplate = null;
                grouplist.itemTemplate = this.snapRenderer;
                grouplist.itemDataSource = boundList.groups.dataSource;
                grouplist.groupDataSource = null;
                grouplist.indexOfFirstVisible = Storage.session.home.index || 0;
                grouplist.layout = new ui.ListLayout();

                groupsezo.locked = true;
                groupsezo.out = true;

            } else {
                
                grouplist.itemTemplate = this.itemRenderer;
                grouplist.itemDataSource = boundList.dataSource;
                grouplist.groupDataSource = boundList.groups.dataSource;
                grouplist.groupHeaderTemplate = this.headerRenderer;
                grouplist.indexOfFirstVisible = Storage.session.home.index || 0;
                grouplist.layout = new ui.GridLayout({ groupHeaderPosition: "top" });

                groupsezo.itemDataSource = boundList.groups.dataSource;
                groupsezo.itemTemplate = this.sezoRenderer;
                groupsezo.locked = false;

            }
        },

        initLayout: function () {
            grouplist = group_list.winControl;
            grouplist.oniteminvoked = this._itemInvoked.bind(this);

            groupsezo = group_sezo.winControl;

            this.updateLayout();
        },

        itemRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var div = document.createElement('div')
                  , figure = document.createElement('figure');

                figure.style.backgroundImage = 'url('+ item.data.attachments[0].images.large.url + ')';
                figure.className = 'hometile';

                div.appendChild(figure);

                return div;
            });
        },

        headerRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var header = document.createElement('header');

                var title = document.createElement('h1');
                title.textContent = item.key;

                header.appendChild(title);

                header.onclick = function (event) {
                    Application.navigator.pageControl.navigateToGroup(this.key);
                }.bind(item);

                return header;
            });
        },

        sezoRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var section = document.createElement('section');

                var img = document.createElement('img');
                //img.src = item.data.attachments[0].images.large.url;

                var title = document.createElement('h1');
                title.textContent = item.key;

                section.appendChild(img);
                section.appendChild(title);

                return section;
            });
        },

        snapRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var section = document.createElement('section');

                var img = document.createElement('img');
                //img.src = item.data.attachments[0].images.large.url;

                var title = document.createElement('h1');
                title.textContent = item.key;

                section.appendChild(img);
                section.appendChild(title);

                return section;
            });
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                var item = boundList.getAt(args.detail.itemIndex);
                Storage.session.home.index = args.detail.itemIndex;

                nav.navigate("/pages/detail/detail.html", {
                    item: Data.getItemReference(item),
                    index: args.detail.itemIndex
                });
            }
        },

        navigateToGroup: function (key) {
            nav.navigate("/pages/collection/collection.html", { groupKey: key });
        }

    });
})();
