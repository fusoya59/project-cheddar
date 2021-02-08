if (!window.boc) { window.boc = {}; }
if (!boc.core) { boc.core = {}; }

boc.core.Layer = function (params) {
    var _this = this;

    var _cellWidth = params.cellWidth || 50; // px
    var _cellHeight = params.cellHeight || 50; // px
    var _numColumns = params.numColumns || 10;
    var _numRows = params.numRows || 10;

    this.cellWidth = function () { return _cellWidth; }
    this.cellHeight = function () { return _cellHeight; }
    this.numColumns = function () { return _numColumns; }
    this.numRows = function () { return _numRows; }

    var _grid = new Array(_numColumns);
    for (var i = 0; i < _numColumns; i++) {
        _grid[i] = new Array(_numRows);
        for (var j = 0; j < _numRows; j++) {
            _grid[i][j] = {
                entities: [],
                componentNameToEntities: {},
                x : i,
                y: j
            };
        }
    }

    var _idToGrid = {};
    var _dirtyCells = [];
    this.getDirtyCells = function() {
        return _dirtyCells;
    }; // getDirtyCells

    this.dirty = function () {
        for (var i = 0; i < _numColumns; i++) {
            for (var j = 0; j < _numRows; j++) {
                if (_dirtyCells.indexOf(_grid[i][j]) == -1) {
                    _dirtyCells.push(_grid[i][j]);
                }
            }
        }
    }; // dirty

    this.transforms = []; // functions
    this.transformable = true;

    this.addEntity = function (entityObjOrId) {
        var entity = entityObjOrId;
        if (typeof (entityObjOrId) == 'string') {
            entity = new boc.core.Entity({ id: entityObjOrId });
        }

        var bbox = {
            minX: entity.Spatial.x,
            minY: entity.Spatial.y,
            maxX: entity.Spatial.x + entity.Spatial.width - 1,
            maxY: entity.Spatial.y + entity.Spatial.height - 1
        };

        entity.Spatial.onDimensionChange = function (dimArgs) {
            var seenEntities = {};
            var cells = getCells(entity.Spatial.x, entity.Spatial.y, entity.Spatial.x + entity.Spatial.width, entity.Spatial.y + entity.Spatial.height);
            for (var i = 0; i < cells.length; i++) {
                for (var j = 0; j < cells[i].entities.length; j++) {
                    var dirtyEntity = cells[i].entities[j];
                    //if (!dirtyEntity.Dirty) {
                    //    dirtyEntity.addComponent(new boc.components.Dirty());                        
                    //}
                    if (dirtyEntity.Dirty) {
                        dirtyEntity.Dirty.flag(true);
                    }
                    seenEntities[dirtyEntity.id()] = true;
                } // j
            } // i

            // check if the entity has changed cells
            var oldCells = getCells(dimArgs.oldDimension.x, dimArgs.oldDimension.y, dimArgs.oldDimension.x + dimArgs.oldDimension.width, dimArgs.oldDimension.y + dimArgs.oldDimension.height);
            if (oldCells.length == cells.length) {
                var sameCells = true;
                for (var i = 0; i < oldCells.length; i++) {
                    var oldCell = oldCells[i];
                    if (cells.indexOf(oldCell) == -1) {
                        sameCells = false;
                        break;
                    }
                } // i
                if (sameCells) { return; }
            }

            _this.removeEntity(entity);
            _this.addEntity(entity);
            cells = getCells(entity.Spatial.x, entity.Spatial.y, entity.Spatial.x + entity.Spatial.width, entity.Spatial.y + entity.Spatial.height);
            for (var i = 0; i < cells.length; i++) {
                for (var j = 0; j < cells[i].entities.length; j++) {
                    var dirtyEntity = cells[i].entities[j];
                    if (seenEntities[dirtyEntity.id()]) { continue; } 
                    //if (!dirtyEntity.Dirty) {
                    //    dirtyEntity.addComponent(new boc.components.Dirty());                        
                    //}
                    //seenEntities[dirtyEntity.id()] = true;
                    if (dirtyEntity.Dirty) {
                        dirtyEntity.Dirty.flag(true);
                    }
                } // j
            } // i            
        }


        entity.Spatial.addListener('onchange', entity.Spatial.onDimensionChange);        
        entity.onComponentAdded = function (eventArgs) {            
            var cells = _idToGrid[entity.id()];
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                if (!cell.componentNameToEntities[eventArgs.component.className()]) { cell.componentNameToEntities[eventArgs.component.className()] = []; }
                cell.componentNameToEntities[eventArgs.component.className()].push(entity);
                //if (eventArgs.component.className() == 'Dirty') {
                //    if (_dirtyCells.indexOf(cell) == -1) {
                //        _dirtyCells.push(cell);
                //    }
                //}
            } // i
        };
        if (entity.Dirty) {
            entity.Dirty.change(function (isDirty) {
                if (isDirty) { // false to true
                    var cells = _idToGrid[entity.id()];
                    for (var i = 0; i < cells.length; i++) {
                        var cell = cells[i];
                        if (_dirtyCells.indexOf(cell) == -1) {
                            _dirtyCells.push(cell);
                        }
                    } // i
                }
                else { // true to false

                }
            });
        } // Dirty

        entity.addListener('onComponentAdded', entity.onComponentAdded);

        entity.onComponentRemoved = function (eventArgs) {            
            var cells = _idToGrid[entity.id()];
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                var entIndex = cell.componentNameToEntities[eventArgs.componentName].indexOf(entity);
                cell.componentNameToEntities[eventArgs.componentName].splice(entIndex, 1);
            } // i           
        };
        entity.addListener('onComponentRemoved', entity.onComponentRemoved);
                        
        // find which cells this entity overlaps and insert them
        var cells = getCells(bbox.minX, bbox.minY, bbox.maxX, bbox.maxY);
        if (entity.id) { _idToGrid[entity.id()] = cells; }
        for (var i = 0; i < cells.length; i++) {
            cells[i].entities.push(entity);
            var entityComponents = entity.getAllComponents();
            for (var j in entityComponents) {
                var comp = entityComponents[j];
                if (!cells[i].componentNameToEntities[j]) {
                    cells[i].componentNameToEntities[j] = [];
                }
                cells[i].componentNameToEntities[comp.className()].push(entity);
            } //j            
        }//i
        
        //if (!entity.Dirty) {
        //    entity.addComponent(new boc.components.Dirty());            
        //}
        if (entity.Dirty) {
            entity.Dirty.flag(true);
        }
        //entity.dispose();
    }; // addEntity

    this.removeEntity = function (entityObjOrId) {
        var entity = entityObjOrId;
        if (typeof (entityObjOrId) == 'string') {
            entity = new boc.core.Entity({ id: entityObjOrId });
        }

        var cells = null;

        if (entity.id) {
            cells = _idToGrid[entity.id()];
            delete _idToGrid[entity.id()];
        }
        else { cells = findEntity(entity); }

        if (cells) {
            for (var j = 0; j < cells.length; j++) {
                var cell = cells[j];
                for (var k = 0; k < cell.entities.length; k++) {
                    if (cell.entities[k] == entity) {
                        cell.entities.splice(k, 1);
                        var entComps = entity.getAllComponents();
                        for (var i in entComps) {
                            var entIndex = cell.componentNameToEntities[i].indexOf(entity);
                            cell.componentNameToEntities[i].splice(entIndex, 1);
                        } // i
                    }
                } // k 
                if (_dirtyCells.indexOf(cell) == -1) {
                    _dirtyCells.push(cell);    
                }                
            } // j
        } // cells

        entity.Spatial.removeListener('onchange', entity.Spatial.onDimensionChange);
        entity.removeListener('onComponentRemoved', entity.onComponentRemoved);
        entity.removeListener('onComponentAdded', entity.onComponentAdded);
        delete entity.Spatial['onDimensionChange'];
        delete entity['onComponentRemoved'];
        delete entity['onComponentAdded'];
        
        //entity.dispose();
    }; // removeEntity

    this.getEntities = function (params) {
        if (params.x != undefined  && params.y != undefined) {
            var cell = _grid[params.x][params.y];
            if (params.componentName) {
                if (cell.componentNameToEntities[params.componentName]) {
                    return cell.componentNameToEntities[params.componentName];
                } else {
                    return null;
                }
            }
            else {
                return cell.entities;
            }
        }
        return null;
    };
    
    this.getCell = function(params) {
        if (params.x != undefined  && params.y != undefined) {
            var cell = _grid[params.x][params.y];
            return cell;
        }
        return null;
    }; 


    /**
	 * given an array of cells, iterates through them
	 * and returns a new array of entities, removing the dupes
	 */
    function getEntitiesAndRemoveDupes(cells) {
        if (!(cells instanceof Array)) cells = [cells];
        var dupeObj = new Object();
        var toReturn = new Array();
        for (var i = 0; i < cells.length; i++) {
            var ents = cells[i].entities;
            for (var j = 0; j < ents.length; j++) {
                var ent = ents[j];
                if (ent.id) {
                    if (dupeObj[ent.id]) continue;
                    dupeObj[ent.id] = true;
                }
                toReturn.push(ent);
            }
        }
        return toReturn;
    }

    /**
	 * given some MBR, returns which cells intersect it
	 */
    function getCells(minX, minY, maxX, maxY) {
        var lowCell = getCellLoc(minX, minY);
        clampCell(lowCell);
        var highCell = getCellLoc(maxX, maxY);
        clampCell(highCell);
        var toReturn = new Array();
        for (var i = lowCell.x; i <= highCell.x; i++) {
            for (var j = lowCell.y; j <= highCell.y; j++) {
                toReturn.push(_grid[i][j]);
            }
        }
        return toReturn;
    }

    /**
	 * clamps the cell object
	 */
    function clampCell(cell) {
        if (cell instanceof Object) {
            if (cell.x < 0)
                cell.x = 0;
            if (cell.x >= _numColumns)
                cell.x = _numColumns - 1;
            if (cell.y < 0)
                cell.y = 0;
            if (cell.y >= _numRows)
                cell.y = _numRows - 1;
        }
    }

    /**
	 * given some pixel point, return the cell location
	 */
    function getCellLoc(x, y) {
        return {
            x: Math.floor(x / _cellWidth),
            y: Math.floor(y / _cellHeight)
        }
    }

    /**
	 * linear search through each cell for the entity (slow)
	 */
    function findEntity(ent) {
        var toReturn = new Array();
        for (var i = 0; i < _numColumns; i++) {
            for (var j = 0; j < _numRows; j++) {
                for (var k = 0; k < _grid[i][j].entities.length; k++) {
                    if (ent == _grid[i][j].entities[k]) toReturn.push(_grid[i][j]);
                } // k
            } // j            
        } // i
        return toReturn;
    }
}; // Layer