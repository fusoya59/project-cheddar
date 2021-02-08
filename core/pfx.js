if (!window.boc) { window.boc = {}; }

boc.pfx = {
    ParticleFactory: function (entityManager) {
        this.maxParticles = function () { return 0; }
        // creates a particle entity
        this.create = function (startPoint, startVector, velocity, acceleration, duration) {
            return null; // string
        }
    } // interfaec for particle factories
};

boc.pfx.particleFactories = {
    SmokeStarFactory: function (entityManager, max) {
        var em = entityManager;

        var _maxParticles = max || 25;
        var _queue = new Array(_maxParticles);
        var _currParticleIndex = 0;
        var _image = boc.resources.GraphicsManager.getImage('pfx_star_small.png');
        var _subImage = boc.resources.GraphicsManager.getImage('pfx_smoke_small.png');

        this.maxParticles = function () { return _maxParticles; }
        var _numParticles = 0;

        this.create = function (startPoint, startVector, velocity, acceleration, duration) {
            if (_numParticles >= _maxParticles) { return null; }
            if (_currParticleIndex >= _maxParticles) {
                _currParticleIndex = 0;
            }
            if (_queue[_currParticleIndex]) {
                var lifespan = em.getComponentForEntity('Lifespan', _queue[_currParticleIndex]);
                if (lifespan) {
                    lifespan.duration = 0;
                }
            }
            var particleEnt = em.createEntity();
            _queue[_currParticleIndex] = particleEnt;
            em.addComponentToEntity(
                new boc.pfx.components.Particle({
                    directionVector: startVector,
                    velocity: velocity,
                    accelerationVector: acceleration
                }),
                particleEnt
            );

            // align it @ the center
            em.addComponentToEntity(
                new boc.components.Spatial({
                    x: startPoint.x + _image.width / 2,
                    y: startPoint.y + _image.height / 2,
                    z: 2000,
                    width: _image.width,
                    height: _image.height
                }),
                particleEnt
            );
            em.addComponentToEntity(
                new boc.components.DrawableSprite({
                    image: _image,
                    alpha: 1.0,
                    visible : false
                }),
                particleEnt
            );
            em.addComponentToEntity(
                new boc.components.Lifespan({ duration: duration }),
                particleEnt
            );

            em.addComponentToEntity(
                new boc.pfx.components.Emitter({
                    particleFactory: new boc.pfx.particleFactories.SmokeFactory(em, _maxParticles),
                    startVector: { x: 0, y: -1 },
                    startVelocity: 25, // pixels per sec
                    accelerationVector: { x: 0, y: -0.025 },
                    emitRadius: 360,
                    particleDuration: duration - 20, // ms
                    particlesPerSecond: 5
                }),
                particleEnt
            );

            _currParticleIndex++;
            return particleEnt;
        }
    },

    StarFactory: function (entityManager, max) {
        var em = entityManager;
        
        var _maxParticles = max || 25;
        var _queue = new Array(_maxParticles);
        var _currParticleIndex = 0;
        var _image = boc.resources.GraphicsManager.getImage('pfx_star_small.png');
        this.maxParticles = function () { return _maxParticles; }
        var _numParticles = 0;

        this.create = function (startPoint, startVector, velocity, acceleration, duration) {
            if (_numParticles >= _maxParticles) { return null; }
            if (_currParticleIndex >= _maxParticles) {
                _currParticleIndex = 0;
            }
            if (_queue[_currParticleIndex]) {
                var lifespan = em.getComponentForEntity('Lifespan', _queue[_currParticleIndex]);
                if (lifespan) {
                    lifespan.duration = 0;
                }                
            }
            var particleEnt = em.createEntity();
            _queue[_currParticleIndex] = particleEnt;
            em.addComponentToEntity(
                new boc.pfx.components.Particle({
                    directionVector: startVector,
                    velocity: velocity,
                    accelerationVector: acceleration
                }),
                particleEnt
            );

            // align it @ the center
            em.addComponentToEntity(
                new boc.components.Spatial({
                    x: startPoint.x + _image.width / 2,
                    y: startPoint.y + _image.height / 2,
                    z: 2000,
                    width : _image.width,
                    height: _image.height
                }),
                particleEnt
            );
            em.addComponentToEntity(
                new boc.components.DrawableSprite({
                    image : _image,
                    alpha : 1.0
                }),
                particleEnt
            );
            em.addComponentToEntity(
                new boc.components.Lifespan({ duration: duration }),
                particleEnt
            );
            _currParticleIndex++;
            return particleEnt;
        }
    }, //createBasicFactory
    
    SmokeFactory: function (entityManager, max) {
        var em = entityManager;
        
        var _maxParticles = max || 25;
        var _queue = new Array(_maxParticles);
        var _currParticleIndex = 0;
        var _image = boc.resources.GraphicsManager.getImage('pfx_smoke_small.png');

        var _numParticles = 0;
        this.maxParticles = function () { return _maxParticles; }

        this.create = function (startPoint, startVector, velocity, acceleration, duration) {
            if (_numParticles >= _maxParticles) { return null; }
            if (_currParticleIndex >= _maxParticles) {
                _currParticleIndex = 0;
            }
            if (_queue[_currParticleIndex]) {
                var lifespan = em.getComponentForEntity('Lifespan', _queue[_currParticleIndex]);
                if (lifespan) {
                    lifespan.duration = 0;
                }                
            }
            var particleEnt = em.createEntity();
            _queue[_currParticleIndex] = particleEnt;
            em.addComponentToEntity(
                new boc.pfx.components.Particle({
                    directionVector: startVector,
                    velocity: velocity,
                    accelerationVector : acceleration
                }),
                particleEnt
            );

            // align it @ the center
            em.addComponentToEntity(
                new boc.components.Spatial({
                    x: startPoint.x + _image.width / 2,
                    y: startPoint.y + _image.height / 2,
                    z: 2000,
                    width : _image.width,
                    height: _image.height
                }),
                particleEnt
            );
            em.addComponentToEntity(
                new boc.components.DrawableSprite({
                    image : _image,
                    alpha : 0.2
                }),
                particleEnt
            );
            em.addComponentToEntity(
                new boc.components.Lifespan({
                    duration: duration,
                    onKill: function () { _numParticles--; }
                }),
                particleEnt
            );
            _currParticleIndex++;
            _numParticles++;
            return particleEnt;
        }
    }, //createBasicFactory

    FadingStarFactory: function (entityManager, max) {
        var em = entityManager;

        var _maxParticles = max || 25;
        var _queue = new Array(_maxParticles);
        var _currParticleIndex = 0;
        var _image = boc.resources.GraphicsManager.getImage('pfx_star_small.png');
        this.maxParticles = function () { return _maxParticles; }
        var _numParticles = 0;

        this.create = function (startPoint, startVector, velocity, acceleration, duration, z) {
            if (_numParticles >= _maxParticles) { return null; }
            if (_currParticleIndex >= _maxParticles) {
                _currParticleIndex = 0;
            }
            if (_queue[_currParticleIndex]) {
                var lifespan = em.getComponentForEntity('Lifespan', _queue[_currParticleIndex]);
                if (lifespan) {
                    lifespan.duration = 0;
                }
            }
            var particleEnt = em.createEntity();
            _queue[_currParticleIndex] = particleEnt;
            em.addComponentToEntity(
                new boc.pfx.components.Particle({
                    directionVector: startVector,
                    velocity: velocity,
                    accelerationVector: acceleration
                }),
                particleEnt
            );

            // align it @ the center
            em.addComponentToEntity(
                new boc.components.Spatial({
                    x: startPoint.x + _image.width / 2,
                    y: startPoint.y + _image.height / 2,
                    z: z,
                    width: _image.width,
                    height: _image.height
                }),
                particleEnt
            );
            em.addComponentToEntity(
                new boc.components.DrawableSprite({
                    image: _image,
                    alpha: 1.0
                }),
                particleEnt
            );
            em.addComponentToEntity(
                new boc.components.Lifespan({ duration: duration }),
                particleEnt
            );

            //fade animation
            em.addComponentToEntity(
                new boc.components.Animation({
                    componentName: 'DrawableSprite',
                    propertyDeltas: { alpha: -1.0 },
                    duration: duration,
                    easing: 'easeOutQuad',
                    state : boc.constants.ANIMATION_PLAYING
                }),
                particleEnt
            );
            _currParticleIndex++;
            return particleEnt;
        }
    }, //createBasicFactory
};

boc.pfx.components = {
    EmitterBurstEvent : function(obj) {
        this.target = obj.target;
        this.count = obj.count;
        this.className = function () { return 'EmitterBurstEvent'; }
    },
    
    Emitter: function (obj) {
        this.particleFactory = obj.particleFactory;
        this.startVector = obj.startVector;
        this.startVelocity = obj.startVelocity;
        this.emitRadius = obj.emitRadius; // degrees
        this.accelerationVector = obj.accelerationVector;
        this.particleDuration = obj.particleDuration;        
        this.particlesPerSecond = obj.particlesPerSecond;
        this.particlesPerMillisecond = obj.particlesPerSecond / 1000;
        this.elapsedSinceLastEmit = 0;        
        this.className = function () { return 'Emitter'; }
    },

    Particle: function (obj) {
        this.directionVector = obj.directionVector; // normalized
        this.veloctiy = obj.velocity; // pixel per second
        this.velocity_ppms = obj.velocity / 1000; // just so i don't have to calculate it each iteration
        this.accelerationVector = obj.accelerationVector;
        
        this.className = function () { return 'Particle'; }
    }
};

boc.pfx.systems = {
    BasicParticleSystem: function (entityManager) {
        var em = entityManager;
        var iter = 0;
        
        function emit(emitComp, spatialComp) {
            var startVector = { x: emitComp.startVector.x, y: emitComp.startVector.y };
            // randomize it a little
            var disturbanceDeg = (Math.random() * emitComp.emitRadius) - emitComp.emitRadius / 2;
            var disturbanceRad = boc.utils.degToRad(disturbanceDeg);
            startVector.x = emitComp.startVector.x * Math.cos(disturbanceRad) - emitComp.startVector.y * Math.sin(disturbanceRad);
            startVector.y = emitComp.startVector.y * Math.cos(disturbanceRad) + emitComp.startVector.x * Math.sin(disturbanceRad);            
            return emitComp.particleFactory.create(spatialComp, startVector, emitComp.startVelocity, emitComp.accelerationVector, emitComp.particleDuration, spatialComp.z);
        }
        
        this.processTick = function (frameTime) {
            var burstEvents = em.getAllEntitiesWithComponent('EmitterBurstEvent');
            for (var i = 0; i < burstEvents.length; i++) {
                var eventEnt = burstEvents[i];
                var eventComp = em.getComponentForEntity('EmitterBurstEvent', eventEnt);
                var emitter = em.getComponentForEntity('Emitter', eventComp.target);
                var spatial = em.getComponentForEntity('Spatial', eventComp.target);
                if (emitter) {
                    var maxToEmit = Math.min(eventComp.count, emitter.particleFactory.maxParticles());
                    for (var j = 0; j < maxToEmit; j++) {
                        emit(emitter, spatial);    
                    }                    
                }
                boc.utils.consumeEvent(eventEnt, 'EmitterBurstEvent', em);
            } // i
            
            // handle emits
            var emitEnts = em.getAllEntitiesWithComponent('Emitter');

            // emit linearly
            for (var i = 0; i < emitEnts.length; i++) {
                var emitEnt = emitEnts[i];
                var emitComp = em.getComponentForEntity('Emitter', emitEnt);
                var spatialComp = em.getComponentForEntity('Spatial', emitEnt);
                emitComp.elapsedSinceLastEmit += frameTime;
                var mspp = 1 / emitComp.particlesPerMillisecond;
                if (emitComp.elapsedSinceLastEmit >= mspp) {
                    var numEmitted = 0;
                    while (emitComp.elapsedSinceLastEmit >= mspp && numEmitted <= emitComp.particleFactory.maxParticles()) {                        
                        if (!emit(emitComp, spatialComp)) {                            
                            emitComp.elapsedSinceLastEmit = 0;
                            break;
                        }
                        emitComp.elapsedSinceLastEmit -= mspp;
                        numEmitted++;
                        
                    }
                    if (numEmitted > 0) {
                        emitComp.elapsedSinceLastEmit = 0;
                    }
                }
            } // i

            // update particles
            var particleEnts = em.getAllEntitiesWithComponent('Particle');
            for (var i = 0; i < particleEnts.length; i++) {
                var particleEnt = particleEnts[i];
                var particle = em.getComponentForEntity('Particle', particleEnt);
                var spatial = em.getComponentForEntity('Spatial', particleEnt);

                var delta = {
                    x: spatial.x + particle.directionVector.x * particle.velocity_ppms * frameTime,
                    y: spatial.y + particle.directionVector.y * particle.velocity_ppms * frameTime
                };

                spatial.update(delta);
                particle.directionVector.x += particle.accelerationVector.x;
                particle.directionVector.y += particle.accelerationVector.y;
            } // i

/*
            iter++;
            if (iter % 10 == 0) {
                console.log(particleEnts.length);
            }*/
            
        }; // processTick
    }//ParticleSystem
};