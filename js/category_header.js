(function () {
    "use strict";

    var cats = Data.categories()
      , pool;

    function create(elem, clicked) {
        pool = document.createDocumentFragment();

        for (var i = 0, l = cats.length; i < l; i++) {
            var cat = document.createElement('dt');
            cat.textContent = cats[i];
            //cat.style.backgroundColor = 'hsl(213, 92%, '+ (85 + i) +'%)';
            pool.appendChild(cat);
        }

        elem.appendChild(pool);
        pool = null;

        elem.addEventListener('click', function (e) {
            clicked(e.srcElement.textContent);
        }.bind(this));
    }

    WinJS.Namespace.define("CategoryHeader", {
        create: create
    });

})();