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
        var request = e.request
          , deferral = request.getDeferral()
          , shareHtml = '';

        if (typeof(_data[0]) == 'undefined') {
            var url = 'http://www.argyleink.com/babyanimals/' + _data.slug;

            shareHtml = '<br><br> \
                        <a href="' + url + '" style="border:none;"> \
                            <h2 style="margin-bottom:0.5rem;">'+ _data.title +'</h2> \
                            <img style="max-width:500px; border:none;" src="' + _data.attachments[0].images.medium.url + '"/> \
                        </a>';


            var imageUri = new Windows.Foundation.Uri(url);
            var streamReference = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(imageUri);
            request.data.resourceMap[url] = streamReference;


            var obj = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(shareHtml);
            request.data.setHtmlFormat(obj);
            request.data.properties.title = "Look at these uber cute baby animals!";
            request.data.properties.description = url;

            deferral.complete();
        }
    }

    return Share;
}();