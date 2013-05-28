(function () {
    "use strict";

    var item
      , flipview;

    WinJS.UI.Pages.define("/pages/detail/detail.html", {
        
        ready: function (element, options) {
            item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            this.initFlipview(options.item.allIndex);
        },

        initFlipview: function (startIndex) {
            detail_flipview.style.height = window.innerHeight + 'px';
            flipview = detail_flipview.winControl;

            flipview.itemTemplate = this.renderer;
            flipview.itemDataSource = Data.items.dataSource;
            flipview.currentPage = startIndex || 0;

            detail_flipview.focus();
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
                    </figure>'
                ;

                var section = document.createElement('section');
                section.innerHTML = flipviewMarkup;
                section.className = 'flip-container'; // win-interactive
                section.style.height = window.innerHeight + 'px';
                section.style.width = window.innerWidth + 'px';

                section.querySelector('h1').textContent = item.data.title;

                var image = image = section.querySelector('img');
                image.style.width = window.innerWidth + 'px';
                image.src = item.data.attachments[0].images.full.url;
                image.onload = function (e) {
                    e.srcElement.className = "";
                };

                return section;
            });
        }

    });
})();
