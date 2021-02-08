if (!window.boc) { window.boc = {}; }
if (!boc.systems) { boc.systems = {}; }
if (!boc.core) { boc.core = {}; }

// interface to implement for system
boc.core.System = function (entityManager) {
    this.processTick = function (frameTime) {  }
}; // System

boc.systems.IsoCursorSystem = function(entityManager) {
    var em = entityManager;
    this.processTick = function (frameTime) {
        var cursorEvents = em.getAllEntitiesWithComponent('CursorEvent');
        var selectableEnts = em.getAllEntitiesWithComponent('Selectable');
        for (var i = 0; i < cursorEvents.length; i++) {
            var cursorEventEnt = cursorEvents[i];
            var cursorEvent = em.getComponentForEntity('CursorEvent', cursorEventEnt);

            // nothing changed, continue
            if (cursorEvent.newLocation.x == cursorEvent.oldLocation.x &&
                cursorEvent.newLocation.y == cursorEvent.oldLocation.y) { continue; }

            // otherwise something did change, so gotta do it up
            var cursorEnt = cursorEvent.target;
            var cursor = em.getComponentForEntity('Cursor', cursorEnt);
            var cursorSpatial = em.getComponentForEntity('Spatial', cursorEnt);
            //var cursorPoint = boc.utils.toPoint(cursorSpatial);
            var selectedEnt = null;                
            var previousZ = null;
            for (var j = 0; j < selectableEnts.length; j++) {
                var selectableEnt = selectableEnts[j];
                var selectableSpatial = em.getComponentForEntity('Spatial', selectableEnt);
                var isoMapCoord = em.getComponentForEntity('IsoMapCoordinate', selectableEnt);
                if (isoMapCoord.x == cursorEvent.newLocation.x && 
                    isoMapCoord.y == cursorEvent.newLocation.y &&
                    (selectedEnt == null || selectableSpatial.z > previousZ )) {

                    previousZ = selectableSpatial.z;
                    selectedEnt = selectableEnt;
                }                    
            } //j

            // throw some events
            if (selectedEnt) {
                boc.utils.createEvent(new boc.components.SelectedEvent(selectedEnt), em);            
            }
                
            if (cursor.target) {
                boc.utils.createEvent(new boc.components.UnselectedEvent(cursor.target), em);
            }

            cursor.target = selectedEnt;
            boc.utils.consumeEvent(cursorEventEnt, 'CursorEvent', em);
        } // i
    }; // processTick
} //IsoCursorSystem

boc.systems.HightlightSystem = function(entityManager) {
    var em = entityManager;
    this.processTick = function (frameTime) {
        var selectedEvents = em.getAllEntitiesWithComponent('SelectedEvent');
        var unselectedEvents = em.getAllEntitiesWithComponent('UnselectedEvent');
        var highlightEnts = em.getAllEntitiesWithComponent('Highlightable');
            
        if (selectedEvents.length > 0 || unselectedEvents.length > 0) {
            for (var i = 0; i < highlightEnts.length; i++) {
                var highlightEnt = highlightEnts[i];
                for (var d = 0; d < boc.components.drawables.length; d++) {
                    var drawableClassName = boc.components.drawables[d];
                    var drawableComponent = em.getComponentForEntity(drawableClassName, highlightEnt);
                    if (drawableComponent && drawableComponent.alpha) {
                        drawableComponent.alpha = 1.0;
                    }
                } // d
            } // i
        }

        for (var h = 0; h < unselectedEvents.length; h++) {
            var unselectedEventEnt = unselectedEvents[h];
            var unselectedEvent = em.getComponentForEntity('UnselectedEvent', unselectedEventEnt);
            var unselectedEnt = unselectedEvent.target;
            var isoZ = em.getComponentForEntity('IsoZ', unselectedEnt);
            var spatial = em.getComponentForEntity('Spatial', unselectedEnt);
            if (isoZ) {                    
                spatial.update({ z: isoZ.oldZ });
                isoZ.oldZ = null;
            }
            boc.utils.consumeEvent(unselectedEventEnt, 'UnselectedEvent', em);
        } // h

        for (var h = 0; h < selectedEvents.length; h++) { // most cases this will be 1 or less
            var selectedEventEnt = selectedEvents[h];
            var selectedEvent = em.getComponentForEntity('SelectedEvent', selectedEventEnt);
            var selectedEnt = selectedEvent.target;
            var selectedSpatial = em.getComponentForEntity('Spatial', selectedEnt);
            for (var i = 0; i < highlightEnts.length; i++) {
                var highlightEnt = highlightEnts[i];
                var highlightComponent = em.getComponentForEntity('Highlightable', highlightEnt);
                var highlightedSpatial = em.getComponentForEntity('Spatial', highlightEnt);
                    
                // pop to front
                if (highlightEnt == selectedEnt) {
                    var highlightedIsoZ = em.getComponentForEntity('IsoZ', highlightEnt);
                    if (highlightedIsoZ) {
                        highlightedIsoZ.oldZ = highlightedSpatial.z;
                        highlightedSpatial.update( { z: highlightedSpatial.z + 1000 });
                    }                        
                }
                else {
                    // fade any intersecting highlightable entities
                    if (boc.utils.toBounds(selectedSpatial).intersects(boc.utils.toBounds(highlightedSpatial))) {
                        // TODO: maybe have an Alpha component?
                        for (var d = 0; d < boc.components.drawables.length; d++) {
                            var drawableClassName = boc.components.drawables[d];
                            var drawableComponent = em.getComponentForEntity(drawableClassName, highlightEnt);
                            if (drawableComponent && drawableComponent.alpha) {
                                drawableComponent.alpha = 0.5;
                            }
                        } // d
                    } // does intersect                        
                } // not the same as selected
            } //i

            boc.utils.consumeEvent(selectedEventEnt, 'SelectedEvent', em);
        } // h
    }; // processTick
}; // HightlightSystem

boc.systems.IsoZOrderSystem = function(entityManager, isoMap) {
    var em = entityManager;
    var stepZ = isoMap.tileHeight() / 2;
    var offsetY = isoMap.bounds().ymin;
    this.processTick = function (frameTime) {
        var isoZEnts = em.getAllEntitiesWithComponent('IsoZ');
        for (var i = 0; i < isoZEnts.length; i++) {
            var isoZEnt = isoZEnts[i];
            var isoZ = em.getComponentForEntity('IsoZ', isoZEnt);
            if (isoZ.oldZ != null) { continue; }
            var spatial = em.getComponentForEntity('Spatial', isoZEnt);
            //var centerY = (spatial.y - offsetY + spatial.height) / 2;
            //spatial.update({ z: Math.round((centerY - offsetY) / stepZ) });
            //spatial.update({ z: Math.round((spatial.y - offsetY) / stepZ) });
            //spatial.update({ z: Math.round(centerY / stepZ) });
            var newZ = isoZ.baseZ + Math.round((spatial.y + spatial.height - offsetY) / stepZ);
            spatial.update({ z: newZ });
                
        }//i
    }; // processTick 
}; //IsoZOrderSystem 

// kills entities w/ Lifespan component    
boc.systems.LifespanSystem = function(entityManager) {
    var em = entityManager;
    this.processTick = function (frameTime) { 
        var ents = em.getAllEntitiesWithComponent('Lifespan'); 
        if (ents) { ents = ents.slice(); }
        for (var i = 0; i < ents.length; i++) {
            var lifespanComponent = em.getComponentForEntity('Lifespan', ents[i]);
            lifespanComponent.elapsed += frameTime;
            if (lifespanComponent.elapsed >= lifespanComponent.duration || lifespanComponent.duration <= 0) {
                em.killEntity(ents[i]);
                if (lifespanComponent.onKill) { lifespanComponent.onKill(); }
            }
        } // i
    } // processTick
}

// identifies all entities on a mouse click
boc.systems.IdentifySystem = function(entityManager, camera) {
    var em = entityManager;
    var _mouseState = 'idle';
    var _drag_pid = null;
    var _dragThreshold = 90; // ms
    var _camera = camera;
        
    this.processTick = function (frameTime) {  
        var ents = em.getAllEntitiesWithComponent('MouseEvent');
        if (ents && ents.length > 0) {
            ents = ents.slice();
            ents.sort(function(a,b) {
                var mevA = em.getComponentForEntity('MouseEvent', a);
                var mevB = em.getComponentForEntity('MouseEvent', b);
                return (mevA.timestamp - mevB.timestamp);
            });
            for (var i = 0; i < ents.length; i++) {
                var mouseEventComponent = em.getComponentForEntity('MouseEvent', ents[i]);
                var lifespanComponent = em.getComponentForEntity('Lifespan', ents[i]);
                lifespanComponent.duration = 0;
                    
                if (mouseEventComponent.action == 'mousedown') {
                    _mouseState = 'down';
                }           
                else if (mouseEventComponent.action == 'mouseup') {                           
                    if (_mouseState != 'drag') {
                        var offset = {
                            x: $(document).scrollLeft() + camera.xmin,
                            y: $(document).scrollTop() + camera.ymin
                        };
                            
                        var clickPoint = {
                            x: ((mouseEventComponent.stateObj.clientX - mouseEventComponent.element.offsetLeft) + offset.x) / camera.zoom,
                            y: ((mouseEventComponent.stateObj.clientY - mouseEventComponent.element.offsetTop) + offset.y) / camera.zoom 
                        };
                            
                            
                        var identifiableEnts = em.getAllEntitiesWithComponent('Identifiable');
                        var identifiedEnts = [];
                        for (var j = 0; j < identifiableEnts.length; j++) {
                            var spatial = em.getComponentForEntity('Spatial', identifiableEnts[j]);                                                            
                            if (spatial && boc.utils.toBounds(spatial).containsPoint(clickPoint)) {                                
                                identifiedEnts.push(identifiableEnts[j]);
                            }
                        } //j
                            
                        if (identifiedEnts.length > 0) {
                            boc.utils.createEvent(new boc.components.IdentifyEvent({ identifiedEntities : identifiedEnts }), em);
                            console.log(identifiedEnts);    
                        }                            
                            
                        /*
                        var entWithHighestZ = null;
                        for (var j = 0; j < identifiableEnts.length; j++) {
                            var identifiableComponent = em.getComponentForEntity('Identifiable', identifiableEnts[j]);
                            var spatial = em.getComponentForEntity('Spatial', identifiableEnts[j]);
                                                            
                            if ( boc.utils.toBounds(spatial).containsPoint(clickPoint) ) {                                
                                if (entWithHighestZ == null) {
                                    entWithHighestZ = { 
                                        entity:  identifiableEnts[j], 
                                        z : spatial.z, 
                                        idComp : identifiableComponent 
                                    };
                                } // no highestZ
                                else {
                                    if (spatial.z > entWithHighestZ.z) { 
                                        entWithHighestZ = { 
                                            entity : identifiableEnts[j], 
                                            z : spatial.z, 
                                            idComp : identifiableComponent
                                        }; 
                                    }
                                } // highestZ
                            }                            
                            // only gets the top one
                        } // j
                            
                        if (entWithHighestZ) {
                            // give a stack of the entities here???
                            for (var j = 0; j < entWithHighestZ.idComp.listeners.length; j++) {
                                entWithHighestZ.idComp.listeners[j]({ entity: entWithHighestZ.entity });
                            } // j
                        } // identified!
                        */
                    } // handle click  
                        
                    _mouseState = 'idle';
                    if (_drag_pid) {
                        clearTimeout(_drag_pid);
                        _drag_pid = null;
                    }                                                                                         
                }
                else if (mouseEventComponent.action == 'mousedrag') {
                    if (!_drag_pid) {
                        _drag_pid = setTimeout(function () {
                            _mouseState = 'drag';
                        }, _dragThreshold);
                    }                        
                }
            } //i 
        }
    } // processTick
}

// moves the camera on mouse drag    
boc.systems.PanningCameraSystem = function(entityManager, camera) {
    var em = entityManager;
        
    var _mouseState = 'idle';
    var _drag_pid = null;
    var _dragThreshold = 50; // ms
    var _prevX = null, _prevY = null;

    var _bounds = null;
    this.bounds = function(bounds) {
        if (bounds == undefined) { return _bounds; }
        _bounds = bounds;
    }; // setbounds

    var _locked = false;
    //var k = 0;
    this.processTick = function (frameTime) {
        $em('PanningCameraEvent').each(function (e, c) {
            if (c.action == 'lock') {
                _locked = true;
                boc.utils.consumeEvent(e, c.className(), em);
            }
            else if (c.action == 'unlock') {
                _locked = false;
                boc.utils.consumeEvent(e, c.className(), em);
            }            
        });
        if (_locked) { return; }
        //if (k++ % 100 == 0) { console.log(_mouseState); }
        var ents = em.getAllEntitiesWithComponent('MouseEvent');
        if (ents && ents.length > 0) {
            ents = ents.slice();
            ents.sort(function(a,b) {
                var mevA = em.getComponentForEntity('MouseEvent', a);
                var mevB = em.getComponentForEntity('MouseEvent', b);
                return (mevA.timestamp - mevB.timestamp);
            });
            for (var i = 0; i < ents.length; i++) {
                var mouseEventComponent = em.getComponentForEntity('MouseEvent', ents[i]);
                var lifespanComponent = em.getComponentForEntity('Lifespan', ents[i]);
                if (lifespanComponent.duration == 0) { continue; }
                lifespanComponent.duration = 0;
                //console.log(mouseEventComponent.action);
                
                if (mouseEventComponent.action == 'mouseup' || mouseEventComponent.action == 'onblur') {                    
                    _mouseState = 'idle';
                    //console.log(_mouseState);
                    if (_drag_pid != null && typeof(_drag_pid) != 'undefined') {
                        clearTimeout(_drag_pid);
                        _drag_pid = null;
                    }
                    _prevX = null;
                    _prevY = null;
                }
                else if (mouseEventComponent.action == 'mousedrag') {
                    if (_drag_pid == null) {
                        _drag_pid = setTimeout(function () {
                            _mouseState = 'drag';                            
                        }, _dragThreshold);
                    }
                    // don't handle drag events until the threshold is up
                    if (_mouseState == 'drag') {
                        if (_prevX && _prevY) {
                            var dx = _prevX - (mouseEventComponent.stateObj.clientX - mouseEventComponent.element.offsetLeft);
                            var dy = _prevY - (mouseEventComponent.stateObj.clientY - mouseEventComponent.element.offsetTop);                                
                            camera.move(dx, dy);
                            if (_bounds) {
                                dx = 0;
                                dy = 0;
                                    
                                if (camera.xmin / camera.zoom < _bounds.xmin) { dx = _bounds.xmin - camera.xmin / camera.zoom; }
                                else if (camera.xmax / camera.zoom > _bounds.xmax) { dx = _bounds.xmax - camera.xmax / camera.zoom; }
                                if (camera.ymin / camera.zoom < _bounds.ymin) { dy = _bounds.ymin - camera.ymin / camera.zoom; }
                                else if (camera.ymax / camera.zoom > _bounds.ymax) { dy = _bounds.ymax - camera.ymax / camera.zoom; }
                                camera.move(dx, dy);                                    
                            }
                                
                        }
                        _prevX = mouseEventComponent.stateObj.clientX - mouseEventComponent.element.offsetLeft;
                        _prevY = mouseEventComponent.stateObj.clientY - mouseEventComponent.element.offsetTop;

                    }
                } // drag              
                
            }// i
        }
    } // processTick
}

// captures all javascript mouse events and injects it to the system
boc.systems.MouseInputSystem = function(entityManager, canvas) {
    var em = entityManager;

    var _isMouseDown = false;
    var _doubleClickThreshold = 180; //ms

    canvas.onmousedown = function (e) {
        _isMouseDown = true;
        var ent = em.createEntity();
        em.addComponentToEntity(
            new boc.components.MouseEvent({
                action: 'mousedown',
                element : canvas,
                stateObj : e
            }),
            ent
        );
        em.addComponentToEntity(
            new boc.components.Lifespan({
                duration : 1000
            }),
            ent
        );
    }; // mousedown

    canvas.onmouseup = function (e) {
        _isMouseDown = false;
        var ent = em.createEntity();
        em.addComponentToEntity(
            new boc.components.MouseEvent({
                action: 'mouseup',
                element : canvas,
                stateObj: e
            }),
            ent
        );
        em.addComponentToEntity(
            new boc.components.Lifespan({
                duration: 1000
            }),
            ent
        );
    }; // mouseup
        
    canvas.onmousemove = function (e) {
        if (_isMouseDown) {
            var ent = em.createEntity();
            em.addComponentToEntity(
                new boc.components.MouseEvent({
                    action: 'mousedrag',
                    element : canvas,
                    stateObj: e
                }),
                ent
            );
            em.addComponentToEntity(
                new boc.components.Lifespan({
                    duration: 1000
                }),
                ent
            );
        } else {
            
        }
    }; // mousemove
    
    var lastClickTime = 0;
    this.processTick = function (frameTime) {        
        $em('MouseEvent').each(function (e, c) {
            if (c.action === 'mouseup') {
                if (c.timestamp - lastClickTime < _doubleClickThreshold) {
                    boc.utils.createEvent(new boc.components.MouseEvent({ action : 'doubleclick', element : canvas, stateObj : c.stateObj }), em);
                }
                //console.log(c.timestamp - lastClickTime);
                lastClickTime = c.timestamp;                
            }
        });
        
    } // processTick
}    

// captures browser touch events and injects them to the system    
boc.systems.TouchInputSystem = function (entityManager, canvas) {
    var em = entityManager;

    var _isMouseDown = false;
    var _doubleClickThreshold = 180; //ms

    canvas.ontouchstart = function (e) {
        _isMouseDown = true;
        var ent = em.createEntity();
        em.addComponentToEntity(
            new boc.components.MouseEvent({
                action: 'mousedown',
                element: canvas,
                stateObj: e.touches[0]
            }),
            ent
        );
        em.addComponentToEntity(
            new boc.components.Lifespan({
                duration: 1000
            }),
            ent
        );
    }; // ontouchstart

    canvas.ontouchend = function (e) {
        _isMouseDown = false;
        var ent = em.createEntity();
        em.addComponentToEntity(
            new boc.components.MouseEvent({
                action: 'mouseup',
                element: canvas,
                stateObj: e.changedTouches[0]
            }),
            ent
        );
        em.addComponentToEntity(
            new boc.components.Lifespan({
                duration: 1000
            }),
            ent
        );
    }; // ontouchend

    canvas.ontouchmove = function (e) {
        if (_isMouseDown) {
            var ent = em.createEntity();
            em.addComponentToEntity(
                new boc.components.MouseEvent({
                    action: 'mousedrag',
                    element: canvas,
                    stateObj: e.changedTouches[0]
                }),
                ent
            );
            em.addComponentToEntity(
                new boc.components.Lifespan({
                    duration: 1000
                }),
                ent
            );
        }
    }; // ontouchmove    

    var lastClickTime = 0;
    this.processTick = function (frameTime) {
        $em('MouseEvent').each(function (e, c) {
            if (c.action === 'mouseup') {
                if (c.timestamp - lastClickTime < _doubleClickThreshold) {
                    boc.utils.createEvent(new boc.components.MouseEvent({ action: 'doubleclick', element: canvas, stateObj: c.stateObj }), em);
                }
                //console.log(c.timestamp - lastClickTime);
                lastClickTime = c.timestamp;
            }
        });
    } // processTick
}

// animates an entity's component
boc.systems.AnimationSystem = function(entityManager) {
    var em = entityManager;
    this.processTick = function (frameTime) {
        var animationComponents = [ 'Animation', 'FrameAnimation' ];
            
        for (var c = 0; c < animationComponents.length; c++) {
            var animationEntities = em.getAllEntitiesWithComponent(animationComponents[c]);
            //var completedEntities = [];
            for (var i = 0; i < animationEntities.length; i++) {
                                        
                //var animationEntity = new boc.core.Entity({ id :animationEntities[i] });
                var animationComponent = em.getComponentForEntity(animationComponents[c], animationEntities[i]);
                if (animationComponent.state != boc.constants.ANIMATION_PLAYING) { continue; }

                var targetComponent = em.getComponentForEntity(animationComponent.componentName, animationEntities[i]);
                                    
                // assume linear for now
                if (animationComponent.elapsedTime == 0) {
                    animationComponent._startValue = {};
                    animationComponent._finalValue = {};
                    for (var j in animationComponent.propertyDeltas) {
                        animationComponent._startValue[j] = targetComponent[j];
                        animationComponent._finalValue[j] = targetComponent[j] + animationComponent.propertyDeltas[j];
                    }                     
                }
                                             
                //swComplete.start();
                // Spatial is special...
                if (animationComponent.componentName == 'Spatial') {
                    var deltaObj = {};
                    for (var j in animationComponent.propertyDeltas) {
                        //var delta = animationComponent.propertyDeltas[j] * (frameTime / animationComponent.duration);
                        //deltaObj[j] = targetComponent[j] + delta;
                        var easingFn = Math[animationComponent.easing] || Math.linearTween;                            
                        var newValue = easingFn(animationComponent.elapsedTime, animationComponent._startValue[j], animationComponent.propertyDeltas[j], animationComponent.duration); 
                        deltaObj[j] = newValue;
                    } // j
                    //swComplete.start();
                    targetComponent.update(deltaObj);
                    //swComplete.stop();
                } else {
                    for (var j in animationComponent.propertyDeltas) {
                        //var delta = animationComponent.propertyDeltas[j] * (frameTime / animationComponent.duration);
                        //targetComponent[j] = targetComponent[j] + delta;
                        var easingFn = Math[animationComponent.easing] || Math.linearTween;                            
                        var newValue = easingFn(animationComponent.elapsedTime, animationComponent._startValue[j], animationComponent.propertyDeltas[j], animationComponent.duration); 
                        targetComponent[j] = newValue;
                    } // j 
                }
                //swComplete.stop();
                    
                animationComponent.elapsedTime += frameTime;
                if (animationComponent.elapsedTime >= animationComponent.duration) {
                    var deltaObj = {};
                    if (animationComponent.componentName == 'Spatial') {
                        for (var j in animationComponent.propertyDeltas) {                            
                            deltaObj[j] = animationComponent._finalValue[j];
                        } // j
                        targetComponent.update(deltaObj);
                    }
                    else {
                        for (var j in animationComponent.propertyDeltas) {      
                            targetComponent[j] = animationComponent._finalValue[j];                        
                        } // j
                    }                                            
                    animationComponent.state = boc.constants.ANIMATION_COMPLETE;
                    animationComponent.notify('onComplete', { entity: animationEntities[i] });
                }                                        
            } // i                                             
        } // c             
    } // processTick
} //AnimationSystem
    
// specifically animates DrawableSprites w/ SpriteAnimation component
boc.systems.SpriteAnimationSystem = function(em) {
    this.processTick = function(frameTime) {
        var spriteAnimationEntities = em.getAllEntitiesWithComponent('SpriteAnimation');
        for (var i = 0; i < spriteAnimationEntities.length; i++) {
            var spriteAnimationEntity = spriteAnimationEntities[i];
            var spriteAnimation = em.getComponentForEntity('SpriteAnimation', spriteAnimationEntity);
            if (spriteAnimation.state != boc.constants.ANIMATION_PLAYING) { continue; }
            var drawableSprite = em.getComponentForEntity('DrawableSprite', spriteAnimationEntity);
            var delta = spriteAnimation.sprites.length * (frameTime / spriteAnimation.duration);
            spriteAnimation.elapsedTime += frameTime;            
            if (spriteAnimation.elapsedTime >= spriteAnimation.duration) {
                spriteAnimation.state = boc.constants.ANIMATION_COMPLETE;
                spriteAnimation.currentFrame = spriteAnimation.sprites.length - 1;                                        
                var spriteAnimationDrawableSprite = spriteAnimation.sprites[spriteAnimation.currentFrame];
                //drawableSprite.image = spriteAnimationDrawableSprite.image;
                //drawableSprite.clipRect = spriteAnimationDrawableSprite.clipRect;
                //drawableSprite.alpha = spriteAnimationDrawableSprite.alpha;
                drawableSprite.update('image', spriteAnimationDrawableSprite.image);
                drawableSprite.update('clipRect', spriteAnimationDrawableSprite.clipRect);
                drawableSprite.update('alpha', spriteAnimationDrawableSprite.alpha);
                spriteAnimation.notify('onComplete', { entity: spriteAnimationEntity });
            } else {
                spriteAnimation.state = boc.constants.ANIMATION_PLAYING;
                spriteAnimation.currentFrame += delta;
                var spriteAnimationDrawableSprite = spriteAnimation.sprites[Math.floor(spriteAnimation.currentFrame)];                
                //drawableSprite.image = spriteAnimationDrawableSprite.image;
                //drawableSprite.clipRect = spriteAnimationDrawableSprite.clipRect;
                //drawableSprite.alpha = spriteAnimationDrawableSprite.alpha;                    
                drawableSprite.update('image', spriteAnimationDrawableSprite.image);
                drawableSprite.update('clipRect', spriteAnimationDrawableSprite.clipRect);
                drawableSprite.update('alpha', spriteAnimationDrawableSprite.alpha);
            }
        } //i
    }; // processTick
} //SpriteAnimationSystem

// makes an entity follow the camera
boc.systems.CameraFollowSystem = function (em) {        
    this.processTick = function (frameTime) {
        var followableEntities = em.getAllEntitiesWithComponent('CameraFollow');
        for (var i = 0; i < followableEntities.length; i++) {
            if (!em.getComponentForEntity('CameraFollow', followableEntities[i]).onCameraChange) {
                (function (followableEntity) {                    
                    var cameraFollow = em.getComponentForEntity('CameraFollow', followableEntity);
                    var spatial = em.getComponentForEntity('Spatial', followableEntity);

                    //function unscale(en, ctx) {
                    //    ctx.scale(1 / cameraFollow.camera.zoom, 1 / cameraFollow.camera.zoom);
                    //}

                    cameraFollow.onCameraChange = function (cameraArgs) {
                        var dx = (cameraArgs.oldCamera.xmin - cameraArgs.newCamera.xmin) / cameraArgs.newCamera.zoom;
                        var dy = (cameraArgs.oldCamera.ymin - cameraArgs.newCamera.ymin) / cameraArgs.newCamera.zoom;
                        //if (cameraArgs.oldCamera.zoom != cameraArgs.newCamera.zoom) {
                        //    //var oldWidth = cameraArgs.oldCamera.xmax - cameraArgs.oldCamera.xmin,
                        //    //    oldHeight = cameraArgs.oldCamera.ymax - cameraArgs.oldCamera.ymin,
                        //    //    newWidth = cameraArgs.newCamera.xmax - cameraArgs.newCamera.xmin,
                        //    //    newHeight = cameraArgs.newCamera.ymax - cameraArgs.newCamera.ymin;

                        //    //// what's my relative position wrt the old camera ?
                        //    //var relativeX = (spatial.x - cameraArgs.oldCamera.xmin) / oldWidth,
                        //    //    relativeY = (spatial.y - cameraArgs.oldCamera.ymin) / oldHeight;

                        //    //// calculate my new position wrt to the new camera
                        //    //spatial.update({
                        //    //    x: newWidth * relativeX + cameraArgs.newCamera.xmin,
                        //    //    y: newHeight * relativeY + cameraArgs.newCamera.ymin
                        //    //});

                        //    var transformable = $em(followableEntity).comp('Transformable');
                        //    if (!transformable) {
                        //        transformable = new boc.components.Transformable();
                        //        transformable.transforms.push(unscale);
                        //        $em(followableEntity).add(transformable);
                        //    }
                        //    if (transformable.transforms.indexOf(unscale) == -1) {
                        //        transformable.transforms.push(unscale);
                        //    }
                        //    //dx *= cameraArgs.newCamera.zoom;
                        //    //dy *= cameraArgs.newCamera.zoom;
                        //}
                        spatial.update({
                            x: spatial.x - dx,
                            y: spatial.y - dy
                        });                                                
                    };                        
                    cameraFollow.camera.addListener('onchange', cameraFollow.onCameraChange);

                    cameraFollow.onCameraRemoved = function (removedArgs) {
                        if (removedArgs.componentName == 'CameraFollow') {
                            //var transformable = $em(followableEntity).comp('Transformable');
                            //if (transformable) {
                            //    var unscaleIndex = transformable.transforms.indexOf(unscale);
                            //    if (unscaleIndex >= 0) {
                            //        transformable.transforms.splice(unscale);
                            //    }
                            //}
                            cameraFollow.camera.removeListener('onchange', cameraFollow.onCameraChange);
                            delete followableEntity['onCameraChange'];
                            em.removeListenerForEntity(followableEntity, 'onComponentRemoved', cameraFollow.onCameraRemoved);
                            delete followableEntity['onCameraRemoved'];
                        }
                    };
                    em.addListenerForEntity(followableEntity, 'onComponentRemoved', cameraFollow.onCameraRemoved);
                }) (followableEntities[i]); 
            }
        } // i
    }; // processTick
} // CameraFollowSystem

// renders all drawable components
boc.systems.RenderSystem = function (entityManager, canvas, cam) {
    var context = canvas.getContext('2d');
    var em = entityManager;

    // binary search/insert
    function insert(arr, startIndex, lastIndex, z, payload) {
        if (arr.length == 0) {
            arr.push({ z: z, payload: [payload] });
        }
        else {
            var midIndex = startIndex + Math.floor((lastIndex - startIndex) / 2);
            var midEle = arr[midIndex];

            if (lastIndex < startIndex) {
                arr.splice(startIndex, 0, { z: z, payload: [payload] });
                return;
            }

            // i found it, push the payload
            if (midEle.z == z) {
                midEle.payload.push(payload);
            }
            else if (z < midEle.z) {
                insert(arr, startIndex, midIndex - 1, z, payload);
            }
            else if (z > midEle.z) {
                insert(arr, midIndex + 1, lastIndex, z, payload);
            }
        }
    }

    var _camera = null;
    this.camera = function (camera) {
        if (camera == undefined) { return _camera; }
        _camera = camera;
    };
    this.camera(cam);

    var _debug = 2; // i leave this here cuz i have yet to determine which is faster : debug = 0 (native sort) or debug = 2 (binary search tree)
    this.debug = function (d) {
        if (d == undefined) { return d; }
        _debug = d;
    }

    this.processTick = function (frameTime) {
        var sw = new boc.utils.Stopwatch();
        //sw.start();
        var drawableComponents = boc.components.drawables;
        var zOrderedEntities = [];
        context.save();
        context.translate(-_camera.xmin, -_camera.ymin);
        context.scale(_camera.zoom, _camera.zoom);

        for (var c = 0; c < drawableComponents.length; c++) {

            var drawableEnts = em.getAllEntitiesWithComponent(drawableComponents[c]);

            for (var d = 0; d < drawableEnts.length; d++) {
                var drawableEnt = drawableEnts[d];
                var spatialComponent = em.getComponentForEntity('Spatial', drawableEnt);
                var drawableComponent = em.getComponentForEntity(drawableComponents[c], drawableEnt);

                if (drawableComponent.visible && _camera.intersects(boc.utils.toBounds(spatialComponent))) {
                    if (_debug == 2) {
                        insert(zOrderedEntities, 0, zOrderedEntities.length - 1, spatialComponent.z, drawableEnt);
                    }
                    else {
                        zOrderedEntities.push(drawableEnt);
                    }
                } // intersect check
            } // d
        } // c

        // TODO: gotta decide which one's more optimal. i'm leaning towards the binary tree, but we'll see.
        if (_debug == 2) {
            for (var j = 0; j < zOrderedEntities.length; j++) {
                var zOrderedEntitiesPayload = zOrderedEntities[j].payload;
                for (var k = 0; k < zOrderedEntitiesPayload.length; k++) {
                    var drawableComponent = null;
                    for (var c = 0; c < drawableComponents.length; c++) {
                        drawableComponent = em.getComponentForEntity(drawableComponents[c], zOrderedEntitiesPayload[k]);
                        if (!drawableComponent) { continue; }
                        var spatialComponent = em.getComponentForEntity('Spatial', zOrderedEntitiesPayload[k]);

                        if (drawableComponent.className() == 'DrawableRect') {
                            context.save();
                            var transform = em.getComponentForEntity('Transformable', zOrderedEntitiesPayload[k]);
                            if (transform) {
                                for (var t = 0; t < transform.transforms.length; t++) {
                                    transform.transforms[t](zOrderedEntities[j], context);
                                }
                            }
                            if (spatialComponent.angle !== 0) {
                                context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                                context.rotate(spatialComponent.angle);
                                context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                            }
                            if (spatialComponent.scale != 1.0) {
                                context.scale(spatialComponent.scale, spatialComponent.scale);
                                var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                                var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                                context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                            }
                            context.fillStyle = drawableComponent.fillStyle;
                            context.globalAlpha = drawableComponent.alpha;
                            context.fillRect(spatialComponent.x, spatialComponent.y, spatialComponent.width, spatialComponent.height);
                            if (drawableComponent.lineWidth > 0) {
                                context.strokeStyle = drawableComponent.strokeStyle;
                                context.lineWidth = drawableComponent.lineWidth;
                                context.strokeRect(spatialComponent.x + context.lineWidth / 2, spatialComponent.y + context.lineWidth / 2, spatialComponent.width - context.lineWidth, spatialComponent.height - context.lineWidth);
                            }
                            context.restore();
                        }
                        else if (drawableComponent.className() == 'FunkyDrawableRect') {
                            context.save();
                            var frame = Math.round(drawableComponent.currentFrame);
                            var transform = em.getComponentForEntity('Transformable', zOrderedEntitiesPayload[k]);
                            if (transform) {
                                for (var t = 0; t < transform.transforms.length; t++) {
                                    transform.transforms[t](zOrderedEntities[j], context);
                                }
                            }
                            context.fillStyle = drawableComponent.fillStyles[frame];
                            context.fillRect(spatialComponent.x, spatialComponent.y, spatialComponent.width, spatialComponent.height);
                            if (drawableComponent.lineWidths[frame] > 0) {
                                context.strokeStyle = drawableComponent.strokeStyles[frame];
                                context.lineWidth = drawableComponent.lineWidths[frame];
                                context.strokeRect(spatialComponent.x + context.lineWidth / 2, spatialComponent.y + context.lineWidth / 2, spatialComponent.width - context.lineWidth, spatialComponent.height - context.lineWidth);
                            }
                            context.restore();
                        }
                        else if (drawableComponent.className() == 'DrawableSprite') {
                            
                            context.save();
                            var transform = em.getComponentForEntity('Transformable', zOrderedEntitiesPayload[k]);
                            if (transform) {
                                for (var t = 0; t < transform.transforms.length; t++) {
                                    transform.transforms[t](zOrderedEntities[j], context);
                                }
                            }
                            //if (!drawableComponent.clipRect) {
                            //    drawableComponent.clipRect = {
                            //        x: 0,
                            //        y: 0,
                            //        width: spatialComponent.width,
                            //        height: spatialComponent.height
                            //    };
                            //}
                            if (spatialComponent.angle !== 0) {
                                context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                                context.rotate(spatialComponent.angle);
                                context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                            }
                            if (spatialComponent.scale != 1.0) {
                                context.scale(spatialComponent.scale, spatialComponent.scale);
                                var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                                var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                                context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                            }
                            context.globalAlpha = drawableComponent.alpha;
                            if (!drawableComponent.clipRect) {
                                context.drawImage(drawableComponent.image,
                                    spatialComponent.x,
                                    spatialComponent.y,
                                    spatialComponent.width,
                                    spatialComponent.height
                                );
                            }
                            else {
                                context.drawImage(drawableComponent.image,
                                    drawableComponent.clipRect.x,
                                    drawableComponent.clipRect.y,
                                    drawableComponent.clipRect.width,
                                    drawableComponent.clipRect.height,
                                    spatialComponent.x,
                                    spatialComponent.y,
                                    spatialComponent.width,
                                    spatialComponent.height
                                );
                            }
                            
                            if (spatialComponent.angle !== 0) {
                                context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                            }

                            context.restore();
                        }
                        else if (drawableComponent.className() == 'DrawableText') {
                            context.save();
                            var transform = em.getComponentForEntity('Transformable', zOrderedEntitiesPayload[k]);
                            if (transform) {
                                for (var t = 0; t < transform.transforms.length; t++) {
                                    transform.transforms[t](zOrderedEntities[j], context);
                                }
                            }
                            context.font = drawableComponent.font;
                            if (spatialComponent.angle !== 0) {
                                context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                                context.rotate(spatialComponent.angle);
                                context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                            }
                            if (spatialComponent.scale != 1.0) {
                                context.scale(spatialComponent.scale, spatialComponent.scale);
                                var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                                var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                                context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                            }
                            if (drawableComponent.shadow) {
                                context.fillStyle = 'black';
                                context.fillText(
                                    drawableComponent.text,
                                    spatialComponent.x + drawableComponent.shadow.x + drawableComponent.offset.x,
                                    spatialComponent.y + drawableComponent.shadow.y + drawableComponent.offset.y
                                );
                            }                            
                            context.fillStyle = drawableComponent.fillStyle;
                            context.fillText(
                                drawableComponent.text,
                                spatialComponent.x + drawableComponent.offset.x,
                                spatialComponent.y + drawableComponent.offset.y
                            );
                            context.restore();
                        }
                        else if (drawableComponent.className() == 'SpineDrawable' && boc && boc.spine && boc.spine.renderSkeleton) {
                            context.save();
                            context.translate(spatialComponent.x, spatialComponent.y);
                            if (spatialComponent.angle !== 0) {
                                //context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                                context.rotate(spatialComponent.angle);
                                //context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                            }
                            if (spatialComponent.scale != 1.0) {
                                context.scale(spatialComponent.scale, spatialComponent.scale);
                                var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                                var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                                context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                            }
                            boc.spine.renderSkeleton(drawableComponent.skeleton, context);
                            context.restore();
                        }
                    } // c                                                
                } // k                        
            } // j
        } // debug 1
        else if (_debug == 0) {
            zOrderedEntities.sort(function (a, b) {
                var spatialA = em.getComponentForEntity('Spatial', a);
                var spatialB = em.getComponentForEntity('Spatial', b);
                return (spatialA.z - spatialB.z);
            });

            for (var j = 0; j < zOrderedEntities.length; j++) {
                var drawableComponent = null;
                for (var c = 0; c < drawableComponents.length; c++) {
                    drawableComponent = em.getComponentForEntity(drawableComponents[c], zOrderedEntities[j]);
                    if (!drawableComponent) { continue; }

                    var spatialComponent = em.getComponentForEntity('Spatial', zOrderedEntities[j]);

                    if (drawableComponent.className() == 'DrawableRect') {
                        context.save();
                        var transform = em.getComponentForEntity('Transformable', zOrderedEntities[j]);
                        if (transform) {
                            for (var t = 0; t < transform.transforms.length; t++) {
                                transform.transforms[t](zOrderedEntities[j], context);
                            }
                        }
                        if (spatialComponent.angle !== 0) {
                            context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                            context.rotate(spatialComponent.angle);
                            context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                        }
                        if (spatialComponent.scale != 1.0) {
                            context.scale(spatialComponent.scale, spatialComponent.scale);
                            var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                            var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                            context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                        }
                        context.fillStyle = drawableComponent.fillStyle;
                        context.globalAlpha = drawableComponent.alpha;
                        context.fillRect(spatialComponent.x, spatialComponent.y, spatialComponent.width, spatialComponent.height);
                        if (drawableComponent.lineWidth > 0) {
                            context.strokeStyle = drawableComponent.strokeStyle;
                            context.lineWidth = drawableComponent.lineWidth;
                            context.strokeRect(spatialComponent.x + context.lineWidth / 2, spatialComponent.y + context.lineWidth / 2, spatialComponent.width - context.lineWidth, spatialComponent.height - context.lineWidth);
                        }
                        context.restore();
                    }
                    else if (drawableComponent.className() == 'FunkyDrawableRect') {
                        context.save();
                        var frame = Math.round(drawableComponent.currentFrame);
                        var transform = em.getComponentForEntity('Transformable', zOrderedEntities[j]);
                        if (transform) {
                            for (var t = 0; t < transform.transforms.length; t++) {
                                transform.transforms[t](zOrderedEntities[j], context);
                            }
                        }
                        context.fillStyle = drawableComponent.fillStyles[frame];
                        context.fillRect(spatialComponent.x, spatialComponent.y, spatialComponent.width, spatialComponent.height);
                        if (drawableComponent.lineWidths[frame] > 0) {
                            context.strokeStyle = drawableComponent.strokeStyles[frame];
                            context.lineWidth = drawableComponent.lineWidths[frame];
                            context.strokeRect(spatialComponent.x + context.lineWidth / 2, spatialComponent.y + context.lineWidth / 2, spatialComponent.width - context.lineWidth, spatialComponent.height - context.lineWidth);
                        }
                        context.restore();
                    }
                    else if (drawableComponent.className() == 'DrawableSprite') {
                        
                        context.save();
                        //if (!drawableComponent.clipRect) {
                        //    drawableComponent.clipRect = {
                        //        x: 0,
                        //        y: 0,
                        //        width: spatialComponent.width,
                        //        height: spatialComponent.height
                        //    };
                        //}                        
                        var transform = em.getComponentForEntity('Transformable', zOrderedEntities[j]);
                        if (transform) {
                            for (var t = 0; t < transform.transforms.length; t++) {
                                transform.transforms[t](zOrderedEntities[j], context);
                            }
                        }
                        if (spatialComponent.angle !== 0) {
                            context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                            context.rotate(spatialComponent.angle);
                            context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                        }
                        if (spatialComponent.scale != 1.0) {
                            context.scale(spatialComponent.scale, spatialComponent.scale);
                            var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                            var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                            context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                        }

                        context.globalAlpha = drawableComponent.alpha;
                        if (!drawableComponent.clipRect) {
                            context.drawImage(drawableComponent.image,
                                spatialComponent.x,
                                spatialComponent.y,
                                spatialComponent.width,
                                spatialComponent.height
                            );
                        }
                        else {
                            context.drawImage(drawableComponent.image,
                                drawableComponent.clipRect.x,
                                drawableComponent.clipRect.y,
                                drawableComponent.clipRect.width,
                                drawableComponent.clipRect.height,
                                spatialComponent.x,
                                spatialComponent.y,
                                spatialComponent.width,
                                spatialComponent.height
                            );
                        }
                        //if (spatialComponent.angle !== 0) {
                        //    context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                        //}
                        
                        context.restore();
                    }
                    else if (drawableComponent.className() == 'DrawableText') {
                        context.save();
                        var transform = em.getComponentForEntity('Transformable', zOrderedEntities[j]);
                        if (transform) {
                            for (var t = 0; t < transform.transforms.length; t++) {
                                transform.transforms[t](zOrderedEntities[j], context);
                            }
                        }
                        context.font = drawableComponent.font;
                        if (spatialComponent.angle !== 0) {
                            context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                            context.rotate(spatialComponent.angle);
                            context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                        }
                        if (spatialComponent.scale != 1.0) {
                            context.scale(spatialComponent.scale, spatialComponent.scale);
                            var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                            var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                            context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                        }
                        if (drawableComponent.shadow) {
                            context.fillStyle = 'black';
                            context.fillText(
                                drawableComponent.text,
                                spatialComponent.x + drawableComponent.shadow.x + drawableComponent.offset.x,
                                spatialComponent.y + drawableComponent.shadow.y + drawableComponent.offset.y
                            );
                        }
                       
                        context.fillStyle = drawableComponent.fillStyle;
                        context.fillText(
                            drawableComponent.text,
                            spatialComponent.x + drawableComponent.offset.x,
                            spatialComponent.y + drawableComponent.offset.y
                        );
                        context.restore();
                    }
                    else if (drawableComponent.className() == 'SpineDrawable' && boc && boc.spine && boc.spine.renderSkeleton) {
                        context.save();
                        boc.spine.renderSkeleton(drawableComponent.skeleton, context);
                        context.restore();
                    }
                } // c                    
            } // j
        } // debug 0
        context.restore();
    }; //processTick
}; // RenderSystem

// handles ui clicks. events not injected into the system because i want this to be as immediate as possible.
boc.systems.UISystem = function (em) {
    this.processTick = function (frameTime) {
        var identifyEvents = em.getAllEntitiesWithComponent('IdentifyEvent');

        var entsToKill = [];
        for (var i = 0; i < identifyEvents.length; i++) {
            var idEventEnt = identifyEvents[i];
            var idEvent = em.getComponentForEntity('IdentifyEvent', idEventEnt);
            var sortedEnts = idEvent.identifiedEntities.slice()
                .sort(function (a, b) {
                    var spatialA = em.getComponentForEntity('Spatial', a);
                    var spatialB = em.getComponentForEntity('Spatial', b);

                    if (!spatialA && !spatialB) { return 0; }
                    if (spatialA && !spatialB) { return 1; }
                    if (!spatialA && spatialB) { return -1; }
                    return spatialA.z - spatialB.z;
                });

            var topEnt = sortedEnts.pop();
            var topUIElement = em.getComponentForEntity('UIElement', topEnt);
            var topDrawable = boc.utils.getDrawableComponent(topEnt, em);
            while (topEnt && (!topUIElement || !topDrawable.visible)) {
                topEnt = sortedEnts.pop();
                if (topEnt) {
                    topUIElement = em.getComponentForEntity('UIElement', topEnt);
                    topDrawable = boc.utils.getDrawableComponent(topEnt, em);;
                }
            }

            if (topEnt) {
                //console.log('UI: ' + topEnt);
                if (topUIElement.onclick) { topUIElement.onclick({ entity: topEnt }); }
                entsToKill.push(idEventEnt);
            }            
            //boc.utils.consumeEvent(idEventEnt, 'IdentifyEvent', em);            
        } //i

        while (entsToKill.length > 0) {
            em.killEntity(entsToKill.pop());
        }
    } // processTick
}; //UISystem

boc.systems.DelayedMethodSystem = function (em) {
    this.processTick = function (frameTime) {
        var toKill = null;
        $em('DelayedMethod').each(function (e, c) {
            c.elapsed += frameTime;
            if (c.elapsed >= c.delay) {
                if (c.run) { c.run(); }
                if (!toKill) { toKill = []; }
                toKill.push(e);
            }
        });
        if (toKill) {
            while (toKill.length > 0) {
                $em(toKill.pop()).kill();
            }
        }
    }
}