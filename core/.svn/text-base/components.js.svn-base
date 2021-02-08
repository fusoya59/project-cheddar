if (!window.boc) { window.boc = {}; }
if (!boc.components) { boc.components = {}; }

boc.core = boc.core || {};

// interface to implement for components
boc.core.Component = function () {
    this.className = function () { return null; }
}; // Component

boc.components = {

    // x {number}, y {number}, z {number}, width {number}, height {number}
    Spatial: function (obj) {
        this.x = obj.x;
        this.y = obj.y;
        this.z = obj.z || 0;
        this.width = obj.width;
        this.height = obj.height;
        this.angle = obj.angle || 0; // radians
        this.scale = 1.0;
        if (typeof (obj.scale) != 'undefined' && obj.scale != null) {
            obj.scaleX = obj.scale;
            obj.scaleY = obj.scale;
            this.scale = obj.scale;
        }
        this.scaleX = typeof (obj.scaleX) != 'undefined' && obj.scaleX != null ? obj.scaleX : 1.0;
        this.scaleY = typeof (obj.scaleY) != 'undefined' && obj.scaleY != null ? obj.scaleY : 1.0;

        // favor X scale
        if (this.scaleX != this.scale) {
            this.scale = this.scaleX;
        }
        this.className = function () { return 'Spatial'; }

        var _em = new boc.utils.EventManager();
        
        this.update = function (obj) {
            if (!obj) { obj = {}; }
            if (obj.x == undefined || obj.x == null) { obj.x = this.x; }
            if (obj.y == undefined || obj.y == null) { obj.y = this.y; }
            if (obj.z == undefined || obj.z == null) { obj.z = this.z; }
            if (obj.width == undefined || obj.width == null) { obj.width = this.width; }
            if (obj.height == undefined || obj.height == null) { obj.height = this.height; }
            if (obj.scaleX == undefined || obj.scaleX == null) { obj.scaleX = this.scaleX; }
            if (obj.scaleY == undefined || obj.scaleX == null) { obj.scaleY = this.scaleY; }

            var isSameDimension = obj.x == this.x && obj.y == this.y && obj.z == this.z && obj.width == this.width && obj.height == this.height
            && obj.scaleX == this.scaleX && obj.scaleY == this.scaleY;

            var oldDim = { x: this.x, y: this.y, z : this.z, width: this.width, height: this.height, scaleX : this.scaleX, scaleY : this.scaleY };

            this.x = obj.x;
            this.y = obj.y;
            this.z = obj.z;
            this.width = obj.width;
            this.height = obj.height;
            this.scaleX = obj.scaleX;
            this.scaleY = obj.scaleY;

            if (!isSameDimension) {
                _em.notify('onchange', { oldDimension: oldDim, newDimension: obj });
            }            
        }; // update

        this.addListener = _em.addListener;
        this.removeListener = _em.removeListener;
    },

    // list of drawable components
    drawables: [
        'DrawableRect',
        'FunkyDrawableRect',
        'DrawableSprite',
        'DrawableText',
        'SpineDrawable'
    ],

    DrawableDiv: function (obj) {
        this.div = obj.div;
        this.className = function () { return 'DrawableDiv'; }
    },

    // fillStyle {sting}, strokeStyle {string}, lineWidth {int}, alpha {float, [0.0-1.0]}, visible {bool}
    DrawableRect: function (obj) {
        this.fillStyle = obj.fillStyle || 'red';
        this.strokeStyle = obj.strokeStyle || 'black';
        this.lineWidth = obj.lineWidth != undefined && obj.lineWidth != null ? obj.lineWidth : 1;
        this.alpha = typeof (obj.alpha) != 'undefined' && obj.alpha != null ? obj.alpha : 1.0;
        this.visible = obj.visible != undefined && obj.visible != null ? obj.visible : true;        
        this.className = function () { return 'DrawableRect'; }

        var evm = new boc.utils.EventManager(this);        
    },
    
    FunkyDrawableRect : function(obj) {
        this.fillStyles = obj.fillStyles || [];
        this.strokeStyles = obj.strokeStyles || [];
        this.lineWidths = obj.lineWidths || [];
        this.visible = obj.visible != undefined && obj.visible != null ? obj.visible : true;
        this.currentFrame = 0;
        
        this.className = function () { return 'FunkyDrawableRect'; }
    },

    // image {Image}, clipRect {object}, alpha {float, [0.0, 1.0]}, visible {bool}
    DrawableSprite: function (obj) {
        this.image = obj.image;
        this.clipRect = obj.clipRect;
        this.alpha = obj.alpha || 1.0;
        this.visible = obj.visible != undefined && obj.visible != null ? obj.visible : true;
        this.className = function () { return 'DrawableSprite'; }
        var evm = new boc.utils.EventManager(this);
    }, // DrawableSprite

    // fillStyle {string}, font {string}, shadow {object}, offset {object}, text {string}, visible {bool}
    DrawableText : function(p) {
        this.fillStyle = p.fillStyle;        
        this.font = p.font || 'bold 8pt Helvetica';
        this.shadow = p.shadow; // { x, y } pixels
        this.offset = p.offset || { x: 0, y: 0 };
        this.text = p.text;
        this.visible = p.visible != undefined && p.visible != null ? p.visible : true;
        this.className = function () { return 'DrawableText'; }
        var evm = new boc.utils.EventManager(this);
    }, //DrawableText

    Dirty: function (obj) {
        if (!obj) { obj = {}; }
        var _onchange = obj.change || null;
        var _flag = obj.flag || false;

        this.change = function (cb) {
            if (cb == undefined && _onchange) { _onchange(_flag); }
            _onchange = cb;
        }
        
        this.flag = function (val) {
            if (val == undefined) { return _flag; }
            var hasChanged = val != _flag;
            _flag = val;
            if (hasChanged && _onchange) { _onchange(_flag); }
        }
        this.className = function () { return 'Dirty'; }
    },

    // camera {Camera}
    CameraFollow : function(obj) {
        this.camera = obj.camera;
        this.className = function () { return 'CameraFollow'; }
    },
    
    // componentName {string}, propertyDeltas {object}, easing {string}, duration {number}, state {string}
    Animation : function(obj) {
        this.componentName = obj.componentName || null; // 
        this.propertyDeltas = obj.propertyDeltas || {}; // { property : delta } 
        this.easing = obj.easing || 'linearTween';
        this.duration = obj.duration || 0;
        this.elapsedTime = 0;
        this.state = obj.state || boc.constants.ANIMATION_STOPPED;                       
        this.className = function () { return 'Animation'; }
        var _em = new boc.utils.EventManager;
        this.notify = _em.notify;
        this.addListener = _em.addListener;
        this.removeListener = _em.removeListener;
    },
    
    FrameAnimation : function(obj) {
        this.componentName = obj.componentName || null; // 
        this.propertyDeltas = obj.propertyDeltas || {}; // { property : delta } 
        this.easing = obj.easing || 'linear';
        this.duration = obj.duration || 0;
        this.elapsedTime = 0;                        
        this.className = function () { return 'FrameAnimation'; }

        var _em = new boc.utils.EventManager;
        this.notify = _em.notify;
        this.addListener = _em.addListener;
        this.removeListener = _em.removeListener;
    },        
    
    // sprites {array}, easing {string}, duration {number}
    SpriteAnimation : function(obj) {
        this.sprites = obj.sprites;
        this.easing = obj.easing || 'linear';
        this.state = obj.state || boc.constants.ANIMATION_STOPPED;
        this.duration = obj.duration;
        this.elapsedTime = 0;
        this.currentFrame = 0;        
        this.className = function () { return 'SpriteAnimation'; }
        var _em = new boc.utils.EventManager;
        this.notify = _em.notify;
        this.addListener = _em.addListener;
        this.removeListener = _em.removeListener;
    },

    SpriteAnimationSet: function (p) {
        for (var n in p) {
            this[n] = p; // should be SpriteAnimation components
        }
        this.className = function () { return 'SpriteAnimationSet'; }
    },

    // action {string}, element {object}, stateObj {object}
    MouseEvent: function (obj) {
        this.action = obj.action;
        this.element = obj.element;
        this.stateObj = obj.stateObj;
        this.timestamp = +new Date;
        this.className = function () { return 'MouseEvent'; }
    }, // MouseEvent

    Identifiable : function() {        
        this.className = function () { return 'Identifiable'; }
    }, // Identifiable
    
    // identifiedEntities {array}
    IdentifyEvent :function(obj) {
        this.identifiedEntities = obj.identifiedEntities;
        this.className = function () { return 'IdentifyEvent'; }
    }, //IdentifyEvent

    // duration {number}
    Lifespan : function(obj) {
        this.duration = obj.duration;
        this.elapsed = 0;
        this.onKill = null;
        this.className = function () { return 'Lifespan'; }
    },

    IsoZ: function (obj) {
        this.baseZ = obj;
        this.oldZ = null;
        this.className = function () { return 'IsoZ'; }
    },

    IsoMapCoordinate: function (obj) {
        this.x = obj.x;
        this.y = obj.y;
        this.className = function () { return 'IsoMapCoordinate'; }
    }, // IsoMapCoordinate

    // target {string}, enabled {bool}, location {object}
    Cursor: function (obj) {
        this.target = obj.target; // string, entity
        this.enabled = obj.enabled || true;
        this.location = obj.location; // { x, y }
        this.className = function () { return 'Cursor'; }
    },

    // target {string}, oldLocation {object}, newLocation {object}
    CursorEvent: function (obj) {
        this.target = obj.target;
        this.oldLocation = obj.oldLocation;
        this.newLocation = obj.newLocation;
        this.className = function () { return 'CursorEvent'; }
    },

    // {string}
    SelectedEvent: function (obj) {
        this.target = obj;
        this.className = function () { return 'SelectedEvent'; }
    },

    // {string}
    UnselectedEvent: function (obj) {
        this.target = obj;
        this.className = function () { return 'UnselectedEvent'; }
    },

    // can the cursor select it ?     
    Selectable : function (obj) {
        //this.selected = obj.selected; // bool
        this.className = function () { return 'Selectable'; }
    },

    // should the cursor be able to highlight it ?
    Highlightable: function (obj) {
        //this.highlighted = obj.highlighted; // bool
        this.className = function () { return 'Highlightable'; }
    },


    // onclick {function}
    UIElement: function (p) {
        this.onclick = p.onclick;
        this.className = function () { return 'UIElement'; }
    } //UIElement
}; //components

// transforms {array}
boc.components.Transformable = function (p) {
    this.transforms = p || []; // given a context
    this.className = function () { return 'Transformable'; }
}; //Transformable

// p/run {function}, q/delay {number}
boc.components.DelayedMethod = function (p, q) {
    if ($.isFunction(p) && !isNaN(q)) {
        this.run = p;
        this.delay = q;
    }
    else {
        this.run = p.run;
        this.delay = p.delay;
    }
    
    this.elapsed = 0;
    this.className = function () { return 'DelayedMethod'; }
}

boc.components.PanningCameraEvent = function (p) {
    this.action = p;
    this.className = function () { return 'PanningCameraEvent'; }
}

boc.components.Renderable = function () {
};