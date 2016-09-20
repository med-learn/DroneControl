const UIModule = require(__dirname + '\\js\\modules\\UIModule.js');
//const RSModule = require(__dirname + '/RSModule.js');
//const DroneModule = require(__dirname + '/DroneModule.js');
//var RSModule = RsManager;
//var DroneModule = droneControl;
var mcRef;

TWO_HANDS_MSG = "TWO HANDS - Drone control off";
NO_HANDS_MSG = "NO HANDS!";

class MainController{

    constructor(){
        //Parameters:
        this.MAX_X=1;
        this.MIN_X=0;
        this.MAX_Y=1;
        this.MIN_Y=0;
        this.isInCenter=false;
        this.GESTURE_INTERVAL = 800;
        this.TRANSITION_TIME = 1400;
        this.isHandCenteringMode = false;
        this.STATES = {GROUND:"ground",AIR:"air"};
        this.GESTURES = {TAKE_OFF:2,LAND:4,CLICK:1};
        this.currentState = this.STATES.GROUND;
        this.rsCtrl =  new RsManager();
        this.droneCtrl = droneControl;
        this.cursorElem = document.getElementById("cursorImg");
        this.lastGesture = {id:this.GESTURES.CLICK,time:(new Date()).getTime()};
        this.uiCtrl = new UIModule.UIController();
        mcRef = this;

    }

    log(msg){
        console.log(JSON.stringify(msg));
    }

    getLogger(title){
        return function(msg){mcRef.log(title+":"+JSON.stringify(msg));};
    }

    init(){
        var onSuccess = function()
        {
            mcRef.droneCtrl.Init();
            mcRef.log("--- Init Success ---- ");
            mcRef.rsCtrl.startCapture(mcRef.getLogger("Error"),mcRef.getLogger("Status"),mcRef.getLogger("Connection"));
        };

        mcRef.rsCtrl.init(onSuccess,mcRef.getLogger("Init Error"));
    }

    onKeyPress(key){
        var KEY_SPACE_CODE = 32;
        var KEY_Q = 81;
        //console.log("KCODE: "+key.keyCode);
        if(key.keyCode == KEY_SPACE_CODE) {
            if (mcRef.currentState == mcRef.STATES.GROUND) {
                mcRef.takeoffDrone();
            } else if (mcRef.currentState == mcRef.STATES.AIR) {
                mcRef.landDrone();
            }
        }
        if(key.keyCode == KEY_Q){
            mcRef.onZeroHands();
        }
    }

    onKeyDown(key)
    {
        var KEY_NORTH=38;
        var KEY_EAST=39; //RIGHT
        var KEY_WEST=37; //LEFT
        var KEY_SOUTH=40;
        var origHover = mcRef.droneCtrl.hover;
        mcRef.droneCtrl.hover=false;
        switch (key.keyCode){
            case KEY_NORTH:
                mcRef.droneCtrl.FlyTo(0.5, 1, 0.5);
                break;
            case KEY_SOUTH:
                mcRef.droneCtrl.FlyTo(0.5, 0, 0.5);
                break;
            case KEY_EAST:
                mcRef.droneCtrl.FlyTo(1, 0.5, 0.5);
                break;
            case KEY_WEST:
                mcRef.droneCtrl.FlyTo(0, 0.5, 0.5);
        }

        mcRef.droneCtrl.hover=origHover;
    }

    onPointUpdate(x,y,z) {
        if(mcRef.isHandCenteringMode)
        {
            mcRef.uiCtrl.toggleWarningAlert("Place Hand in circle",true);
            mcRef.uiCtrl.showHandImg();
            mcRef.uiCtrl.positionHand(x,y,z);
            var handX_TH=mcRef.MAX_X/6;
            var handY_TH=mcRef.MAX_Y/6;
            var centerX = mcRef.MAX_X/2;
            var centerY = mcRef.MAX_Y/2;
            mcRef.isInCenter = (Math.abs(centerX-x)<handX_TH)  && (Math.abs(centerY-y)<handY_TH);
            if( mcRef.isInCenter){
                mcRef.uiCtrl.startHandInCenterCounter(function()
                {
                    mcRef.uiCtrl.showDroneImg();
                    mcRef.isHandCenteringMode=false;
                    mcRef.uiCtrl.hideHandImg();
                    mcRef.droneCtrl.hover=false;
                });
            }else{
                mcRef.uiCtrl.stopHandInCenterCounter();
            }
        }else {
            if (mcRef.cursorElem == null) mcRef.cursorElem = document.getElementById("cursorImg");
            var eps = 0.02;
            var showWarning = (x - eps < 0 || x + eps > 1 || y - eps < 0 || y + eps > 1);

            mcRef.uiCtrl.toggleWarningAlert("warning, hand leaving field of view", showWarning);
            mcRef.uiCtrl.drawPos(x, y, z);
            mcRef.droneCtrl.FlyTo(x, y, z);
        }     
    }

    onGesture(data){
        var currentTime = (new Date()).getTime();
        if(data.label == mcRef.GESTURES.TAKE_OFF){
            //mcRef.log("TAKE OFF");
        }
        if(data.label == mcRef.GESTURES.LAND){
            //mcRef.log("LAND");
        }

        if(data.label == mcRef.GESTURES.CLICK){
            if(currentTime-mcRef.lastGesture.time < mcRef.GESTURE_INTERVAL){
                if(mcRef.currentState == mcRef.STATES.GROUND){
                    mcRef.takeoffDrone();
                }else if(mcRef.currentState == mcRef.STATES.AIR){
                    mcRef.landDrone();
                    mcRef.log("LAND");
                }

            }

            //if(currentTime-mcRef.lastGesture.time)
        }

        //mcRef.log("G: "+data.label);
        if(data.label ==  mcRef.lastGesture.id) {
            mcRef.lastGesture.time = currentTime;
        }

    }

    takeoffDrone(){

        mcRef.droneCtrl.Takeoff();
        mcRef.currentState = mcRef.STATES.AIR;
        //var isInAir = (mcRef.currentState == mcRef.STATES.AIR);
       // mcRef.uiCtrl.toggleWarningAlert("TAKE OFF",isInAir);
      //  blink("Taking Off");
        mcRef.uiCtrl.log("TAKE OFF");
    }

    landDrone(){

        mcRef.droneCtrl.Land();
        mcRef.currentState = mcRef.STATES.GROUND;
       // var isGround = (mcRef.currentState == mcRef.STATES.GROUND);
       // mcRef.uiCtrl.toggleWarningAlert("LAND",isGround);
      //  blink("Landing");
        mcRef.uiCtrl.log("LAND");
    }

    /**
     * If two hands in field of view , stop the drone
     */
    onTwoHands(){
       // $("body").addClass("redBorder");
       // console.log("TWO HANDS");
       // mcRef.uiCtrl.setBorderBlink(true);
        
        mcRef.uiCtrl.toggleErrorAlert(TWO_HANDS_MSG, true);
        mcRef.droneCtrl.hover=true;
       // mcRef.uiCtrl.log(TWO_HANDS_MSG);
      //  blink("TWO HANDS",1);
    }

    onZeroHands()
    {
        if(!mcRef.isHandCenteringMode)
        {
            mcRef.uiCtrl.toggleErrorAlert("", false);
            mcRef.isHandCenteringMode=true;
            mcRef.uiCtrl.hideDroneImg();

        }
        //console.log("NO HAND");
        //mcRef.uiCtrl.setBorderBlink(true);
        mcRef.uiCtrl.hideHandImg();
        mcRef.droneCtrl.hover=true;
        mcRef.uiCtrl.toggleErrorAlert("Hand lost, please place hand in front of camera", true);
        //mcRef.uiCtrl.log(NO_HANDS_MSG);
       // blink("NO HANDS!",1);
    }

    onAlert(data){

        if(data.label == 64 || data.label == 128 || data.label == 256 || data.label == 512){
            //console.log("A: "+data.label);
           // $("body").addClass("redBorder");
            mcRef.droneCtrl.hover=true;
           // mcRef.uiCtrl.toggleErrorAlert("OUT OF BOUNDS",true);// setBorderBlink(true);
            //blink("OUT OF BOUNDS",1);
        }else{
           // console.log("IN BOUNDS");
            //mcRef.droneCtrl.hover=false;
           // mcRef.uiCtrl.setBorderBlink(false);
            mcRef.uiCtrl.toggleErrorAlert("",false);
            //console.log("B: "+data.label);
            //$("body").removeClass("redBorder");
        }
    }

    startFlow(){
        mcRef.init();
        mcRef.rsCtrl.onPointUpdate = mcRef.onPointUpdate;
        mcRef.rsCtrl.onAlertUpdate = mcRef.onAlert;//mcRef.getLogger("Alert");
        mcRef.rsCtrl.onGesture = mcRef.onGesture;
        mcRef.rsCtrl.onZeroHands = mcRef.onZeroHands;
        mcRef.rsCtrl.onTwoHands = mcRef.onTwoHands;
        //mcRef.droneCtrl.RegisterDroneStatus(function(data){console.dir(data);});
       // setTimeout(function(){ mcRef.droneCtrl.Land();},28000);

    }

    takeoff(){
        mcRef.uiCtrl.log("taking off");
    }

}

//module.exports.mainController = MainController;

var controller;
function main() {
    controller = new MainController();
    document.body.onkeyup = controller.onKeyPress;
    document.body.onkeydown = controller.onKeyDown;
    controller.uiCtrl.hideHandImg();
    controller.startFlow();
}

$( document ).ready(function() {

    main();
    $msgPane =$("#msg");
    initGauge();
});

/// DEBUG FUNCTIONS


var $msgPane;
var inBlink=false;
function blink(msg,num){
    if(!num) num=4;
    if(inBlink) return;
    inBlink=true;
    $msgPane.text(msg);
    var blinks=num*2+1;
    var blinker = function(){
        if(blinks>0){
            $msgPane.toggle();
            blinks--;
            setTimeout(blinker,680);
        }else{
            $msgPane.hide();
            inBlink=false;
        }

    };
    setTimeout(blinker,100);

}

function initGauge(){
    var opts = {
        lines: 12, // The number of lines to draw
        angle: 0, // The length of each line
        lineWidth: 0.24, // The line thickness
        pointer: {
            length: 0.85, // The radius of the inner circle
            strokeWidth: 0.064, // The rotation offset
            color: '#000000' // Fill color
        },
        limitMax: 'false',   // If true, the pointer will not go past the end of the gauge
        colorStart: '#6FADCF',   // Colors
        colorStop: '#8FC0DA',    // just experiment with them
        strokeColor: '#E0E0E0',   // to see which ones work best for you
        generateGradient: true
    };
   // var target = document.getElementById('foo'); // your canvas element
    //var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
   // gauge.maxValue = 3000; // set max gauge value
    //gauge.animationSpeed = 38; // set animation speed (32 is default value)
    //gauge.set(550); // set actual value

}
