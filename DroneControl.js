// imports , globals
var arDrone = require('ar-drone');
var control = arDrone.createUdpControl();
//var ref = {}; // Controls fly/land/emergency
//var pcmd = {}; // controls up/left/right/spin


/**
 * A Point prototype
 * to be used for drone navigation.
 */
function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    // Checks if a given point truncated is equal this
    this.EqualsEpsilon = function (otherLoc,eps) {
        return this.eqEps(this.x, otherLoc.x,eps) && this.eqEps(this.y, otherLoc.y,eps) && this.eqEps(this.z, otherLoc.z,eps);
    };

    this.set = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    };
    // Checks if 2 given values truncated are equal
    this.eqEps = function (a, b,eps) {
        return Math.abs(a-b)<eps;
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
    /* Constants */
    MINIMUM_INTERVAL: 30, //Minimum interval between every update
    MOVE_QUANTA: 0.04, // Increment value to location on every iteration
    FLIGHT_EPS : 0.02, //Flight Accuracy Epsilon

    /* Members */
    IntervalId: 0, //we need this in order to terminate main loop.
    pcmd: {}, // up,left,front control struct
    ref: {}, // fly,emergency control struct
    currentLocation: new Point(0, 0, 0), // Current drone location .
    targetLocation: new Point(0, 0, 0),  // Target location (location drone needs to go to).

    /**
     * Init Drone control main loop and set emergency parameters
     */
    Init: function () {
        droneControl.ref.emergency=true;
        droneControl.IntervalId = setInterval(this.MainLoop, this.MINIMUM_INTERVAL);
        setTimeout(function(){console.log("Emergency=false");droneControl.ref.emergency=false;droneControl.Takeoff()},1000);
    },


    /**
     * Calculates the forces required to fly from source (point) to dest (point)
     * @return {number} force "vector"
     */
    CalcForce: function (diff) {
        if(Math.abs(diff) < droneControl.FLIGHT_EPS) return 0;
        if (diff > 0) return 1;
        else return -1;
    },


    FlyTo: function (x, y, z) {
        console.log("Fly To ["+x+","+y+","+z+"]");
        droneControl.targetLocation.set(x, y, z);
    },

    Takeoff: function () {
        console.log("taking off");
        droneControl.ref.fly=true;
    },

    Land: function () {
        console.log("landing");
        droneControl.ref.fly=false;
    },

    /**
     * Terminates the main loop and lands drone.
     */
    Terminate: function () {
        console.log("Terminating loop intID: ");
        this.Land();
        setTimeout(function(){clearInterval(droneControl.IntervalId);},100);
    },


    /**
     * Updates on every iteration drone location according to forces
     */
    LocationUpdater: function () {
        if(droneControl.pcmd== null) return;
        this.currentLocation.x += (droneControl.MOVE_QUANTA * -droneControl.pcmd.left);
        this.currentLocation.y += (droneControl.MOVE_QUANTA * droneControl.pcmd.front);
        this.currentLocation.z += (droneControl.MOVE_QUANTA * droneControl.pcmd.up);
    },

    /**
     * Every iteration updates flight forces to send to drone
     **/
    FlightUpdater: function () {
        if (!this.currentLocation.EqualsEpsilon(this.targetLocation,droneControl.FLIGHT_EPS)) {
            if (!droneControl.pcmd) droneControl.pcmd = {};
            droneControl.pcmd.left =  this.CalcForce(this.currentLocation.x - this.targetLocation.x);
            droneControl.pcmd.front = this.CalcForce(  this.targetLocation.y-this.currentLocation.y);
            droneControl.pcmd.up = this.CalcForce( this.targetLocation.z - this.currentLocation.z );
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
        var p = (droneControl.pcmd==null)? {front:0,left:0,up:0} : droneControl.pcmd;
        //console.log("CLOC["+droneControl.currentLocation.x+","+droneControl.currentLocation.y+","+droneControl.currentLocation.z+"] | PCMD["+(-p.left)+","+(p.front)+","+(p.up)+"]");
        control.ref(droneControl.ref);
        control.pcmd(droneControl.pcmd);
        control.flush();
    }

};


//////////////////////// TEST CODE ////////////////////
function p(msg){
    console.log(msg);
}

function Test() {
    droneControl.Init();
   // droneControl.Takeoff();
    var QUANT=2500;
    var START=3000;

    setTimeout(function () {droneControl.FlyTo(1,1,1);p("TO 0,1,0");},START+QUANT);
    setTimeout(function () {droneControl.FlyTo(1,1,0);p("TO 1,1,0");},START+QUANT*2);
    setTimeout(function () {droneControl.FlyTo(0,1,0);p("TO 1,0,0");},START+QUANT*3);
    setTimeout(function () {droneControl.FlyTo(0,0,0);p("TO 0,0,0");},START+QUANT*4);
    setTimeout(function () {droneControl.Terminate();},START+QUANT*5);
    setTimeout(function () {process.exit();},START+QUANT*6);

}

//Test();

