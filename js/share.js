/* namespace */
var App = App || {};

/* definition */
App.Share = function () {
    "use strict";

    var _data,
        shareHtml;

    /* constructor */
    var Share = function () { };

    Share.data = function(value) {
        if (value) {
            _data = value;
        }
        else {
            return _data;
        }
    }

    /* statics */
    Share.enable = function () {
        var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        dataTransferManager.ondatarequested = onShareRequested;
    };

    Share.disable = function () {
        var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
        _data = null;
    };

    /* private */
    function onShareRequested(e) {
        var request = e.request;
        var deferral = request.getDeferral();
        shareHtml = '';

        if (typeof(_data[0]) == 'undefined') {
            shareHtml = '<br><br><a href="' + _data.data.image + '">' +
                        '<img style="max-width:500px" src="' + _data.data.image + '"/></a>' +
                        '<p>' + _data.data.title + '</p>';

            if (typeof (_data.data.video) != 'undefined' && typeof (_data.data.link) != 'undefined')
                shareHtml += '<a href="' + _data.data.link + '">watch the video</a>';

            var path = _data.data.image;
            var imageUri = new Windows.Foundation.Uri(path);
            var streamReference = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(imageUri);
            request.data.resourceMap[path] = streamReference;
        }
        else {
            for (var selectedBaby in _data) {
                shareHtml += '<br><br><a href="' + _data[selectedBaby].data.image + '" title="' + _data[selectedBaby].data.title + '">' +
                             '<img style="max-width:500px" src="' + _data[selectedBaby].data.image + '"/></a>';

                if (typeof (_data[selectedBaby].data.video) != 'undefined' && typeof (_data[selectedBaby].data.link) != 'undefined')
                    shareHtml += '<a href="' + _data[selectedBaby].data.link + '">watch the video</a>';

                var path = _data[selectedBaby].data.image;
                var imageUri = new Windows.Foundation.Uri(path);
                var streamReference = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(imageUri);
                request.data.resourceMap[path] = streamReference;
            }
        }

        var obj = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(shareHtml);
        request.data.setHtmlFormat(obj);
        request.data.properties.title = "Look at these uber cute baby animals!";

        deferral.complete();
    }

    return Share;
}();