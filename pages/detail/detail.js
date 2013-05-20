(function () {
    "use strict";

    var item
      , flipview;

    WinJS.UI.Pages.define("/pages/detail/detail.html", {
        
        ready: function (element, options) {
            item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            this.initFlipview(options.index);
        },

        initFlipview: function (startIndex) {
            flipview = detail_flipview.winControl;

            flipview.itemTemplate = this.renderer;
            flipview.itemDataSource = Data.items.dataSource;
            flipview.currentPage = startIndex || 0;
        },

        renderer: function (itemPromise) {
            return itemPromise.then(function (item) {
                var flipviewMarkup =
                    '<section class="details"> \
                        <h1 class="title"></h1> \
                        <p class="blurb"></p> \
                    </section> \
                    <figure class="image-wrapper"> \
                        <img class="image" /> \
                        <figcaption class="caption"></figcaption> \
                    </figure>'
                ;

                var section = document.createElement('section');
                section.innerHTML = flipviewMarkup;

                section.querySelector('h1').textContent = item.data.title;
                section.querySelector('img').src = item.data.attachments[0].images.large.url;

                return section;
            });
        }

    });
})();
