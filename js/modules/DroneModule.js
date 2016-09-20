//TODO: class

//debug
var totDown=0;
var totUp=0;
var totNone=0;
var toLeft =0;
var toFront=0;
// imports , globals
var arDrone = require('ar-drone');
var control = arDrone.createUdpControl();
//var client = arDrone.createClient();

/*
 function showStruct(data) {
 console.log("===============");
 if(data.demo) {
 console.log("METERS: " + data.demo.altitudeMeters);
 console.log(data.demo.batteryPercentage);
 }
 console.log("===============");
 }
 */

/**
 * A Point prototype
 * to be used for drone navigation.
 */
function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    // Checks if a given point truncated is equal this
    this.EqualsEpsilon = function (otherLoc, eps) {
        return this.eqEps(this.x, otherLoc.x, eps) && this.eqEps(this.y, otherLoc.y, eps) && this.eqEps(this.z, otherLoc.z, eps);
    };

    this.set = function (x, y, z, transFunc) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (transFunc)
            transFunc(this);
    };
    // Checks if 2 given values truncated are equal
    this.eqEps = function (a, b, eps) {
        return Math.abs(a - b) < eps;
    };

    this.delta = function (x, y, z, transFunc) {
        var p = new Point(x, y, z);
        if (transFunc) transFunc(p);
        var del =new Point(Math.abs(this.x - p.x), Math.abs(this.y - p.y), Math.abs(this.z - p.z));
        //console.log(del.toString());
        return del;
    };

    this.toString = function () {
        return `[x:${x}\t,y:${y}\t,z:${z}\t]`;
    };

}

/**
 * Handles all drone flight control
 * Works on simple 3D coordinate system as follows:
 * x+: right
 * y+: front
 * z+: up
 */
var droneControl =
{
    /* Parameters/Constants */
    MINIMUM_INTERVAL: 30, //Minimum interval between every update
    MOVE_QUANTA: 0.05, // Increment value to location on every iteration
    FLIGHT_EPS: 0.1, //Flight Accuracy Epsilon

    MOVEMENT_TH_SLOW: 0.02,
    MOVEMENT_TH_MEDIUM: 0.06,
    MOVEMENT_TH_NORMAL: 0.08,

    SPEED_FACTOR_SLOW: 0.2,
    SPEED_FACTOR_MED: 0.4,
    SPEED_FACTOR_NORMAL: 1,

    /* Members */
    curDelta : new Point(0, 0, 0),
    speedFactor: new Point(1, 1, 1),
    IntervalId: 0, //we need this in order to terminate main loop.
    pcmd: {}, // up,left,front control struct
    ref: {}, // fly,emergency control struct
    currentLocation: new Point(0, 0, -0.5), // Current drone location .
    targetLocation: new Point(0, 0, 0),  // Target location (location drone needs to go to).

    /**
     * Init Drone control main loop and set emergency parameters
     */
    Init: function () {
        console.log("Init");
        droneControl.ref.emergency = true;
        droneControl.IntervalId = setInterval(this.MainLoop, this.MINIMUM_INTERVAL);
        setTimeout(function () {
            console.log("Emergency=false");
            droneControl.ref.emergency = false;
            //droneControl.Takeoff();
        }, 2000);
    },


    /**
     * Calculates the forces required to fly from source (point) to dest (point)
     * @return {number} force "vector"
     */
    CalcForce: function (diff,delta) {
        var speedFactor=1;
        if(delta) {
            speedFactor = (Math.abs(delta) - droneControl.FLIGHT_EPS < 0) ? 0 : delta - droneControl.FLIGHT_EPS;
            speedFactor = speedFactor / 3.5;
        }
        //console.log("SPEED "+speedFactor);
        if (Math.abs(diff) < droneControl.FLIGHT_EPS) return 0;
        if (diff > 0) return speedFactor;
        else return -1*speedFactor;
    },


    /**
     * Register a handler for dealing with drone info.
     * handler signiture: function(data){}
     */
    RegisterDroneStatus: function (statHandler) {
        //client.on('navdata', statHandler);
    },


    /// Debug
    avg: [{n: 0, a: 0}, {n: 0, a: 0}, {n: 0, a: 0}],

    addAvg: function (idx, val, txt) {
        droneControl.avg[idx].a = (droneControl.avg[idx].a * droneControl.avg[idx].n + val) / (droneControl.avg[idx].n + 1);
        droneControl.avg[idx].n++;
        console.log("Delta(" + txt + "):" + droneControl.avg[idx].a);

    },


    ////
    hover : false,

    cordinateTranslation: function (point) {
        point.x =  2*(1 - 2 * point.x);
        point.y =  2*(1 - 2 * point.y);
        point.z = 1+3 * (2*point.z - 1);
    },

    getSpeedFactor: function (sDelta) {
        if (sDelta < droneControl.MOVEMENT_TH_SLOW) return droneControl.SPEED_FACTOR_SLOW;
        else if (sDelta < droneControl.MOVEMENT_TH_MEDIUM) return droneControl.SPEED_FACTOR_MED;
        else if (sDelta < droneControl.MOVEMENT_TH_NORMAL) return droneControl.SPEED_FACTOR_NORMAL;
        return droneControl.SPEED_FACTOR_NORMAL;
    },

    /**
     * sets speed factor to be used only if axis needs speed.
     * (if hand is in axis pos location)
     * @param delta the bigger the delta the faster the speed
     */
    updateSpeedFactor: function (delta) {
        droneControl.speedFactor.set(
            droneControl.getSpeedFactor(delta.x),
            droneControl.getSpeedFactor(delta.y),
            droneControl.SPEED_FACTOR_NORMAL);
    },
    /**
     * Commands drone to fly to coordinate.
     */
    FlyTo: function (x, y, z) {
        var delta = droneControl.currentLocation.delta(x, y, z, droneControl.cordinateTranslation);
        //console.log("current: "+droneControl.currentLocation);
       // console.log("target: "+droneControl.targetLocation);
        //console.log("z: "+z+"  delta: "+delta);
        droneControl.updateSpeedFactor(delta);
        droneControl.curDelta = delta;
        //console.log(JSON.stringify(droneControl.speedFactor));
        droneControl.targetLocation.set(x, y, z, droneControl.cordinateTranslation);
    },

    /**
     * Commands drone to take off.
     */
    Takeoff: function () {
        console.log("taking off");
        droneControl.ref.fly = true;
    },

    /**
     * Commands drone to land.
     */
    Land: function () {
        console.log("landing");
        droneControl.ref.fly = false;
    },

    /**
     * Terminates the main loop and lands drone.
     */
    Terminate: function () {
        console.log("Terminating loop intID: ");
        this.Land();
        setTimeout(function () {
            clearInterval(droneControl.IntervalId);
        }, 100);
    },


    /**
     * Updates on every iteration drone location according to forces
     */
    LocationUpdater: function () {
        if (droneControl.pcmd == null) return;
        this.currentLocation.x += (droneControl.MOVE_QUANTA * -droneControl.pcmd.left );//* droneControl.speedFactor.x);
        this.currentLocation.y += (droneControl.MOVE_QUANTA * droneControl.pcmd.front );//* droneControl.speedFactor.y);
        var upSliceFactor = 1.8;
        var MOVE_QUANT = droneControl.MOVE_QUANTA;
        if(droneControl.pcmd.up>0)
            MOVE_QUANT = MOVE_QUANT/upSliceFactor;
        this.currentLocation.z += (MOVE_QUANT * droneControl.pcmd.up);
    },

    /**
     * Every iteration updates flight forces to send to drone
     **/
    FlightUpdater: function () {
        if(droneControl.hover){
            droneControl.pcmd =null;
            return;
        }
        if (!this.currentLocation.EqualsEpsilon(this.targetLocation, droneControl.FLIGHT_EPS)) {
            if (!droneControl.pcmd) droneControl.pcmd = {};
            droneControl.pcmd.left = this.CalcForce(this.currentLocation.x - this.targetLocation.x, droneControl.curDelta.x);
            droneControl.pcmd.front = this.CalcForce(this.targetLocation.y - this.currentLocation.y,droneControl.curDelta.y);

            toFront+=droneControl.pcmd.front;
            console.log("LEFT " + droneControl.pcmd.left);
            console.log("to LEFT " + toLeft);

            if (toLeft<-5 && droneControl.pcmd.left<0)
            {
                droneControl.pcmd.left = 0;
                console.log("too much RIGHT!");
            }

            else if (toLeft>5 && droneControl.pcmd.left>0) {
                droneControl.pcmd.left = 0;
                console.log("too much LEFT!");
            }
            else
                toLeft+=droneControl.pcmd.left;

            droneControl.pcmd.up = this.CalcForce(this.targetLocation.z - this.currentLocation.z);
           // console.dir("\tUP: "+droneControl.pcmd.up+"\tLEFT: "+droneControl.pcmd.left+"\tFRONT"+droneControl.pcmd.front);
            if(droneControl.pcmd.up>0) totUp++;
            else if(droneControl.pcmd.up<0) totDown++;
            else totNone++;
            //console.log("U:"+totUp+" D:"+totDown+" N:"+totNone+"\t"+((droneControl.pcmd.up>0)?"UP: ":(droneControl.pcmd.up==0)?"STAY:":"DOWN:")+droneControl.pcmd.up);//+"\ttar: "+this.targetLocation.z+"\tcur "+this.currentLocation.z);
        } else {
            droneControl.pcmd = null;
        }
    },

    /**
     * Main loop , this function is called from within setInterval and is invoked
     * every MOVE_QUANTA milliseconds
     **/
    MainLoop: function () {
        droneControl.FlightUpdater();
        droneControl.LocationUpdater();
        //var p = (droneControl.pcmd == null) ? {front: 0, left: 0, up: 0} : droneControl.pcmd;
        //console.log("CLOC["+droneControl.currentLocation.x+","+droneControl.currentLocation.y+","+droneControl.currentLocation.z+"] | PCMD["+(-p.left)+","+(p.front)+","+(p.up)+"] target["+droneControl.targetLocation.x+","+droneControl.targetLocation.y+","+droneControl.targetLocation.z+"]");
        control.ref(droneControl.ref);
        control.pcmd(droneControl.pcmd);
        control.flush();
    }

};


//////////////////////// TEST CODE ////////////////////
function p(msg) {
    console.log(msg);
}

function Test() {
    droneControl.Init();
    // droneControl.Takeoff();
    var QUANT = 2500;
    var START = 3000;

    setTimeout(function () {
        droneControl.FlyTo(1, 1, 1);
        p("TO 0,1,0");
    }, START + QUANT);
    setTimeout(function () {
        droneControl.FlyTo(1, 1, 0);
        p("TO 1,1,0");
    }, START + QUANT * 2);
    setTimeout(function () {
        droneControl.FlyTo(0, 1, 0);
        p("TO 1,0,0");
    }, START + QUANT * 3);
    setTimeout(function () {
        droneControl.FlyTo(0, 0, 0);
        p("TO 0,0,0");
    }, START + QUANT * 4);
    setTimeout(function () {
        droneControl.Terminate();
    }, START + QUANT * 5);
    setTimeout(function () {
        process.exit();
    }, START + QUANT * 6);

}

//Test();


module.exports.droneCtrl = droneControl;