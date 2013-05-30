(function () {
    "use strict";

    var appView             = Windows.UI.ViewManagement.ApplicationView
      , appViewState        = Windows.UI.ViewManagement.ApplicationViewState
      , nav                 = WinJS.Navigation
      , ui                  = WinJS.UI
      , grouplist
      , groupsezo
      , boundList
      , appheight
      , appwidth;

    ui.Pages.define("/pages/groups/groups.html", {

        ready: function (element, options) {
            this.page = element;
            this.setAppSize();

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
                
                grouplist.itemTemplate = this.itemRenderer.bind(this);
                grouplist.itemDataSource = boundList.dataSource;
                grouplist.groupDataSource = boundList.groups.dataSource;
                grouplist.groupHeaderTemplate = this.headerRenderer;
                grouplist.indexOfFirstVisible = Storage.session.home.index || 0;
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
            
            this.populateHeader();
            this.updateLayout();
        },

        setAppSize: function() {
            appheight = window.innerHeight - 260;
            appwidth = window.innerWidth;
        },

        appbarInit: function() {
            group_toggle.addEventListener('click', function (e) {
                this.seeAll();
            }.bind(this));
        },

        populateHeader: function() {
            var cats = Data.categories()
              , pool = document.createDocumentFragment();

            for (var i = 0, l = cats.length; i < l; i++) {
                var cat = document.createElement('dt');
                cat.textContent = cats[i];
                //cat.style.backgroundColor = 'hsl(213, 92%, '+ (85 + i) +'%)';
                pool.appendChild(cat);
            }

            filter_list.appendChild(pool);

            filter_list.addEventListener('click', function (e) {
                this.navigateToGroup(e.srcElement.textContent);
            }.bind(this));
        },

        itemRenderer: function(itemPromise) {
            return itemPromise.then(function (item) {
                var div = document.createElement('div')
                  , figure = document.createElement('figure');

                div.className = 'item' + item.data.catIndex;

                if (item.data.box) {
                    var boxHeight = (appheight / 2) - 10;
                    var boxWidth = (appheight / 2) - 10;

                    var seeAll = this.groupTile({
                        count: item.data.count,
                        label: item.data.title,
                        width: boxWidth,
                        height: boxHeight
                    });

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
                            break;
                    }
                }

                div.appendChild(figure);

                return div;
            }.bind(this));
        },

        setItemAttributes: function(figure, item) {
            figure.style.backgroundImage = 'url(' + item.data.attachments[0].images.large.url + ')';
            figure.className = 'hometile';
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

            count.textContent = options.count || 0;
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
                title.textContent = item.key;

                var count = document.createElement('span');
                count.className = 'count';
                count.textContent = item.data.post_count;

                header.appendChild(title);
                //header.appendChild(count);

                header.onclick = function (event) {
                    Application.navigator.pageControl.navigateToGroup(this.key);
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

                title.textContent = item.key;
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
            }
            else if (args.detail.itemPromise._value.data.box) {
                this.navigateToGroup(args.detail.itemPromise._value.data.categories[0].slug);
            }
            else {
                // var item = boundList.getAt(args.detail.itemIndex);
                var idx = parseInt(args.srcElement.querySelector('figure').getAttribute('data-all-index'))
                var item = Data.items.getAt(idx);
                Storage.session.home.index = args.detail.itemIndex;

                nav.navigate("/pages/detail/detail.html", {
                    item: item,
                    index: args.detail.itemIndex
                });
            }
        },

        navigateToGroup: function (key) {
            nav.navigate("/pages/collection/collection.html", { groupKey: key });
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
