(function () {
    "use strict";

    var item
      , flipview
      , appheight
      , appwidth
      , appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    WinJS.UI.Pages.define("/pages/detail/detail.html", {
        
        ready: function (element, options) {
            item = options.item;
            this.setAppSize();

            CategoryHeader.create(filter_list, item.categories[0].slug);

            this.initFlipview(options.index);
            this.initLike();
            this.initAppbar();

            App.Share.enable();
            App.Share.data(item);
        },

        initFlipview: function (idx) {
            flipview = detail_flipview.winControl;

            flipview.itemTemplate = this.renderer;
            flipview.itemDataSource = Data.getItemsFromGroup(item.categories[0].slug).dataSource;
            flipview.currentPage = idx || 0;
            flipview.onpagecompleted = function (e) {
                var curItem = detail_flipview.winControl.itemDataSource.itemFromIndex(detail_flipview.winControl.currentPage)._value.data;
                
                if (curItem.new) {
                    Storage.viewImage(curItem.id);
                    curItem.new = false;

                    if (Data.getCategory(curItem.categories[0].slug).newCount) {
                        Data.getCategory(curItem.categories[0].slug).newCount -= 1;
                    }
                }
                
            };

            detail_flipview.focus();
        },

        updateLayout: function (element, viewState, lastViewState) {
            this.setAppSize();

            if (viewState === appViewState.snapped) {
                console.log('snapped');
            }
            else if (viewState === appViewState.fullScreenPortrait) {
                flipview.orientation = 'vertical';
            }
            else if (viewState === appViewState.fullScreenLandscape) {
                flipview.orientation = 'horizontal';
            }
        },

        setAppSize: function() {
            appheight = window.innerHeight;
            appwidth = window.innerWidth;

            detail_flipview.style.height = appheight + 'px';
        },

        renderer: function (itemPromise) {
            return itemPromise.then(function (item) {
                var flipviewMarkup =
                    '<figcaption class="details"> \
                        <h1 class="title"></h1> \
                        <p class="blurb"></p> \
                    </figcaption> \
                    <figure class="image-wrapper"> \
                        <img class="loading" /> \
                    </figure> \
                <article class="metadata"> \
                        <section class="flex-center"> \
                            <h2>Fact</h2> \
                            <blockquote> \
                                Cats, especially young kittens, are known for their love of string play. Most cats can\'t \
                                resist a dangling piece of string, or a piece of rope drawn randomly and enticingly across \
                                the floor.  This propensity is probably related to their hunting instinct. \
                            </blockquote> \
                        </section> \
                    </article> \
                    ';
                var section = document.createElement('section');
                section.innerHTML = flipviewMarkup;
                section.className = 'flip-container'; // win-interactive
                section.style.height = appheight + 'px';
                section.style.width = appwidth + 'px';

                section.querySelector('h1').textContent = item.data.title;

                var image = image = section.querySelector('img');
                image.className = 'detail-item loading';
                image.style.width = appwidth + 'px';
                image.src = item.data.attachments[0].images.full.url;

                //Pic.load(item.data.attachments[0].images.full.url).then(function (src) {
                //    image.src = src;
                //    image.classList.remove('loading');
                //});

                return section;
            });
        },

        initAppbar: function() {
            link.onclick = function () {
                var uri = new Windows.Foundation.Uri('http://www.argyleink.com/babyanimals/' + item.slug);
                Windows.System.Launcher.launchUriAsync(uri);
            }
        },

        initLike: function () {
            if (Facebook.isConnected == true) {
                like.addEventListener('click', this.like.bind(this));
            }
            else {
                detail_appbar.winControl.hideCommands([
                    like.winControl
                ]);
            }
        },

        like: function(e) {
            if (like.winControl.label == 'Like') {
                Facebook.like(item).then(
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
                like.winControl.label = 'Error, try again.';
                this.likeTries = 0;

                setTimeout(function () {
                    like.winControl.label = 'Like';
                }, 2000);
            }
        }

    });
})();
