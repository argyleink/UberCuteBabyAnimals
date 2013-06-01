(function () {
    "use strict";

    var item
      , flipview
      , appheight
      , appwidth
      , appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    WinJS.UI.Pages.define("/pages/detail/detail.html", {
        
        ready: function (element, options) {
            item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            this.setAppSize();

            CategoryHeader.create(filter_list);
            this.initFlipview(options.item);
            this.initLike();

            App.Share.enable();
            App.Share.data(options.item);
        },

        initFlipview: function (item) {
            flipview = detail_flipview.winControl;

            flipview.itemTemplate = this.renderer;
            flipview.itemDataSource = Data.getItemsFromGroup(item.categories[0].slug).dataSource;
            flipview.currentPage = item.catIndex - 1 || 0;

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
                ';
                /*
                <article> \
                        <section> \
                            <h2>Fun Fact</h2> \
                            <blockquote> \
                                Cats, especially young kittens, are known for their love of string play. Most cats can\'t \
                                resist a dangling piece of string, or a piece of rope drawn randomly and enticingly across \
                                the floor.  This propensity is probably related to their hunting instinct. If string is \
                                ingested, however, it can get caught in the cat\'s stomach or intestines, causing illness, or in extreme cases, death. \
                            </blockquote> \
                        </section> \
                    </article> \
                    */
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

        initLike: function () {
            if (Facebook.isConnected) {
                detail_appbar.winControl.showCommands([
                    like.winControl
                ]);
                like.addEventListener('click', this.like);
            }
        },

        like: function(e) {
            var control = like.winControl;

            if (control.label == 'Like') {
                // set state to unlike but like the item
                Facebook.like(item).then(
                    function complete(result) {
                        console.log('liked ' + item.title);

                        control.label = 'Liked!';
                        like.disabled = true;
                    },
                    function error(result) {
                        control.label = 'Error..';
                        console.log('error liking ' + item.title);
                        setTimeout(function () {
                            control.label = 'Like';
                        }, 2000);
                    }
                );
            }
        }

    });
})();
