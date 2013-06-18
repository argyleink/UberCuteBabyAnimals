(function () {
    "use strict";

    var item
      , flipview
      , appheight
      , appwidth
      , appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    WinJS.UI.Pages.define("/pages/detail/detail.html", {
        _data: null,

        ready: function (element, options) {
            item = options.item || options.group;
            var group = item.categories && item.categories[0].slug || item.slug;
            this._data = Data.getItemsFromGroup(group).dataSource;
            if (!item.id) item = this._data.itemFromIndex(0)._value.data;
            this.updateLayout();

            CategoryHeader.create(filter_list, group, true);

            this.initFlipview(options.index || 0);
            //this.initLike();
            this.initAppbar();
            this.setBodyClass();

            App.Share.enable();
            App.Share.data(item);
        },

        initFlipview: function (idx) {
            flipview = detail_flipview.winControl;

            flipview.itemTemplate = this.renderer;
            flipview.itemDataSource = this._data;
            flipview.currentPage = idx;
            flipview.onpagecompleted = function (e) {
                var curItem = detail_flipview.winControl.itemDataSource.itemFromIndex(detail_flipview.winControl.currentPage)._value.data;
                item = curItem;

                if (curItem.new) {
                    Storage.viewImage(curItem.id);
                    curItem.new = false;

                    if (Data.getCategory(curItem.categories[0].slug).newCount) {
                        Data.getCategory(curItem.categories[0].slug).newCount -= 1;
                    }
                }
                
                var title = e.srcElement.querySelector('figcaption');
                if (title.style.opacity !== "0") return;

                WinJS.UI.Animation.enterContent(
                    e.srcElement.querySelector('figcaption'),
                    {
                        top: "-30px",
                        left: "0px",
                        rtlflip: true
                    }
                );
            };
        },

        updateLayout: function (element, viewState, lastViewState) {
            this.setAppSize();

            if (viewState === appViewState.snapped) {
                console.log('snapped');
            }
            else if (viewState === appViewState.fullScreenPortrait) {
                //flipview.orientation = 'vertical';
            }
            else if (viewState === appViewState.fullScreenLandscape) {
                //flipview.orientation = 'horizontal';
            }
        },

        setBodyClass: function() {
            document.body.classList.remove('group');
            document.body.classList.remove('collection');
            document.body.classList.add('detail');
        },

        setAppSize: function() {
            appheight = window.innerHeight;
            appwidth = window.innerWidth;

            //detail_flipview.style.height = appheight + 'px';
            //detail_flipview.style.width = appwidth + 'px';
        },

        renderer: function (itemPromise) {
            return itemPromise.then(function (item) {
                var flipviewMarkup =
                    '<figcaption class="details" style="opacity:0;"> \
                        <h1 class="title"></h1> \
                        <p class="blurb"></p> \
                    </figcaption> \
                    <figure class="image-wrapper"> \
                        <img class="loading" /> \
                    </figure> \
                ';
                //<article class="metadata"> \
                //        <section class="flex-center"> \
                //            <h2>Fact</h2> \
                //            <blockquote> \
                //                Cats, especially young kittens, are known for their love of string play. Most cats can\'t \
                //                resist a dangling piece of string, or a piece of rope drawn randomly and enticingly across \
                //                the floor.  This propensity is probably related to their hunting instinct. \
                //            </blockquote> \
                //        </section> \
                //    </article> \
                var section = document.createElement('section');
                section.innerHTML = flipviewMarkup;
                section.className = 'flip-container'; 

                section.querySelector('h1').textContent = item.data.title;

                var image = image = section.querySelector('img');
                image.className = 'detail-item loading';
                var imgurl = appwidth < 400 ? item.data.attachments[0].images.large.url : item.data.attachments[0].images.full.url;
                image.src = imgurl;

                //Pic.load(item.data.attachments[0].images.full.url).then(function (src) {
                //    image.src = src;
                //    image.classList.remove('loading');
                //});

                return section;
            });
        },

        makeSiteUrl: function(item) {
            return 'http://www.argyleink.com/babyanimals/' + item.slug;
        },

        initAppbar: function() {
            link.onclick = function () {
                var uri = new Windows.Foundation.Uri(this.makeSiteUrl(item));
                Windows.System.Launcher.launchUriAsync(uri);
            }.bind(this);
        },

        initLike: function () {
            if (Facebook.isConnected == true) {
                like.addEventListener('click', this.like.bind(this));
            }
            else {
                like.addEventListener('click', function (e) {
                    if (Facebook.isConnected == true)
                        this.like();
                    else
                        facebookPrompt.winControl.show(e.target);
                }.bind(this));
            }
        },

        like: function(e) {
            if (like.winControl.label == 'Like') {
                Facebook.like(item, this.makeSiteUrl(item)).then(
                    this.likeCompleted.bind(this),
                    this.likeFailed.bind(this)
                );
            }
        },

        likeCompleted: function complete(result) {
            like.winControl.label = 'Liked!';
            like.disabled = true;
            this.likeTries = 0;

            YeahToast.show({
                imgsrc: item.attachments[0].images.thumbnail.url,
                title: "Success!",
                textContent: item.title + " just got a little cuter."
            });
        },

        likeTries: 0,
        likeFailed: function error(result) {
            if (result.responseText.indexOf('#3501') > 0) {
                like.winControl.label = 'Already Liked';
                this.likeTries = 0;

                setTimeout(function () {
                    like.winControl.label = 'Liked!';
                    like.disabled = true;
                }, 2000);
            }
            else if (this.likeTries < 2) {
                this.like();
                this.likeTries++;
            }
            else {
                YeahToast.show({
                    imgsrc: "/images/facebook-icon.png",
                    title: "DOH...",
                    textContent: "Try again, connection to Facebook was wonky."
                });
                console.error('Error liking item');
            }
        }

    });
})();
