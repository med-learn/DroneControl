// imports , globals
var arDrone = require('ar-drone');
var control = arDrone.createUdpControl();
//var ref = {}; // Controls fly/land/emergency
//var pcmd = {}; // controls up/left/right/spin




// A Point protoype
function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    // Checks if a given point truncated is equal this
    this.equals = function (otherLoc) {
        return this.truncEq(this.x, otherLoc.x) && this.truncEq(this.y, otherLoc.y) && this.truncEq(this.z, otherLoc.z);
    };

    this.set = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    };
    // Checks if 2 given values truncated are equal
    this.truncEq = function (a, b) {
        return (a | 0) == (b | 0);
    };
}


// Handles all drone flight control
// x+: right
// y+: front
// z+: up
var droneControl =
{
    //Constants
    //Minimum interval between every update
    MINIMUM_INTERVAL: 30,
    // Increment value to location on every iteration
    MOVE_QUANTA: 0.2,
    //Members
    IntervalId: 0,
    pcmd: {},
    ref: {},
    currentLocation: new Point(0, 0, 0),
    targetLocation: new Point(0, 0, 0),

    // Inits Drone control
    Init: function () {
        this.ref.emergency=false;
        this.IntervalId = setInterval(this.MainLoop, this.MINIMUM_INTERVAL);
    },

    // Calculates the forces required to fly from source (point) to dest (point)
    CalcForce: function (diff) {
        if (diff > 0) return 1;
        if (diff < 0) return -1;
        return 0;
    },


    FlyTo: function (x, y, z) {
        this.targetLocation.set(x, y, z);
    },

    Takeoff: function () {
        console.log("taking off");
        this.ref.fly=true;
    },

    Land: function () {
        console.log("landing");
        this.ref.fly=false;
    },

    Terminate: function () {
        console.log("Terminating loop intID: ");
        this.Land();
        setTimeout(function(){console.log("CLEAR");clearInterval(this.IntervalId);},100);
    },



    LocationUpdater: function () {
        if(this.pcmd== null) return;
        this.currentLocation.x += (this.MOVE_QUANTA * -this.pcmd.left);
        this.currentLocation.y += (this.MOVE_QUANTA * this.pcmd.front);
        this.currentLocation.z += (this.MOVE_QUANTA * this.pcmd.up);
    },

    FlightUpdater: function () {
        if (!this.currentLocation.equals(this.targetLocation)) {
            if (!this.pcmd) this.pcmd = {};
            this.pcmd.left = -this.CalcForce(this.currentLocation.x - this.targetLocation.x);
            this.pcmd.front = this.CalcForce(this.currentLocation.y - this.targetLocation.y);
            this.pcmd.up = this.CalcForce(this.currentLocation.z - this.targetLocation.z);
        } else {
            this.pcmd = null;
        }
    },

    MainLoop: function () {
        droneControl.FlightUpdater();
        droneControl.LocationUpdater();
        var p = (this.pcmd==null)? {front:0,left:0,up:0} : this.pcmd;
        console.log("CLOC["+droneControl.currentLocation.x+","+droneControl.currentLocation.y+","+droneControl.currentLocation.z+"] | PCMD["+(-p.left)+","+(p.front)+","+(p.up)+"]");
        control.ref(this.ref);
        control.pcmd(this.pcmd);
        control.flush();
    }

};

function p(msg){
    console.log(msg);
}

function Test() {
    droneControl.Init();
    droneControl.Takeoff();
    setTimeout(function () {droneControl.FlyTo(0,1,0);p("TO 0,1,0");},200);
    setTimeout(function () {droneControl.FlyTo(1,1,0);p("TO 1,1,0");},400);
    setTimeout(function () {droneControl.FlyTo(1,0,0);p("TO 1,0,0");},600);
    setTimeout(function () {droneControl.FlyTo(0,0,0);p("TO 0,0,0");},800);
    setTimeout(function () {droneControl.Terminate();p("Terminate");},1000);
}

Test();


// console.log('Recovering from emergency mode if there was one ...');
// ref.emergency = true;
// setTimeout(function () {
//     console.log('Takeoff ...');
//
//     ref.emergency = false;
//     ref.fly = true;
//
// }, 1000);
//
// setTimeout(function () {
//     console.log('Turning left .1..');
//     FlyTo(1, 1, 1);
//     tmp = true;
//     //pcmd.clockwise = 0.5;
//     pcmd.left = 0;
//     pcmd.front = 1;
//     // pcmd.up =1;
// }, 6000);
//
// var tmp = false;
//
// function FlyTo(x, y, z) {
//     pcmd.front = 1;
//     pcmd.right = 0;
//     //pcmd.up = 1;
// }
//
// function FlyBack(x, y, z) {
//     //pcmd.front = -1;
//     // pcmd.right = -1;
//     //pcmd.up = -1;
// }
//
// setTimeout(function () {
//     console.log('no turn');
//
//     //pcmd = {};
// }, 8000);
//
// setTimeout(function () {
//     console.log('Turning right ...');
//
//     //pcmd.clockwise = 0.5;
//     //pcmd.right = 0.1;
// }, 7000);
//
//
// setTimeout(function () {
//     console.log('no turn');
//     ref.fly = false;
//
// }, 14000);
//
// /*
//  setTimeout(function() {
//  console.log('Landing ...');
//
//  ref.fly = false;
//  pcmd = {};
//  }, 8000);
//  */
// var ctr = 0;
//
// setInterval(function () {
//     /*
//      if(inTime){
//      if(up){
//
//      }
//      if(right){
//
//      }
//      if(front){
//
//      }
//      updateLoc();
//      }
//      */
//     if (ctr == 18) {
//         pcmd = null;
//     }
//     if (ctr == 20) {
//
//         pcmd = {};
//         console.log("RIGHT");
//         pcmd.front = 0;
//         pcmd.left = -1;
//     }
//     if (ctr == 38) {
//         pcmd = null;
//     }
//
//     if (ctr == 40) {
//
//         pcmd = {};
//         console.log("BACK");
//         pcmd.front = -1;
//         pcmd.left = 0;
//     }
//     if (ctr == 58) {
//         pcmd = null;
//     }
//     if (ctr == 60) {
//         pcmd = {};
//         console.log("LEFT");
//         pcmd.front = 0;
//         pcmd.left = 1;
//     }
//
//     if (ctr == 80) {
//         console.log("bbbb");
//         pcmd = null;
//     }
//
//
//     control.ref(ref);
//     control.pcmd(pcmd);
//     control.flush();
//     if (tmp) ctr++;
// }, 30);