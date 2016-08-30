var uiRef;
var intervalId;

class UIController {
    constructor(){
        this.cursorElem = document.getElementById("cursorImg");
        uiRef = this;
    }

    init(){

    }

    drawPos(x, y, z){
        if(uiRef.cursorElem == null) uiRef.cursorElem=document.getElementById("cursorImg");

        var cx = (1 - x) * window.innerWidth;
        var cy = y * window.innerHeight;
        uiRef.cursorElem.style.top = (cy - uiRef.cursorElem.clientHeight/2) + "px";
        uiRef.cursorElem.style.left = (cx - uiRef.cursorElem.clientHeight/2) + "px";

        uiRef.cursorElem.style.width = ((1-z)*400)+"px"; //(z*mcRef.cursorElem.style.width)+"px";
        uiRef.cursorElem.style.height = ((1-z)*400)+"px";//(z*mcRef.cursorElem.style.height)+"px";


        //p("point x:"+x);
        //mcRef.droneCtrl.FlyTo(2*(1-2*x),2*(1-2*y),1.2*(z-1));
        uiRef.droneCtrl.FlyTo(x,y,z);
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

    setBorder(blink){
       if(blink){
           intervalId = setInterval(function(){
               $("#playground").toggleClass("out_of_bounds_border")
           }, 500);
       } else{
           clearInterval(intervalId);
       }
    }
}



module.exports.UIController = UIController;