if (!window.boc) { window.boc = {}; }
if (!boc.core) { boc.core = {}; }

boc.core.EntityManager = function () {
    var _entityId = 0;
    
    var _entitiesToComponent = {}; // id -> { componentName : componentObj }
    var _entitiesToListeners = {}; // id -> { eventName: [] }
    var _componentNameToEntities = {}; // { componentname : [entityId, ... ] }
    var _componentNameToComponentObj = {}; // { componentName : [componentObj, ... ] }

    function notify(entityId, eventName, params) {
        if (_entitiesToListeners[entityId] && _entitiesToListeners[entityId][eventName]) {
            for (var i = 0; i < _entitiesToListeners[entityId][eventName].length; i++) {
                _entitiesToListeners[entityId][eventName][i](params);    
            } // i                                    
        }
    } // notify
    
    this.clear = function() {
        _entityId = 0;
        _entitiesToComponent = {};
        _entitiesToListeners = {};
        _componentNameToEntities = {};
        _componentNameToComponentObj = {};
    }; // clear
    
    this.addListenerForEntity = function(entityId, eventName, callback) {
        if (_entitiesToListeners[entityId]) {
            if (!_entitiesToListeners[entityId][eventName]) {
                _entitiesToListeners[entityId][eventName] = [];
            }
            _entitiesToListeners[entityId][eventName].push(callback);
        } else {
            throw 'Entity ' + entityId + ' not found!';
        }
    }; // addListenerForEntity
    
    this.removeListenerForEntity = function(entityId, eventName, callback) {
        if (_entitiesToListeners[entityId]) {
            if (_entitiesToListeners[entityId][eventName]) {
                var callbackIndex = _entitiesToListeners[entityId][eventName].indexOf(callback);
                if (callbackIndex >= 0) {
                    _entitiesToListeners[entityId][eventName].splice(callbackIndex, 1);    
                }                
            }            
        } else {
            throw 'Entity ' + entityId + ' not found!';
        }
    }; // addListenerForEntity
    
    this.createEntity = function (description) {
        var idStr = '#' + _entityId;
        if (description) { idStr += '_' + description; }
        _entitiesToComponent[idStr] = {};
        _entitiesToListeners[idStr] = {};
        _entityId++;
        return idStr;
    };
    
    this.addComponentToEntity = function (componentObj, entityId) {
        var compHash = _entitiesToComponent[entityId];
        if (!compHash) { throw 'Entity ' + entityId + ' not found.'; }

        var className = componentObj.className();
        var entArr = _componentNameToEntities[className];
        if (!entArr) {
            entArr = [];
            _componentNameToEntities[className] = entArr;
        } else {
            if (entArr.indexOf(entityId) >= 0) { throw 'Entity already has component ' + componentObj.className(); }
        }

        compHash[className] = componentObj;
        entArr.push(entityId);

        if (!_componentNameToComponentObj[className]) {
            _componentNameToComponentObj[className] = [];
        }
        _componentNameToComponentObj[className].push(componentObj);
        notify(entityId, 'onComponentAdded', { entityId : entityId, component : componentObj });        
    };

    this.removeComponentFromEntity = function (componentName, entityId) {
        var compHash = _entitiesToComponent[entityId];
        if (!compHash) { throw 'Entity ' + entityId + ' not found.'; }
        
        var entArr = _componentNameToEntities[componentName];
        if (entArr.indexOf(entityId) == -1) { return; /*throw 'Entity does not have component ' + componentName;*/ }

        var compObj = compHash[componentName];
        
        var compObjArr = _componentNameToComponentObj[componentName];
        compObjArr.splice(compObjArr.indexOf(compObj), 1);

        var entIndex = entArr.indexOf(entityId);
        entArr.splice(entIndex, 1);        

        delete compHash[componentName];        
        notify(entityId, 'onComponentRemoved', { entityId : entityId, componentName : componentName });
    };

    this.getAllComponents = function (componentName) {
        var compArr = _componentNameToComponentObj[componentName];
        if (!compArr) { throw 'No such component ' + componentName; }
        return compArr;
    };

    this.getComponentForEntity = function (componentName, entityId) {
        var compHash = _entitiesToComponent[entityId];
        if (!compHash) {
            //console.log('Entity ' + entityId + ' not found.'); /*throw 'Entity ' + entityId + ' not found.';*/
            return null;
        }
        return compHash[componentName];
    };

    this.getAllComponentsForEntity = function (entityId) {
        var compHash = _entitiesToComponent[entityId];
        if (!compHash) { throw 'Entity ' + entityId + ' not found.'; }
        return compHash;
    };

    this.getAllEntitiesWithComponent = function (componentName) {
        var entArr = _componentNameToEntities[componentName];
        if (!entArr) { /*throw 'No such component ' + componentName;*/ return []; }
        return entArr;
    };

    this.entityExists = function (entityId) {
        return (_entitiesToComponent[entityId] != null && _entitiesToComponent[entityId] != undefined);
    };

    this.killEntity = function (entityId) {
        var compHash = _entitiesToComponent[entityId];
        if (!compHash) { throw 'Entity ' + entityId + ' not found.'; }

        // listeners are notified before removing all components. lucky them.
        notify(entityId, 'onKill', { entity: entityId });

        // store this first because the compHash WILL get modified
        var entityComponentNames = [];
        for (var i in compHash) {
            entityComponentNames.push(i);
        }

        for (var i = 0; i < entityComponentNames.length; i++) {
            this.removeComponentFromEntity(entityComponentNames[i], entityId);
        }
        delete _entitiesToComponent[entityId];
        delete _entitiesToListeners[entityId];
    };     
} // EntitySystem 

boc.core.Entity_internal = {
    _emInstance : null,
    em: function () {
        if (!this._emInstance) { this._emInstance = new boc.core.EntityManager(); }
        return this._emInstance;
    }
};

boc.core.Entity = function (params) {
    var _this = this;
    
    if (!params) { params = {}; }
    if (!params.em) { params.em = boc.core.Entity_internal.em(); }
    if (params.id != undefined && params.id != null) {
        if (!params.em.entityExists(params.id)) { throw 'Entity id ' + params.id + ' does not exist.'; }
        var compsForEntity = params.em.getAllComponentsForEntity(params.id);
        for (var i in compsForEntity) {
            this[i] = compsForEntity[i];
        }; //i
    } else {
        params.id = params.em.createEntity(params.description);
    }
    
    this.id = function () {
        return params.id;
    };
    
    function onComponentAdded(eventArgs) {
        _this[eventArgs.component.className()] = eventArgs.component;
        //notify('onComponentAdded', { component : eventArgs.component, sender : _this });    
    }
    function onComponentRemoved(eventArgs) {
        delete _this[eventArgs.componentName];
        //notify('onComponentRemoved', { componentName : eventArgs.componentName, sender : _this });
    }
    
    params.em.addListenerForEntity(params.id, 'onComponentAdded', onComponentAdded);
    params.em.addListenerForEntity(params.id, 'onComponentRemoved', onComponentRemoved);
       
    //var _eventListeners = {};
    //function notify(eventName, params) {
    //    if (_eventListeners[eventName]) {
    //        for (var i = 0; i < _eventListeners[eventName].length; i++) {
    //            _eventListeners[eventName][i](params);
    //        }
    //    }
    //} // notify

    //this.addListener = function (eventName, callback) {
    //    if (!_eventListeners[eventName]) {
    //        _eventListeners[eventName] = [];
    //    }
    //    _eventListeners[eventName].push(callback);                
    //}; // addListener

    //this.removeListener = function (eventName, callback) {
    //    if (callback == undefined || callback == null) {
    //        _eventListeners[eventName] = [];
    //    } else if (_eventListeners[eventName]) {
    //        var callbackIndex = _eventListeners[eventName].indexOf(callback);
    //        if (callbackIndex >= 0) { _eventListeners[eventName].splice(callbackIndex, 1); }
    //    }
    //}; // removeListener

    this.addComponent = function (componentObj) {
        params.em.addComponentToEntity(componentObj, params.id);
        this[componentObj.className()] = componentObj;        
        //notify('onComponentAdded', { component: componentObj, sender: this });
    };

    this.removeComponent = function (componentName) {
        params.em.removeComponentFromEntity(componentName, params.id);
        delete this[componentName];
        //notify('onComponentRemoved', { componentName : componentName, sender: this });
    };

    this.getAllComponents = function () {
        return params.em.getAllComponentsForEntity(params.id);
    }; // getAllComponents

    this.kill = function () {
        params.em.killEntity(params.id);
        //notify('onKill', { sender: this });
    }; // kill

    this.addListener = function (eventName, callback) {
        params.em.addListenerForEntity(params.id, eventName, callback);
    }; // addListener

    this.removeListener = function (eventName, callback) {
        params.em.removeListenerForEntity(params.id, eventName, callback);
    }; // removeListener

    //this.dispose = function() {
    //    em.removeListenerForEntity(params.id, 'onComponentAdded', onComponentAdded);
    //    em.removeListenerForEntity(params.id, 'onComponentRemoved', onComponentRemoved);        
    //}; // dispose
    
}; // Entity

// $em - Entity Manager helper
// ---------------------------
//
// $em() - returns underlying entity manager
//
// $em.create('description') - creates an entity and returns its id
//
// $em('ComponentName')
//      .each(function(entity, component) { /*do something*/ }) - iterates thru each entity with that component
//
// $em('ComponentName')
//      .all() - returns the array of entities
//
// $em('ComponentName')
//      .first() - returns the first entity
//
// $em('ComponentName')
//      .at(index) - returns the entity at the index
//
// $em('#id')
//      .ns('boc.components') - sets namespace for add (chained)
//      .add('Spatial', { x: 0, y: 0 }) - instantiates the component from the namespace (chained)
//      .add(new boc.component.Spatial({ x : 0, y : 0 })) - directly adds component to the entity (chained)
//      .remove('Spatial') - removes component from entity (chained)
//
// $em('#id')
//      .has('Spatial') - returns true or false, if this entity has this component
// 
// $em('#id')
//      .comp('Spatial') - returns this component object
//
// $em('#id')
//      .kill() - kills the entity
//
// $em('#id')
//      .listen('event', function(p) {}) - adds a listener
//
// $em('#id')
//      .unlisten('event', functionHandle) - removes the listener
(function (em) {
    function strToFn(ns) {
        ns = ns.split('.');
        var fn = window;
        for (var i = 0; i < ns.length; i++) {
            fn = fn[ns[i]];
        }//i
        return fn;
    } // strToFn

    window.$em = function (c) {
        if (typeof (c) == 'undefined') { return em; }
        var entity = null,
            entArr = null,
            namespace = 'boc.components',
            nsFn = strToFn('boc.components');

        if (c.indexOf('#') == 0) {
            entity = c;
        }
        else {
            entArr = em.getAllEntitiesWithComponent(c);
        }

        var self = {
            //sets the namespace for add
            ns: function (nspace) {
                if (namespace !== nspace) {
                    namespace = nspace;
                    nsFn = strToFn(namespace);
                }
                return this;
            },

            // adds a components. either by name or by the actual object.
            add: function (c, params) {
                if (entity) {
                    if (typeof (c) == 'object' && c.className && $.isFunction(c.className)) {
                        em.addComponentToEntity(c, entity);
                    }
                    else if (typeof (c) == 'string') {
                        var comp = new nsFn[c](params);
                        em.addComponentToEntity(comp, entity);
                    }
                }
                return this;
            },

            // remove a component
            remove: function (compName) {
                if (entity && compName) {
                    em.removeComponentFromEntity(compName, entity);
                }
                return this;
            },

            // true/false if it has this particular component
            has: function (compName) {
                if (entity && compName) {
                    return em.getComponentForEntity(compName, entity) ? true : false;
                }
                return false;
            },

            // returns the component
            comp: function (compName) {
                if (entity && compName) {
                    return em.getComponentForEntity(compName, entity);
                }
                return null;
            },

            // iterates through a component query
            each: function (fn) {
                for (var i = 0; i < entArr.length; i++) {
                    entity = entArr[i];
                    if (fn) {
                        fn(entArr[i], em.getComponentForEntity(c, entArr[i]));
                    }
                }                
            },

            kill : function() {
                em.killEntity(entity);
            },
            first: function (fn) {
                return entArr[0];
            },

            all: function () {
                return entArr;
            },

            at: function (i) {
                return entArr[i];
            },

            exists: function () {
                return em.entityExists(entity);
            },

            listen: function (e, c) {
                em.addListenerForEntity(entity, e, c);
                return this;
            },

            unlisten: function (e, c) {
                em.removeListenerForEntity(entity, e, c);
                return this;
            }
        };

        return self;        
    }
})(boc.core.Entity_internal.em());

$em.create = function (desc) {
    return $em().createEntity(desc);
};