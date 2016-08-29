

class UIController {
    constructor(){
        console.log("hello world");
        //var dashboard = Dashboard;
        Dashboard.setStatus();
    }

    init(){

    }

    drawPos(x, y, z){
        this.cursorElem = document.getElementById("cursorImg");

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

    log(){

    }

    streamVideo(){

    }

    turnCamera(){

    }

    isConnectedToDrone(){

    }

    isCameraInit(){

    }

    setStatus(status){

    }

    setBatteryLevel(level){

    }

    callibrate(){

    }

    shakeOff(){

    }

    closeWindow(){

    }
}



module.exports.UIController = UIController;