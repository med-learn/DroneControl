//const UIModule = require('./js/modules/UIModule.js');
//const RSModule = require('./js/modules/RSModule.js');
//const DroneModule = require('./js/modules/DroneModule.js');

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
    }

}

module.exports.mainController = MainController;

