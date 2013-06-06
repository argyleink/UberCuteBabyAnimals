(function () {
    "use strict";

    var cats = Data.categories()
      , pool;

    function create(elem, current) {
        pool = document.createDocumentFragment();

        for (var i = 0, l = cats.length; i < l; i++) {
            var category = cats[i],
                wrap = document.createElement('li'),
                cat = document.createElement('h2'),
                img = document.createElement('figure');

            wrap.setAttribute('data-category', category.slug);

            if (current == category.slug) cat.className = 'cur';
            cat.textContent = category.title;

            img.className = 'category-image';
            img.style.backgroundImage = 'url(' + category.image + ')';

            wrap.appendChild(img);
            wrap.appendChild(cat);

            pool.appendChild(wrap);

            wrap.addEventListener('click', function (e) {
                WinJS.Navigation.navigate("/pages/collection/collection.html", {
                    groupData: category
                });
            }.bind(category));
        }

        elem.appendChild(pool);
        pool = null;
    }

    WinJS.Namespace.define("CategoryHeader", {
        create: create
    });

})();