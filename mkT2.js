var arDrone = require('ar-drone');
var control = arDrone.createUdpControl();

var ref={};
var pcmd={};
console.log('Recovering from emergency mode if there was one ...');
ref.emergency = true;
setTimeout(function () {
    console.log('Takeoff ...');

    ref.emergency = false;
    ref.fly = true;

}, 1000);

setTimeout(function () {
    console.log('Turning left .1..');
    FlyTo(1, 1, 1);
    tmp = true;
    //pcmd.clockwise = 0.5;
    pcmd.left = 0;
    pcmd.front = 1;
    // pcmd.up =1;
}, 6000);

var tmp = false;

function FlyTo(x, y, z) {
    pcmd.front = 1;
    pcmd.right = 0;
    //pcmd.up = 1;
}

function FlyBack(x, y, z) {
    //pcmd.front = -1;
    // pcmd.right = -1;
    //pcmd.up = -1;
}

setTimeout(function () {
    console.log('no turn');

    //pcmd = {};
}, 8000);

setTimeout(function () {
    console.log('Turning right ...');

    //pcmd.clockwise = 0.5;
    //pcmd.right = 0.1;
}, 7000);


setTimeout(function () {
    console.log('no turn');
    ref.fly = false;

}, 14000);

/*
 setTimeout(function() {
 console.log('Landing ...');

 ref.fly = false;
 pcmd = {};
 }, 8000);
 */
var ctr = 0;

setInterval(function () {
    /*
     if(inTime){
     if(up){

     }
     if(right){

     }
     if(front){

     }
     updateLoc();
     }
     */
    if (ctr == 18) {
        pcmd = null;
    }
    if (ctr == 20) {

        pcmd = {};
        console.log("RIGHT");
        pcmd.front = 0;
        pcmd.left = -1;
    }
    if (ctr == 38) {
        pcmd = null;
    }

    if (ctr == 40) {

        pcmd = {};
        console.log("BACK");
        pcmd.front = -1;
        pcmd.left = 0;
    }
    if (ctr == 58) {
        pcmd = null;
    }
    if (ctr == 60) {
        pcmd = {};
        console.log("LEFT");
        pcmd.front = 0;
        pcmd.left = 1;
    }

    if (ctr == 80) {
        console.log("bbbb");
        pcmd = null;
    }


    control.ref(ref);
    control.pcmd(pcmd);
    control.flush();
    if (tmp) ctr++;
}, 30);