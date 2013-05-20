﻿// Abstract code for setting live tiles
// exmample usage: LiveTile.appendLiveTile("Title", "150px_310px.png", "150px_150px.png")

/* namespace */
var App = App || {};

/* definition */
App.LiveTile = function () {
    "use strict";

    var Notifications = Windows.UI.Notifications;

    /* constructor */
    var LiveTile = function () {

    }


    LiveTile.updateLiveTiles = function (tiles) {
        LiveTile.clear();
        var logo = {
            text: "",
            srcWide: "/assets/images/wide-logo.png",
            srcSmall: "/assets/images/wide-logo.png"
        };

        for (var i = 0; i < tiles.length; i++) {
            LiveTile.appendLiveTile(tiles[i]);
        }
        LiveTile.appendLiveTile(logo);
    }


    /* statics */
    LiveTile.initialize = function () {
        Notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(true);
    };

    LiveTile.clear = function () {
        Notifications.TileUpdateManager.createTileUpdaterForApplication().clear();
    }

    LiveTile.appendLiveTile = function (tile) {
        //get a XML DOM version of a specific template by using getTemplateContent
        if (tile.text == "") {
            var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileWideImage);
        }
        else {
            var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileWideImageAndText01);

            // get the text attributes for this template and fill them in
            var tileTextAttributes = tileXml.getElementsByTagName("text");
            tileTextAttributes[0].appendChild(tileXml.createTextNode(tile.text));
        }

        // get the image attributes for this template and fill them in
        var tileImageAttributes = tileXml.getElementsByTagName("image");
        tileImageAttributes[0].setAttribute("src", tile.srcWide);

        // fill in a version of the square template returned by GetTemplateContent
        var squareTileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquareImage);
        var squareTileImageAttributes = squareTileXml.getElementsByTagName("image");
        squareTileImageAttributes[0].setAttribute("src", tile.srcSmall);

        // include the square template into the notification
        var node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
        tileXml.getElementsByTagName("visual").item(0).appendChild(node);

        // create the notification from the XML
        var tileNotification = new Notifications.TileNotification(tileXml);

        // send the notification to the app's application tile
        Notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);
    };

    return LiveTile;
}();