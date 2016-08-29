const UIModule = require(__dirname + '\\js\\modules\\UIModule.js');
//const RSModule = require(__dirname + '/RSModule.js');
//const DroneModule = require(__dirname + '/DroneModule.js');
//var RSModule = RsManager;
//var DroneModule = droneControl;
var mcRef;

class MainController{

    constructor(){
        //Parameters:
        this.GESTURE_INTERVAL = 400;
        this.TRANSITION_TIME = 1400;

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

    onPointUpdate(x,y,z){
        var cx = (1 - x) * window.innerWidth;
        var cy = y * window.innerHeight;
        mcRef.cursorElem.style.top = (cy - mcRef.cursorElem.clientHeight/2) + "px";
        mcRef.cursorElem.style.left = (cx - mcRef.cursorElem.clientHeight/2) + "px";
        //p("point x:"+x);
        mcRef.droneCtrl.FlyTo(2*(1-2*x),2*(1-2*y),1.2*(z-1));
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
                    //mcRef.log("TAKE OFF");
                }else if(mcRef.currentState == mcRef.STATES.AIR){
                    mcRef.droneCtrl.Land();
                    mcRef.currentState = mcRef.STATES.GROUND;
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

    startFlow(){
        mcRef.init();
        mcRef.rsCtrl.onPointUpdate = mcRef.onPointUpdate;
        mcRef.rsCtrl.onAlertUpdate = mcRef.getLogger("Alert");
        mcRef.rsCtrl.onGesture = mcRef.onGesture;

        setTimeout(function(){ mcRef.droneCtrl.Land();},28000);

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
});

