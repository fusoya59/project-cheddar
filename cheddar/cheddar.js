/**
* request animation frame convenience
* http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*/
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (callback) {
        var timeFrame = 1000 / 60;
        window.setTimeout(function () { callback(+new Date); }, timeFrame);
    };
})();

if (typeof (window.chd) == 'undefined') { window.chd = {}; }
if (!chd.utils) { chd.utils = {}; }
if (!chd.constants) { chd.constants = {}; }

chd._em = null;

chd.constants.DESIRE_THRESHOLD = 80; // out of 100
chd.constants.WAIT_THRESHOLD = 800;
chd.constants.VERY_SATISFIED = 80;
chd.constants.SATISFIED = 50;
chd.constants.DISAPPOINTED = 30;
chd.constants.REPULSED = 5;

chd.utils.getEntity = function (c, em) {
    if (!em) { em = chd._em; }
    return em.getAllEntitiesWithComponent(c)[0];
}

chd.utils.createThoughtBubble = function (text, forEnt, em) {
    if (!em) { em = chd._em; }
    var forEntSpatial = em.getComponentForEntity('Spatial', forEnt);
    var forEntThought = em.getComponentForEntity('Thought', forEnt);
    if (forEntThought && forEntThought.handle) {
        try {
            em.killEntity(forEntThought.handle[0]);
        } catch (err) { }
        try {
            em.killEntity(forEntThought.handle[1]);        
        } catch (err) { }
    }
    var ent = new boc.core.Entity({ entityManager: em });    
    ent.addComponent(
        new boc.components.Spatial({
            x: forEntSpatial.x - 50,
            y: forEntSpatial.y - 60,
            z: forEntSpatial.z,
            width: 125,
            height: 50
        })
    );
    ent.addComponent(new boc.components.DrawableRect({ fillStyle: 'white' }));
    ent.addComponent(new boc.components.Lifespan({ duration: 1200 }));

    boc.utils.follow(forEnt, ent.id(), em);
    
    var textEnt = new boc.core.Entity({ entityManager: em });
    textEnt.addComponent(
        new boc.components.Spatial({
            x: forEntSpatial.x - 35,
            y: forEntSpatial.y - 35,
            z: forEntSpatial.z + 1,
            width: 125,
            height: 50
        })
    );
    textEnt.addComponent(new boc.components.DrawableText({ text: text }));
    textEnt.addComponent(new boc.components.Lifespan({ duration: 1200 }));
    boc.utils.follow(forEnt, textEnt.id(), em);
    if (forEntThought) {
        forEntThought.handle = [ent.id(), textEnt.id()];
    }
}

chd.utils.onEvent = function (event, em) {
    if (!em) { em = chd._em; }
    var eventEnts = em.getAllEntitiesWithComponent(event);
    return {
        each: function (fn) {
            for (var i = 0; i < eventEnts.length; i++) {
                (function (j) {
                    if (fn) {
                        fn(eventEnts[j], em.getComponentForEntity(event, eventEnts[j]));
                        boc.utils.consumeEvent(eventEnts, event, em);
                    }
                })(i);
            } // i
        } // each
    }; //return
} //onEvent

// a good, for the good provider
chd.LemonadeDrink = function (tanginess, sweetness, coldness) {
    this.tanginess = tanginess;
    this.sweetness = sweetness;
    this.coldness = coldness;
    this.name = 'Lemonade';
}

// a customer preference; basically the same thing as above
chd.LemonadePreference = function (tanginess, sweetness, coldness) {
    this.tanginess = tanginess;
    this.sweetness = sweetness;
    this.coldness = coldness;
    this.good = 'Lemonade';
}

chd.LemonadeCustomerFactory = function (p) {
    if (!p) { p = {}; }
    if (!p.startPoint) { p.startPoint = { x: 0, y : 0 }; }
    if (!p.money) { p.money = function() { return 10; }; }
    if (!p.desire) { p.desire = function() { return 10; }; }
    if (!p.patience) { p.patience = function() { return 10; }; }
    if (!p.preference) { p.preference = function () { return new chd.LemonadePreference(100, 100, 100); }; }
    if (!p.speed) { p.speed = function () { return 100; }; }
    if (!p.name) { p.name = function() { return Math.random() + ' Smith' ; }; }

    var em = p.em || chd._em;
    
    var c = 0;
    var z = 0;
    this.create = function () {
        var colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
        $em($em.create())
            .ns('boc.components')
                .add('Spatial', { x: p.startPoint.x, y: p.startPoint.y, width: 25, height: 25, z: z })
                .add('DrawableRect', { fillStyle: colors[c++ % colors.length] })
                .add('Identifiable', {})
            .ns('chd')
                .add('Customer', { money: p.money(), desire: p.desire(), patience: p.patience(), preference: p.preference(), name: p.name(), speed: p.speed() })
                .add('Thought', null);        
        z+=2;
        return ent;
    }
}

chd.TribeCustomerFactory = function (p) {
    if (!p) { p = {}; }
    if (!p.startPoint) { p.startPoint = { x: 0, y: 0 }; }
    if (!p.money) { p.money = function () { return 10; }; }
    if (!p.desire) { p.desire = function () { return 10; }; }
    if (!p.patience) { p.patience = function () { return 10; }; }
    if (!p.preference) { p.preference = function () { return new chd.LemonadePreference(100, 100, 100); }; }
    if (!p.speed) { p.speed = function () { return 100; }; }
    if (!p.name) { p.name = function () { return Math.random() + ' Smith'; }; }

    var em = p.em || chd._em;

    var c = 0;
    var z = 0;
    this.create = function () {
        var teams = ['Red', 'Blue', 'Yellow'];
        var team = teams[c++ % teams.length];

        var ent = new boc.core.Entity({ entityManager: em });
        ent.addComponent(new boc.components.Spatial({ x: p.startPoint.x, y: p.startPoint.y, width: 50, height: 50, z: z }));        
        ent.addComponent(new chd.Customer({ money: p.money(), desire: p.desire(), patience: p.patience(), preference: p.preference(), name: p.name(), speed: p.speed() }));
        ent.addComponent(new boc.components.Identifiable({}));
        ent.addComponent(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('assets/Units/SpearWarrior/' + team + '/Walk/SpearWarrior_Walk0001.png') }));
        ent.addComponent(new boc.components.Transformable());
        ent.Transformable.transforms.push(function (ent, context) {
            var s = em.getComponentForEntity('Spatial', ent);
            if (s) {                
                context.scale(-1, 1);
                context.translate(-s.width - 2*s.x, 0);
            }
        });
        var sprites = [];
        for (var i = 1; i <= 9; i++) {
            sprites.push(new boc.components.DrawableSprite({
                image: boc.resources.GraphicsManager.getImage('assets/Units/SpearWarrior/' + team + '/Walk/SpearWarrior_Walk000' + i + '.png'),
                visible : true
            }));            
        } //i        
        var anim = new boc.utils.SpriteAnimationSequence({
            entity : ent.id(),
            loop : true,
            animations : [ new boc.components.SpriteAnimation({
                easing : 'linearTween',
                duration : 500,
                sprites: sprites,
                state : boc.constants.ANIMATION_PLAYING
            }) ]
        }).start();
                
        z += 2;
        return ent;
    }
}

// components

chd.Thought = function (p) {
    this.handle = p;
    this.className = function () { return 'Thought'; }
}

chd.Customer = function (p) {
    this.money = p.money; // {int} dollars
    this.desire = p.desire; // {int} determines if customer lines up or not
    this.patience = p.patience; // {int} factor in satistfaction after served
    this.preference = p.preference; // {object} factor in satisfaction after served
    this.name = p.name;
    this.speed = p.speed;
    this.thoughts = [];
    this.waitTime = 0;
    this.satisfaction = 0; // {int} 0...100
    this.state = 'walking';
    this.className = function() { return 'Customer'; }
};

chd.Report = function (p) {
    this.totalCustomers = 0;
    this.totalServed = 0;
    this.verySatisfied = 0;
    this.satisfied = 0;
    this.disappointed = 0;
    this.repulsed = 0;
    this.tooExpensive = 0;
    this.waitTooLong = 0;
    this.className = function () { return 'Report'; }
}

chd.CustomerGoodsProvider = function (p) {
    this.good = p.good;
    this.pricePerGood = p.pricePerGood;
    this.stock = p.stock;
    this.maxStock = p.maxStock;
    this.totalSales = 0;
    this.productionRate = p.productionRate; // goods per tick
    this.production = 0;
    this.serviceRate = p.serviceRate; // customers per tick
    this.service = 0;
    this.state = 'waiting';
    this.queue = [];
    this.upgrades = []; // upgrade components
    this.description = p.description;
    this.className = function () { return 'CustomerGoodsProvider'; }
};

chd.ReputationInfluencer = function (p) {
    this.desire = p.desire;
    this.patience = p.patience;
    this.description = p.description;
    this.className = function () { return 'ReputationInfluencer'; }
};

chd.WeatherInfluencer = function (p) {
    this.desire = p.desire;
    this.patience = p.patience;
    this.description = p.description;
    this.className = function () { return 'WeatherInfluencer'; }
};

chd.VenueInfluencer = function (p) {
    this.desire = p.desire;
    this.patience = p.patience;
    this.description = p.description;
    this.className = function () { return 'VenueInfluencer'; }
};

chd.QueueInfluencer = function (p) {
    this.desire = p.desire;
    this.patience = p.patience;
    this.description = p.description;
    this.className = function () { return 'QueueInfluencer'; }
};

chd.EndDayEvent = function (p) {
    this.className = function () { return 'EndDayEvent'; }
}

chd.CustomerQueuedEvent = function (p) {
    this.customerEntity = p;
    this.className = function () { return 'CustomerQueuedEvent'; }
}

chd.CustomerServedEvent = function (p) {
    this.customerEntity = p.customerEntity;
    this.good = p.good;
    this.className = function () { return 'CustomerServedEvent'; }
}

// systems
chd.CustomerCreationSystem = function (em, options) {
    if (!em) { em = chd._em; }
    if (!options) { options = {}; }
    if (!options.creationRate) { options.creationRate = 0.0125; } // per ms
    if (!options.maxCustomers) { options.maxCustomers = 100; } //
    if (!options.customerFactory) { options.customerFactory = new chd.LemonadeCustomerFactory(); }

    var customersCreated = 0;
    var customersKilled = 0;

    var timeElapsed = 0;
    var tCreated = 0.0;

    this.processTick = function (frameTime) {
        timeElapsed += frameTime;
        tCreated += options.creationRate * frameTime;

        while (Math.floor(tCreated) > customersCreated) {
            if (customersCreated < options.maxCustomers) {
                var customer = options.customerFactory.create();
                (function (c) {
                    c.addListener('onKill', function () {
                        customersKilled++;
                    });
                    var dx = 1000;
                    c.addComponent(new boc.components.Animation({
                        duration: dx * 1 / customer.Customer.speed * 1000,
                        componentName: 'Spatial',
                        propertyDeltas: { x: dx },
                        state : boc.constants.ANIMATION_PLAYING
                    }));
                }) (customer)

                customersCreated++;
            }
            else {
                if (customersCreated <= customersKilled) {
                    boc.utils.createEvent(new chd.EndDayEvent(), em);                    
                }
                break;
            }
        }
    } // processTick
}

chd.VenueInfluenceSystem = function (em) {
    if (!em) { em = chd._em; }
    this.processTick = function (frameTime) {

    } // processTick
}

chd.WeatherInfluenceSystem = function (em, p) {
    if (!em) { em = chd._em; }

    var _tickInterval = p.tickInterval || 100; // ms
    var _desirePerTick = p.desirePerTick;
    var _elapsed = 0;
    this.processTick = function (frameTime) {
        _elapsed += frameTime;
        if (_elapsed >= _tickInterval) {
            var ents = em.getAllEntitiesWithComponent('Customer');
            for (var i = 0; i < ents.length; i++) {
                var ent = ents[i];
                var customer = em.getComponentForEntity('Customer', ent);
                customer.desire += _desirePerTick;
            }
            _elapsed = 0;
        }
    } // processTick
}

chd.ReputationInfluenceSystem = function (em) {
    if (!em) { em = chd._em; }
    this.processTick = function (frameTime) {

    } // processTick
}

chd.EvaluatorSystem = function (em) {
    if (!em) { em = chd._em; }
    this.processTick = function (frameTime) {
        var cgpEnt = $em('CustomerGoodsProvider').first();
        var customerGoodProvider = $em(cgpEnt).comp('CustomerGoodsProvider');
        var customerGoodProviderSpatial = $em(cgpEnt).comp('Spatial');

        $em('Customer').each(function (e, c) {
            var customerEnt = e;
            var customer = c;

            if (customer.desire >= chd.constants.DESIRE_THRESHOLD && customer.state == 'walking') {
                if (customer.money >= customerGoodProvider.pricePerGood) {
                    (function (ce) {
                        var $ce = $em(ce);
                        $ce.comp('Animation').state = boc.constants.ANIMATION_STOPPED;
                        $ce.remove('Animation');

                        var dy = customerGoodProviderSpatial.y + customerGoodProviderSpatial.height - $ce.comp('Spatial').y;
                        var dx = customerGoodProviderSpatial.x + customerGoodProviderSpatial.width / 2 - $ce.comp('Spatial').x - $ce.comp('Spatial').width / 2;

                        var durx = dx * 1 / customer.speed * 1000;
                        var dury = dy * 1 / customer.speed * 1000;

                        var anim = new boc.components.Animation({
                            duration: Math.sqrt(Math.pow(durx, 2) + Math.pow(dury, 2)),
                            propertyDeltas: { x: dx, y: dy },
                            componentName: 'Spatial',
                            state: boc.constants.ANIMATION_PLAYING
                        });
                        anim.addListener('onComplete', function () {
                            boc.utils.createEvent(new chd.CustomerQueuedEvent(ce), em);
                        });
                        $ce.add(anim);
                        $ce.comp('Customer').state = 'finding';
                        
                    })(customerEnt);
                }
                else {
                    var msg = 'Too expensive!';
                    if (customer.thoughts.indexOf(msg) == -1) {
                        customer.thoughts.push(msg);
                        //$('#stand').prepend($('<div>').text(customer.name + ' : "' + customer.thoughts + '"'));
                        chd.utils.createThoughtBubble(msg, customerEnt, em);
                    }
                }
            } // walking
        });
            
        //}
    } // processTick
}

chd.ServiceSystem = function (em, p) {
    if (!em) { em = chd._em; }
    var _tickInterval = p.tickInterval || 100; // ms
    var _elapsed = 0;

    this.processTick = function (frameTime) {
        var customerProviderEnt = chd.utils.getEntity('CustomerGoodsProvider', em);
        var customerProvider = em.getComponentForEntity('CustomerGoodsProvider', customerProviderEnt);
        if (!customerProvider) { return; }

        var queueEnts = em.getAllEntitiesWithComponent('CustomerQueuedEvent');
        for (var i = 0; i < queueEnts.length; i++) {
            var customerEnt = em.getComponentForEntity('CustomerQueuedEvent', queueEnts[i]).customerEntity;
            var spatial = em.getComponentForEntity('Spatial', customerEnt);
            spatial.update({ y: spatial.y + customerProvider.queue.length * 20 });            
            customerProvider.queue.push(customerEnt);
            em.getComponentForEntity('Customer', customerEnt).state = 'queued';            
            boc.utils.consumeEvent(queueEnts[i], 'CustomerQueuedEvent', em);
            //atial.update({ z: customerSpatial + customerProvider.totalSales + customerProvider.queue.length });
        }

        _elapsed += frameTime;
        if (_elapsed >= _tickInterval) {
            if (customerProvider.state == 'waiting') {
                customerProvider.service += customerProvider.serviceRate;
                var customersServiced = 0;
                var customerEnt = customerProvider.queue[customersServiced];
                var customer = em.getComponentForEntity('Customer', customerEnt);
                if (customer) {
                    customer.state = 'beingServed';
                }

                while (customerProvider.service >= 1) {
                    customerEnt = customerProvider.queue[customersServiced];
                    customer = em.getComponentForEntity('Customer', customerEnt);

                    if (!customerEnt || !customer) {
                        customerProvider.service = 0;
                        break;
                    }

                    //customer.state = 'beingServed';
                    var dx = 1000;
                    if (em.getComponentForEntity('Animation', customerEnt)) {
                        em.removeComponentFromEntity('Animation', customerEnt);
                    }
                    em.addComponentToEntity(
                        new boc.components.Animation({
                            duration: dx * 1 / customer.speed * 1000,
                            componentName: 'Spatial',
                            propertyDeltas: { x: dx },
                            state: boc.constants.ANIMATION_PLAYING
                        }),
                        customerEnt
                    );
                    customersServiced++;
                    customerProvider.service--;
                    customerProvider.totalSales++;
                    customerProvider.stock--;
                    customer.state = 'served';                    
                    boc.utils.createEvent(new chd.CustomerServedEvent({ customerEntity: customerEnt, good: customerProvider.good }), em);

                    if (customerProvider.stock == 0) {
                        customerProvider.state = 'producing';
                        chd.utils.createThoughtBubble('Out of stock!', customerProviderEnt, em);
                    }
                    else {
                        customerProvider.state = 'serving'; // this doesn't really do anything, but logically this is what state its in
                    }
                    $('#stand').text('goods : ' + customerProvider.stock);
                } // while

                //dequeue
                customerProvider.queue.splice(0, customersServiced);
                if (customersServiced > 0) { // show the dequeuing
                    for (var i = 0; i < customerProvider.queue.length; i++) {
                        var customerSpatial = em.getComponentForEntity('Spatial', customerProvider.queue[i]);
                        customerSpatial.update({ y: customerSpatial.y - 20 });
                    }
                }

                if (customerProvider.state == 'serving') {
                    customerProvider.state = 'waiting';
                }
            } // state == 'waiting'
            
            _elapsed = 0;

            // update the wait counters for each customer
            for (var i = 0; i < customerProvider.queue.length; i++) {
                var customer = em.getComponentForEntity('Customer', customerProvider.queue[i]);
                if (customer.state == 'queued') {
                    customer.waitTime += _tickInterval;
                }
            }            
        } // serving
        
    } // processTick
}

chd.ProductionSystem = function (em, p) {
    if (!em) { em = chd._em; }
    var _tickInterval = p.tickInterval || 100; // ms
    var _elapsed = 0;
    this.processTick = function (frameTime) {
        var providerEnt = chd.utils.getEntity('CustomerGoodsProvider', em); // only 1
        if (!providerEnt) { return; }

        var provider = em.getComponentForEntity('CustomerGoodsProvider', providerEnt);
        if (!provider) { return; }

        _elapsed += frameTime;
        if (_elapsed >= _tickInterval) {
            if (provider.state == 'producing') {
                provider.production += provider.productionRate;
                provider.stock = Math.floor(provider.production);
                if (provider.stock > 0 && provider.stock % 2 == 0) {
                    chd.utils.createThoughtBubble('Producing: ' + provider.stock, providerEnt, em);
                }

                if (provider.stock == provider.maxStock) {
                    provider.production = 0;
                    chd.utils.createThoughtBubble('Ready to serve!', providerEnt, em);
                    provider.state = 'waiting';
                }
            }
            _elapsed = 0;
        }
    };
}

chd.ThoughtSystem = function (em) {
    if (!em) { em = chd._em; }
    this.processTick = function (frameTime) {
        $em('Customer').each(function (e, c) {            
            if (c.desire >= chd.constants.DESIRE_THRESHOLD) {
                var thought = 'I really want some ' + c.preference.good + '.';
                if (c.thoughts.indexOf(thought) == -1) {
                    c.thoughts.push(thought);                    
                }
            }
            if (c.waitTime >= chd.constants.WAIT_THRESHOLD) {
                var thought = 'Wait\'s too long!';
                if (c.thoughts.indexOf(thought) == -1) {
                    c.thoughts.push(thought);
                    chd.utils.createThoughtBubble(thought, e, em);
                }
            }
        }); // each         
    } // processTick
}

chd.CustomerSystem = function (em, renderCustomer) {
    if (!em) { em = chd._em; }
    this.processTick = function (frameTime) {
        var idEventEnts = em.getAllEntitiesWithComponent('IdentifyEvent');
        for (var i = 0; i < idEventEnts.length; i++) {
            var idEvent = em.getComponentForEntity('IdentifyEvent', idEventEnts[i]);
            if (renderCustomer && idEvent.identifiedEntities.length > 0) {
                renderCustomer(em.getComponentForEntity('Customer', idEvent.identifiedEntities[0]));
            }
            boc.utils.consumeEvent(idEventEnts[i], 'IdentifyEvent', em);
        }//i
    } // processTick
}

chd.VenueInfluenceSystem = function (em) {
    if (!em) { em = chd._em; }
    this.processTick = function (frameTime) {

    } // processTick
}

chd.SatisfactionSytem = function (em) {
    if (!em) { em = chd._em; }
    this.processTick = function (frameTime) {
        chd.utils.onEvent('CustomerServedEvent', em).each(
            function (eventEnt, eventComp) {
                // score it
                var good = eventComp.good;
                var customer = em.getComponentForEntity('Customer', eventComp.customerEntity);
                var score = 100;
                for (var p in customer.preference) {
                    var delta = Math.abs(customer.preference[p] - good[p]);
                    if (isNaN(delta)) { continue; }
                    score -= delta;
                }
                var spatial =em.getComponentForEntity('Spatial', eventComp.customerEntity);
                spatial.update({ z: spatial.z + 2 });
                if (score >= chd.constants.VERY_SATISFIED) {
                    var msg = 'That hit the spot!';
                    if (customer.thoughts.indexOf(msg) == -1) {
                        customer.thoughts.push(msg);                        
                        chd.utils.createThoughtBubble(msg, eventComp.customerEntity, em);
                    }
                    customer.satisfaction = chd.constants.VERY_SATISFIED;
                }
                else if (score >= chd.constants.SATISFIED) {
                    var msg = 'Pretty good!';
                    if (customer.thoughts.indexOf(msg) == -1) {
                        customer.thoughts.push(msg);                        
                        chd.utils.createThoughtBubble(msg, eventComp.customerEntity, em);
                    }
                    customer.satisfaction = chd.constants.SATISFIED;
                }
                else if (score >= chd.constants.DISAPPOINTED) {
                    var msg = 'Disappointing!';
                    if (customer.thoughts.indexOf(msg) == -1) {
                        customer.thoughts.push(msg);
                        chd.utils.createThoughtBubble(msg, eventComp.customerEntity, em);
                    }
                    customer.satisfaction = chd.constants.DISAPPOINTED;
                }
                else { // repulsed
                    var msg = 'Ewwwww!';
                    if (customer.thoughts.indexOf(msg) == -1) {
                        customer.thoughts.push(msg);
                        chd.utils.createThoughtBubble(msg, eventComp.customerEntity, em);
                    }
                    customer.satisfaction = chd.constants.REPULSED;
                }
                
            }
        );
    } // processTick
}

chd.CustomerCleanupSystem = function (em, bounds) {
    if (!em) { em = chd._em; }
    var r = new boc.core.Entity({ entityManager: em });
    r.addComponent(new chd.Report());

    this.processTick = function (frameTime) {
        //var spatialEnts = em.getAllEntitiesWithComponent('Spatial');
        var toKill = [];

        $em('Spatial').each(function (e, c) {
            var spatial = c;
            var customer = $em(e).comp('Customer');
            if (spatial.x > bounds.xmax) {
                toKill.push(e);
                if (customer) {
                    r.Report.totalCustomers++;
                    if (customer.state == 'served') {
                        r.Report.totalServed++;
                    }
                    if (customer.satisfaction == chd.constants.VERY_SATISFIED) {
                        r.Report.verySatisfied++;
                    }
                    else if (customer.satisfaction == chd.constants.SATISFIED) {
                        r.Report.satisfied++;
                    }
                    else if (customer.satisfaction == chd.constants.DISAPPOINTED) {
                        r.Report.disappointed++;
                    }
                    else if (customer.satisfaction == chd.constants.REPULSED) {
                        r.Report.repulsed++;
                    }
                    if (customer.thoughts.indexOf('Too expensive!') >= 0) {
                        r.Report.tooExpensive++;
                    }
                    if (customer.thoughts.indexOf('Wait\'s too long!') >= 0) {
                        r.Report.waitTooLong++;
                    }
                }
            }// max bounds
        });        
        while (toKill.length > 0) {
            em.killEntity(toKill.pop());
        }
    }
}

chd.DaySystem = function (em, onEndDay) {
    if (!em) { em = chd._em; }
    this.processTick = function (frameTime) {        
        if (em.getAllEntitiesWithComponent('EndDayEvent').length > 0) {
            if (onEndDay) { onEndDay(); }
        }
    } // processTick
}