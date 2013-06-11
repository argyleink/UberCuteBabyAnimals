(function () {
    "use strict";

    var cats
      , pool;

    Data.ready.then(function () {
        cats = Data.categories();
    });

    function create(elem, current, detail) {
        pool = document.createDocumentFragment();
        current = current.slug || current;

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

            (function (item, cat, d) {
                item.addEventListener('click', function (e) {
                    if (d) {
                        WinJS.Navigation.navigate("/pages/detail/detail.html", {
                            group: cat
                        });
                    }
                    else {
                        WinJS.Navigation.navigate("/pages/collection/collection.html", {
                            groupData: cat
                        });
                    }
                }.bind(cat));
            })(wrap, category, detail);
            
        }

        elem.appendChild(pool);
        pool = null;
    }

    WinJS.Namespace.define("CategoryHeader", {
        create: create
    });

})();