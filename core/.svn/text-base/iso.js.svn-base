if (!window.boc) { window.boc = {}; }
if (!boc.iso) { boc.iso = {}; }

boc.iso.TileFactory = function (obj) {
    var em = obj.entityManager;

    var tileSets = {
        forest: {
            imagePath: 'forestTiles_iso.png',
            image: null,
            g: {
                offset: {
                    x: 0,
                    y: 0,
                    width: 72,
                    height: 35
                },
                properties: {
                }
            },
            w: {
                offset: {
                    x: 0,
                    y: 70,
                    width: 72,
                    height: 35
                },
                properties: {

                }
            },
            d: {
                offset: {
                    x: 0,
                    y: 35,
                    width: 72,
                    height: 35
                },
                properties: {
                }
            }
        }
    }; // tileSets

    for (var i in tileSets) {
        tileSets[i].image = boc.resources.GraphicsManager.getImage(tileSets[i].imagePath);
    }

    this.createTile = function (tileparams) {
        var tileOffset = tileSets[tileparams.tileset][tileparams.type].offset;

        var entId = em.createEntity(tileparams.id);
        em.addComponentToEntity(
            new boc.components.DrawableSprite({
                image: tileSets[tileparams.tileset].image,
                clipRect: tileOffset
            }),
            entId
        );

        em.addComponentToEntity(
            new boc.components.Spatial({
                x: tileparams.x,
                y: tileparams.y,
                z: ZINDEX.map,
                width: tileparams.width,
                height: tileparams.height
            }),
            entId
        );
        
        em.addComponentToEntity(
            new boc.components.IsoMapCoordinate({
                x: tileparams.tileX,
                y: tileparams.tileY
            }),
            entId
        );
        return entId;
    }; // createTile
}; // IsoTileFactory

boc.iso.Map = function (paramObj) {
    var _tileWidth = paramObj.tileWidth || 72;
    var _tileHeight = paramObj.tileHeight || 35;
    var _numColumns = paramObj.numColumns || 10;
    var _numRows = paramObj.numRows || 10;
    var _terrainString = paramObj.terrainString;
    var _propString = paramObj.propString;
    var _tileOffsetY = paramObj.tileOffsetY || 0;
    var _tileset = paramObj.tileset;
    var _tileFactory = paramObj.tileFactory;
    var em = paramObj.entityManager;

    this.tileWidth = function () { return _tileWidth; }
    this.tileHeight = function () { return _tileHeight; }
    this.numColumns = function () { return _numColumns; }
    this.numRows = function () { return _numRows; }

    var _mapArray = new Array(_numColumns);
    for (var i = 0; i < _numColumns; i++) {
        _mapArray[i] = new Array(_numRows);
    } // i

    this.getTile = function (x, y) {
        return _mapArray[x][y];
    };

    var _bounds = {
        xmin: null,
        ymin: null,
        xmax: null,
        ymax: null
    };

    this.bounds = function () {
        return _bounds;
    }; // bounds

    var terrainLines = _terrainString.split('|');
    for (var i = 0; i < terrainLines.length; i++) {
        var terrainLine = terrainLines[i];
        for (var j = 0; j < terrainLine.length; j++) {
            var terrainChar = terrainLine.charAt(j);

            var tw = _tileWidth;
            var th = _tileHeight;

            // check even/odd. add one if odd to line up the tiles properly.
            if (tw % 2 == 1)
                tw++;
            if (th % 2 == 1)
                th++;

            var x = Math.round(j * (tw) / 2) + Math.round(i * (tw) / 2);
            var y = Math.round(i * (th) / 2) - Math.round(j * (th) / 2) + _tileOffsetY;

            var tileEntity = _tileFactory.createTile({
                id: 'tile(' + j + ',' + i + ')',
                x: x,
                y: y,
                width: _tileWidth,
                height: _tileHeight,
                tileset: _tileset,
                type: terrainChar,
                tileX : j,
                tileY : i
            });

            if (_bounds.xmin == null || x < _bounds.xmin) { _bounds.xmin = x; }
            if (_bounds.ymin == null || y < _bounds.ymin) { _bounds.ymin = y; }
            if (_bounds.xmax == null || x + _tileWidth > _bounds.xmax) { _bounds.xmax = x + _tileWidth; }
            if (_bounds.ymax == null || y + _tileHeight > _bounds.ymax) { _bounds.ymax = y + _tileHeight; }

            _mapArray[j][i] = tileEntity;
        } //j
    } //i

    var bgEnt = em.createEntity();
    em.addComponentToEntity(
        new boc.components.Spatial({
            x: _bounds.xmin,
            y: _bounds.ymin,
            z: ZINDEX.map - 1,
            width: _bounds.xmax - _bounds.xmin,
            height: _bounds.ymax - _bounds.ymin
        }),
        bgEnt
    );
    em.addComponentToEntity(
        new boc.components.DrawableRect({
            fillStyle: 'black',
            lineWidth: 0
        }),
        bgEnt
    );

    this.placeEntityOnTile = function (entity, tileX, tileY, offset) {
        //if (entity.Unit) {
        //    var thingToDrawOffsetX = (_tileWidth / 2) - (entity.Spatial.width / 2);
        //    var thingToDrawOffsetY = ((_tileHeight / _tileWidth) * thingToDrawOffsetX) + (_tileHeight / 2) - entity.Spatial.height;

        //    var tOffsetX = (tileX * (_tileWidth) / 2) + (tileY * (_tileWidth) / 2);
        //    var tOffsetY = (tileY * (_tileHeight) / 2) - (tileX * (_tileHeight) / 2)  + tileOffsetY;

        //    if (entity.Spatial) {
        //        entity.Spatial.update(Math.round(tOffsetX + thingToDrawOffsetX), Math.round(tOffsetY + thingToDrawOffsetY), entity.Spatial.width, entity.Spatial.height);
        //    }
        //} else if (entity.Building) {
        //var tOffsetX = (tileX * (_tileWidth) / 2) + (tileY * (_tileWidth) / 2);
        //var tOffsetY = (tileY * (_tileHeight) / 2) - (tileX * (_tileHeight) / 2)  + tileOffsetY;
        //if (entity.Spatial)
        //    entity.Spatial.update(Math.round(tOffsetX), Math.round(tOffsetY - _tileHeight), entity.Spatial.width, entity.Spatial.height);
        //}
        if (typeof (entity) != 'string') {
            entity = entity.id();
        }

        if (_mapArray[tileX] && _mapArray[tileX][tileY]) {
            if (!offset) {
                offset = { x: 0, y: 0 };
            }
            var tileSpatial = em.getComponentForEntity('Spatial', _mapArray[tileX][tileY]);
            var entSpatial = em.getComponentForEntity('Spatial', entity);
            entSpatial.update({
                x: tileSpatial.x + offset.x ,
                y: tileSpatial.y + offset.y
            });
            var entCoord = em.getComponentForEntity('IsoMapCoordinate', entity);
            if (entCoord) {
                entCoord.x = tileX;
                entCoord.y = tileY;
            }
        }        

    } // fitEntityToTile
}; // IsoMap