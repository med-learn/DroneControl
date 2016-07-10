//const UIModule = require(__dirname + '/UIModule.js');
//const RSModule = require(__dirname + '/RSModule.js');
//const DroneModule = require(__dirname + '/DroneModule.js');
//var RSModule = RsManager;
//var DroneModule = droneControl;
var mcRef;

class MainController{

    constructor(){
        this.STATES = {GROUND:"ground",AIR:"air"};
        this.CurrentState = this.STATES.GROUND;
        this.rsCtrl =  new RsManager();
        this.droneCtrl = droneControl;
        this.cursorElem = document.getElementById("cursorImg");
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

    startFlow(){
        mcRef.init();
        mcRef.rsCtrl.onPointUpdate = mcRef.onPointUpdate;
        mcRef.rsCtrl.onAlertUpdate = mcRef.getLogger("Alert");
        mcRef.rsCtrl.onGesture = mcRef.getLogger("Gesture");

        setTimeout(function(){ mcRef.droneCtrl.Land();},28000);

    }



}

//module.exports.mainController = MainController;

function main() {
    var controller = new MainController();
    controller.startFlow();
}

$( document ).ready(function() {
    main();
});

