//const UIModule = require(__dirname + '/UIModule.js');
//const RSModule = require(__dirname + '/RSModule.js');
//const DroneModule = require(__dirname + '/DroneModule.js');
//var RSModule = RsManager;
//var DroneModule = droneControl;
var mcRef;

class MainController{

    constructor(){
        //Parameters:
        this.GESTURE_INTERVAL = 800;
        this.TRANSITION_TIME = 1400;

        this.STATES = {GROUND:"ground",AIR:"air"};
        this.GESTURES = {TAKE_OFF:2,LAND:4,CLICK:1};
        this.currentState = this.STATES.GROUND;
        this.rsCtrl =  new RsManager();
        this.droneCtrl = droneControl;
        this.cursorElem = document.getElementById("cursorImg");
        this.lastGesture = {id:this.GESTURES.CLICK,time:(new Date()).getTime()};

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

    onPointUpdate(x,y,z){
        if(mcRef.cursorElem == null) mcRef.cursorElem=document.getElementById("cursorImg");
        var cx = (1 - x) * window.innerWidth;
        var cy = y * window.innerHeight;
        mcRef.cursorElem.style.top = (cy - mcRef.cursorElem.clientHeight/2) + "px";
        mcRef.cursorElem.style.left = (cx - mcRef.cursorElem.clientHeight/2) + "px";

        mcRef.cursorElem.style.width = ((1-z)*400)+"px"; //(z*mcRef.cursorElem.style.width)+"px";
        mcRef.cursorElem.style.height = ((1-z)*400)+"px";//(z*mcRef.cursorElem.style.height)+"px";


        //p("point x:"+x);
        //mcRef.droneCtrl.FlyTo(2*(1-2*x),2*(1-2*y),1.2*(z-1));
        mcRef.droneCtrl.FlyTo(x,y,z);
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
                    mcRef.droneCtrl.Takeoff();
                    mcRef.currentState = mcRef.STATES.AIR;
                    blink("Taking Off");
                    //mcRef.log("TAKE OFF");
                }else if(mcRef.currentState == mcRef.STATES.AIR){
                    mcRef.droneCtrl.Land();
                    mcRef.currentState = mcRef.STATES.GROUND;
                    blink("Landing");
                    //mcRef.log("LAND");
                }

            }

            //if(currentTime-mcRef.lastGesture.time)
        }

        //mcRef.log("G: "+data.label);
        if(data.label ==  mcRef.lastGesture.id) {
            mcRef.lastGesture.time = currentTime;
        }

    }
    onZeroHands()
    {
        console.log("NO HAND");
        mcRef.droneCtrl.hover=true;
        blink("NO HANDS!",1);
    }

    onAlert(data){

        if(data.label == 64 || data.label == 128 || data.label == 256 || data.label == 512){
            //console.log("A: "+data.label);
            $("body").addClass("redBorder");
            mcRef.droneCtrl.hover=true;
            blink("OUT OF BOUNDS",1);
        }else{
            console.log("IN BOUNDS");
            mcRef.droneCtrl.hover=false;
            //console.log("B: "+data.label);
            $("body").removeClass("redBorder");
        }
    }

    startFlow(){
        mcRef.init();
        mcRef.rsCtrl.onPointUpdate = mcRef.onPointUpdate;
        mcRef.rsCtrl.onAlertUpdate = mcRef.onAlert;//mcRef.getLogger("Alert");
        mcRef.rsCtrl.onGesture = mcRef.onGesture;
        mcRef.rsCtrl.onZeroHands = mcRef.onZeroHands;
        //mcRef.droneCtrl.RegisterDroneStatus(function(data){console.dir(data);});
       // setTimeout(function(){ mcRef.droneCtrl.Land();},28000);

    }

    takeoff(){
        console.log("taking off");
    }

}

//module.exports.mainController = MainController;

var controller = new MainController();
function main() {
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
