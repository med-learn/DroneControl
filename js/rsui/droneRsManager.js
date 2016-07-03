
var DroneRsManager =
{
    TAKE_OFF_TIME : 2400,
    RS_BOUNDS : {//x[-0.4241553,0.3186253], y[-0.2803778,0.276096],z[0.1640132,0.7862611]
                 xMin:-0.22,
                 xMax:0.118,
                 yMin:-0.1,
                 yMax:0.1,
                 zMin:0.164,
                 zMax:0.686,

                 GetPoint: function(x,y,z)
                 {
                     var res = {x:0,y:0,z:0};
                     if(x>0) res.x = -(x/this.xMax);
                     else res.x = (x/this.xMin) ;
                     if(y>0) res.y = (y/this.yMax);
                     else res.y = -(y/this.yMin) ;
                     if(z>0) res.z = (z/this.zMax);
                     else res.z = -(z/this.zMin) ;
                     return res;
                 }

                },
    
    States: {NONE:"none",INIT:"init",INIT_LEVEL:"initLvl",INIT_CENTER: "initCenter",PRE_LAUNCH:"pre",TAKE_OFF:"toff",IN_FLIGHT:"launch",LANDING:"Landing"},

    currentState: "pre",

    CenterCheck : function(mainJoint){
        var DELTA = 20;
        return (math.abs(mainJoint.y) < 20 && math.abs(mainJoint.x < 20));
    },
    
    LevelCheck : function(mainJoint){
        var B_RANGE = 660;
        var T_RANGE = 800;
        var isBottomGood = (mainJoint.z > B_RANGE);
        if(!isBottomGood)
            DroneUi.SetMessage("Please Distance hand from camera",DroneUi.MESSAGE_TYPE.WARNING);
        var isTopGood = (mainJoint.z < T_RANGE);
        if(!isTopGood)
            DroneUi.SetMessage("Please place hand closer to camera",DroneUi.MESSAGE_TYPE.WARNING);
        return ( isBottomGood && isTopGood);
    },
    
    PreTakeOff: function(gestures){
        //console.log(gestures);
        for (var i = 0; i < gestures.length; i++) {

            if(gestures[i].name == "fist"){
                droneControl.Init();
                 DroneUi.SetMessage("Initiating Drone TakeOff",DroneUi.MESSAGE_TYPE.SUCCESS); 
                return true;
            }
        };
    },

    FlightControl: function(p,gestures){
         for (var i = 0; i < gestures.length; i++) {
             if(gestures[i].name == "fist"){
                DroneUi.SetMessage("Landing Drone",DroneUi.MESSAGE_TYPE.SUCCESS);
                DroneRsManager.currentState= DroneRsManager.States.LANDING;
                droneControl.Terminate();
                setTimeout(function()
                {
                    DroneRsManager.currentState= DroneRsManager.States.PRE_LAUNCH;
                     DroneUi.SetMessage("Drone Landed",DroneUi.MESSAGE_TYPE.SUCCESS);
                },DroneRsManager.TAKE_OFF_TIME);
             }
         }
         droneControl.FlyTo(p.x,p.y,p.z);
    },



    onData :function (data,gestures) {

        var mainJoint = DroneRsManager.RS_BOUNDS.GetPoint( data[1].positionWorld.x,data[1].positionWorld.y,data[1].positionWorld.z);
       //console.log(mainJoint);
       //console.log("A: "+mainJoint.x+","+mainJoint.y+","+mainJoint.z);
        if(DroneRsManager.currentState == DroneRsManager.States.INIT_LEVEL)
        {
            if(this.LevelCheck(mainJoint)){
                DroneUi.SetMessage("Great work ! hand located at optimal level",DroneUi.MESSAGE_TYPE.SUCCESS);
                DroneRsManager.currentState = DroneRsManager.States.INIT_CENTER;
            }
        }
    
        if(DroneRsManager.currentState == DroneRsManager.States.INIT_CENTER)
        {
            if(this.LevelCheck(mainJoint)){
                DroneUi.SetMessage("Great work ! hand located at Center",DroneUi.MESSAGE_TYPE.SUCCESS);
                DroneRsManager.currentState = DroneRsManager.States.PRE_LAUNCH;
            }
        }
       

        if(DroneRsManager.currentState == DroneRsManager.States.PRE_LAUNCH)
        {
            if(this.PreTakeOff(gestures))
                DroneRsManager.currentState = DroneRsManager.States.TAKE_OFF;
            
        }
        if(DroneRsManager.currentState == DroneRsManager.States.TAKE_OFF){
             setTimeout(function()
                {
                    DroneRsManager.currentState= DroneRsManager.States.IN_FLIGHT
                     DroneUi.SetMessage("Drone In Air, Commence navigation",DroneUi.MESSAGE_TYPE.SUCCESS);
                },DroneRsManager.TAKE_OFF_TIME);
        }

        if(DroneRsManager.currentState == DroneRsManager.States.IN_FLIGHT)
        {

            //DroneUi.SetMessage(mainJoint,DroneUi.MESSAGE_TYPE.SUCCESS);
            this.FlightControl(mainJoint,gestures);
        }
    }
    
}
