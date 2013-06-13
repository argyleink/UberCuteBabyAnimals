(function () {
    "use strict";

    var appView             = Windows.UI.ViewManagement.ApplicationView
      , appViewState        = Windows.UI.ViewManagement.ApplicationViewState
      , nav                 = WinJS.Navigation
      , ui                  = WinJS.UI
      , searchPane          = Windows.ApplicationModel.Search.SearchPane.getForCurrentView()
      , grouplist
      , groupsezo
      , boundList
      , appheight
      , appwidth
      , listloaded;

    ui.Pages.define("/pages/groups/groups.html", {

        ready: function (element, options) {
            this.page = element;
            searchPane.placeholderText = 'puppies';

            this.setAppSize();
            this.setBodyClass();

            Storage.session['home'] = Storage.session.home || {}; // init home session

            Data.ready.then(function () {
                boundList = Data.homeList;
                this.initLayout();
            }.bind(this));

            this.appbarInit();
        },

        updateLayout: function (element, viewState, lastViewState) {
            this.page = this.page || element;
            viewState = viewState || appViewState;
            this.setAppSize();

            if (appView.value === appViewState.snapped) {

                grouplist.groupHeaderTemplate = null;
                grouplist.itemTemplate = this.snapRenderer;
                grouplist.itemDataSource = boundList.groups.dataSource;
                grouplist.groupDataSource = null;
                grouplist.indexOfFirstVisible = Storage.session.home.index || 0;
                grouplist.currentItem = Storage.session.home.index || 0;
                grouplist.layout = new ui.ListLayout();

                groupsezo.locked = true;
                groupsezo.out = true;

            } else {
                
                grouplist.itemTemplate = this.itemRenderer.bind(this);
                grouplist.itemDataSource = boundList.dataSource;
                grouplist.groupDataSource = boundList.groups.dataSource;
                grouplist.groupHeaderTemplate = this.headerRenderer;
                grouplist.indexOfFirstVisible = Storage.session.home.index || 0;
                grouplist.currentItem = Storage.session.home.index || 0;
                grouplist.layout = new ui.GridLayout({
                    groupHeaderPosition: "top"
                  , groupInfo: {
                        enableCellSpanning: true,
                        cellWidth: appheight / 2,
                        cellHeight: appheight / 2
                    }
                });

                groupsezo.itemDataSource = boundList.groups.dataSource;
                groupsezo.itemTemplate = this.sezoRenderer;
                groupsezo.locked = false;

            }
        },

        initLayout: function () {
            grouplist = group_list.winControl;
            grouplist.oniteminvoked = this._itemInvoked.bind(this);
            grouplist.selectionMode = 'none';

            groupsezo = group_sezo.winControl;
            groupsezo.selectionMode = 'none';
            
            //CategoryHeader.create(filter_list);
            this.updateLayout();

            grouplist.onloadingstatechanged = function (e) {
                if (!listloaded && group_list.winControl.loadingState === 'viewPortLoaded') {
                    Appstat.hide();
                    listloaded = true;
                }
            }
        },

        setBodyClass: function () {
            document.body.classList.remove('detail');
            document.body.classList.remove('collection');
            document.body.classList.add('group');
        },

        setAppSize: function () {
            if (appView.value === appViewState.fullScreenPortrait) {
                appheight = window.innerHeight / 2 - 260;
                appwidth = window.innerWidth / 2;
            }
            else {
                appheight = window.innerHeight - 260;
                appwidth = window.innerWidth;
            }
        },

        appbarInit: function() {
            
        },

        itemRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var div = document.createElement('div')
                  , figure = document.createElement('figure');

                div.className = 'item';

                if (item.data.box) {
                    var boxHeight = (appheight / 2) - 10;
                    var boxWidth = (appheight / 2) - 10;

                    var seeAll = this.groupTile({
                        count: item.data.count,
                        label: item.data.title,
                        width: boxWidth,
                        height: boxHeight,
                        cat: item.data.categories[0].slug
                    });

                    div.classList.add('box');
                    div.appendChild(seeAll);
                }
                else {
                    this.setItemAttributes(figure, item);
                    switch (item.data.catIndex) {
                        case 2:
                            figure.style.height = (appheight / 2) - 10 + 'px';
                            figure.style.width = appheight + 'px';
                            break;
                        case 3: case 4:
                            var square = (appheight / 2) - 10;
                            figure.style.height = square + 'px';
                            figure.style.width = square + 'px';
                            break;
                        default:
                            figure.style.height = appheight + 'px';
                            figure.style.width = appheight + 'px';
                            var title = document.createElement('h1');
                            title.className = 'hero-title';
                            title.textContent = item.data.title;
                            figure.appendChild(title);
                            break;
                    }
                }

                div.appendChild(figure);

                var imgurl = appheight > 900 ? item.data.attachments[0].images.full.url : item.data.attachments[0].images.large.url;
                Pic.load(imgurl).then(function (src) {
                    figure.style.backgroundImage = 'url(' + src + ')';
                    figure.classList.remove('loading');
                });

                return div;
            }.bind(this));
        },

        setItemAttributes: function (figure, item) {
            figure.className = item.data.new ? 'hometile new loading' : 'hometile loading';
            figure.setAttribute('data-title', item.data.title);
            figure.setAttribute('data-all-index', item.data.allIndex);
        },

        groupTile: function(options) {
            var box = document.createElement('div')
              , wrap = document.createElement('div')
              , count = document.createElement('h1')
              , label = document.createElement('h2');

            box.className = options.label === 'See All' ? 'group-tile first' : 'group-tile';
            box.style.width = options.width + 'px';
            box.style.height = options.height + 'px';

            wrap.className = 'center';

            count.textContent = options.count || Data.getCategory(options.cat).newCount;
            label.textContent = options.label || '';

            wrap.appendChild(count);
            wrap.appendChild(label);

            box.appendChild(wrap);

            return box;
        },

        itemAllRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var div = document.createElement('div')
                  , figure = document.createElement('figure');

                figure.style.backgroundImage = 'url('+ item.data.attachments[0].images.large.url + ')';
                figure.className = 'hometile ' + item.index;

                // TODO: make this fun and dynamic
                figure.style.height = appheight / 3 + 'px';
                figure.style.width = appheight / 3 + 'px';

                div.appendChild(figure);

                return div;
            });
        },

        headerRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var header = document.createElement('header');
                header.className = 'home-header';

                var title = document.createElement('h1');
                title.textContent = item.data.title;

                var count = document.createElement('span');
                count.className = 'count';
                count.textContent = item.data.post_count;

                header.appendChild(title);
                //header.appendChild(count);

                header.onclick = function (event) {
                    Application.navigator.pageControl.navigateToGroup(this.data);
                }.bind(item);

                return header;
            });
        },

        sezoRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var section = document.createElement('section')
                  , figure = document.createElement('figure')
                  , title = document.createElement('h1')
                  , count = document.createElement('h2');

                section.className = 'sezo-item';
                section.style.height = (appheight + 60) + 'px';
                section.style.width = ((appheight + 60) / 2) + 'px';
                
                figure.style.backgroundImage = 'url('+ item.data.image + ')';

                title.textContent = item.data.title;
                count.textContent = item.data.post_count;

                section.appendChild(figure);
                section.appendChild(title);
                section.appendChild(count);

                return section;
            });
        },

        snapRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var section = document.createElement('section');

                var img = document.createElement('figure');
                img.className = 'snap-img';
                img.style.backgroundImage = 'url(' + item.data.image + ')';

                var title = document.createElement('h1');
                title.className = 'snap-title';
                title.textContent = item.data.title;

                section.appendChild(title);
                section.appendChild(img);

                return section;
            });
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                var group = args.detail.itemPromise._value.data;
                this.navigateToGroup(group);
            }
            else if (args.detail.itemPromise._value.data.box) {
                Storage.session.home.index = args.detail.itemIndex;

                if (args.detail.itemPromise._value.data.count > 0 || Data.getCategory(args.detail.itemPromise._value.data.categories[0].slug).newCount) {
                    nav.navigate("/pages/collection/collection.html", {
                        groupData: args.detail.itemPromise._value.data.categories[0]
                    });
                }
                
            }
            else {
                Storage.session.home.index = args.detail.itemIndex;

                // var item = boundList.getAt(args.detail.itemIndex);
                var idx = parseInt(args.srcElement.querySelector('figure').getAttribute('data-all-index'))
                var item = Data.items.getAt(idx);

                nav.navigate("/pages/detail/detail.html", {
                    item: item,
                    index: item.catIndex - 1
                });
            }
        },

        navigateToGroup: function (category) {
            nav.navigate("/pages/collection/collection.html", {
                groupData: category
            });
        },

        seeAll: function () {
            grouplist.itemTemplate = this.itemAllRenderer;
            grouplist.itemDataSource = boundList.dataSource;
            grouplist.groupDataSource = null;
            grouplist.groupHeaderTemplate = null;
            grouplist.indexOfFirstVisible = Storage.session.home.index || 0;
            grouplist.layout = new ui.GridLayout();
        }

    });
})();
