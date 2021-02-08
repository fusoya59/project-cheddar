if (!window.boc) { window.boc = {}; }
if (!boc.resources) { boc.resources = {}; }

boc.resources.GraphicsManager = new function () {
    var _images = {};
    var _isInit = false;
    this.load = function (assets, onGraphicsLoaded) {
        if (_isInit) {
            if (onGraphicsLoaded) { onGraphicsLoaded(); }
            return;
        }
        var numLoaded = 0;
        for (var i in assets) {
            if (i == "count") continue;
            var img = new Image();
            img.src = "data:image/png;base64," + assets[i];
            img.tag = i;
            _images[i] = img;
            img.onload = function () {
                numLoaded++
                //if ($) $('#debug').text("Assets loaded: " + numLoaded + " / " + assets.count);
                if (numLoaded >= assets.count) {
                    _isInit = true;
                    if (onGraphicsLoaded) { onGraphicsLoaded(); }
                }
            }
        } //i
    }; // load

    this.loadFiles = function (imageArr, onLoaded) {        
        if (!(imageArr instanceof Array)) imageArr = [imageArr];
        var numLoaded = 0;
        //if ($) $("#debug").text("Assets loaded: 0 / " + imageArr.length);
        for (var i = 0; i < imageArr.length; i++) {
            var img = new Image();
            img.src = imageArr[i];
            img.tag = imageArr[i];
            _images[imageArr[i]] = img;
            img.onload = function() {
                numLoaded++;
                //if ($) $("#debug").text("Assets loaded: " + numLoaded + " / " + imageArr.length);
                if (numLoaded == imageArr.length && onLoaded) onLoaded();
            };
        } // for
    } // loadFiles

    this.getImage = function (imagePath) {
        return _images[imagePath];
    }; // getImage

    this.addImage = function (path, img) {
        _images[path] = img;
    }
}; // GraphicsManager