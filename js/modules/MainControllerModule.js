//const UIModule = require(__dirname + '/UIModule.js');
//const RSModule = require(__dirname + '/RSModule.js');
//const DroneModule = require(__dirname + '/DroneModule.js');
var RSModule = RsManager;
var DroneModule = droneControl;


class MainController{
    constructor(){
        //this.uiCtrl = new UIModule.uiCtrl();
        //this.rsCtrl = new RSModule.rsCtrl();
        //this.droneCtrl = new DroneModule.droneCtrl();
    }

    init(){

    }

    startFlow(){

        console.log("Flow Started!");
        var rMan = new RSModule();
        var p = function(msg) {console.log(msg);};
        var pLog = function(title){return function(msg){p(title+":"+msg);};};
        var onSuccess = function()
        {
            DroneModule.Init();
            p("--- Init Success ---- ");
            rMan.startCapture(pLog("Error"),pLog("Status"),pLog("Connection"));
        };

        p("===== Testing RS Manager =======");
        rMan.init(onSuccess,pLog("Init Error"));
        rMan.onPointUpdate = function(x, y, z)
        {
            p("point x:"+x);
            DroneModule.FlyTo(2*(1-2*x),2*(1-2*y),1.2*(z-1));
        };
        rMan.onAlertUpdate = pLog("Alert");
        rMan.onGesture = pLog("Gesture");
    }



}

//module.exports.mainController = MainController;

function main() {
    var controller = new MainController();
    controller.startFlow();
}

main();
