
const TWO_HANDS = 2;
const ONE_HAND = 1;
class RsManager //TODO: turn to class
{

    constructor() {
        this.sense = null;
        this.cursorModule = {};
        this.handConfig = {};
        this.imageSize = null;
        this._onPointUpadate = function (x, y, z) {};
        this._onAlertUpdate = function (alert) {};
        this._onGesture = function (gesture) {};
        this._onZeroHands = function () {};
        this._onTwoHands = function () {};
        RsManager.ref=this;

    }

    /**
     *  Inits realsense module,
     *  @param {function(string):void} onSuccess : callback that is called once init is complets
     *  @param {function(string):void} onError : callback that is called upon error
     */
    init(onSuccess,onError){
        console.log("[Init Realsense module] ");
        var errorMsg="none";
        intel.realsense.SenseManager.detectPlatform(['handcursor'], ['f250']).then(function (info) {
            console.log("Next Step: "+info.nextStep);
            if(info.nextStep == 'ready') {
                $(window).bind("beforeunload", function (e) {
                    console.log("====[ Unbind ]=====")
                    if (RsManager.ref.sense != null) {
                        RsManager.ref.sense.release().then(function (result) {
                            RsManager.ref.sense = undefined;
                        });
                    }
                });
                onSuccess();
                return;
            }
            errorMsg = info.nextStep;
        }).catch(function (error) {
            errorMsg=error;
        });
        onError(errorMsg);
    }


    /**
     *  starts the realsense capture,
     *  @param errorHandler : handler to take careof any errors .
     *  @param statusHandler : handler for any status updates  .
     *  @param statusHandler : handler for connection info.
     */
    startCapture(errorHandler,statusHandler,onConnectedHandler){
        console.log("startCapture");
        var rs = intel.realsense;
        // Create a SenseManager instance
        rs.SenseManager.createInstance().then(function (result) {
            //console.log("this.sense: "+this.sense);
            console.log("createInstance() "+result);
            RsManager.ref.sense = result;
            return rs.cursor.HandCursorModule.activate(RsManager.ref.sense);
        }).then(function (result) {
            console.log("Handler set");
            RsManager.ref.cursorModule = result;

            // Set the on connect handler
            RsManager.ref.sense.onDeviceConnected = onConnectedHandler;

            // Set the status handler
            RsManager.ref.sense.onStatusChanged = statusHandler;

            // Set the data handler
            RsManager.ref.cursorModule.onFrameProcessed = RsManager.ref.cursorDataHandler;

            // SenseManager Initialization
            return RsManager.ref.sense.init();
        }).then(function (result) {
            console.log("createActiveConfiguration");
            return RsManager.ref.cursorModule.createActiveConfiguration();
        }).then(function (result) {
            console.log("enable alrets and gestures");
            RsManager.ref.handConfig = result;

            // Enable all alerts
            RsManager.ref.handConfig.allAlerts = true;

            // Enable all gestures
            RsManager.ref.handConfig.allGestures = true;

            // Apply Hand Configuration changes
            return RsManager.ref.handConfig.applyChanges();
        }).then(function (result) {
            return RsManager.ref.handConfig.release();
        }).then(function (result) {
            // Query image size
            RsManager.ref.mageSize = RsManager.ref.sense.captureManager.queryImageSize(rs.StreamType.STREAM_TYPE_DEPTH);

            // Start Streaming
            return RsManager.ref.sense.streamFrames();
        }).then(function (result) {
        }).catch(function (error) {
            errorHandler(error);
        });
    }


    /**
     *  PRIVATE: Inner handler for rs cursor data calls
     *  (calls public handlers: onPointUpdate,onGesture,onAlertUpdate)
     **/
    cursorDataHandler(sender, data){
        if ( data.numberOfCursors == 0)
        {
            RsManager.ref._onZeroHands();
            return;
        }
        if(data.numberOfCursors == TWO_HANDS)
        {
            RsManager.ref._onTwoHands();
            return;
        }

        var allData = data.queryCursorData(intel.realsense.hand.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);


        var iCursor = allData[0];

        RsManager.ref._onPointUpadate(iCursor.adaptivePoint.x,iCursor.adaptivePoint.y,iCursor.worldPoint.z);


        // retrieve the fired gestures
        for (let g = 0; g < data.firedGestureData.length; g++) {
            //console.log("GGGGGG"+JSON.stringify(data.firedGestureData[g]));
            RsManager.ref._onGesture(data.firedGestureData[g]);
            //data.firedGestureData[g].label // rs.cursor.GestureType.CURSOR_CLICK
        }

        // retrieve the fired alerts
        if(data.firedAlertData) {
            for (let a = 0; a < data.firedAlertData.length; a++) {
                RsManager.ref._onAlertUpdate(data.firedAlertData[a]);
            }
        }


    }

    /**
     *  Handlers : register here for updates
     */
    set onPointUpdate  (handler)  { RsManager.ref._onPointUpadate = handler; }
    set onAlertUpdate (handler) {RsManager.ref._onAlertUpdate=handler;}
    set onZeroHands (handler) {RsManager.ref._onZeroHands=handler;}
    set onTwoHands (handler) {RsManager.ref._onTwoHands=handler;}
    set onGesture (handler) {RsManager.ref._onGesture=handler;}


    /**
     * Stop the sampling.
     */
    terminate(){
        if(RsManager.ref.sense){
            RsManager.ref.sense.release().then(function (result) {
                RsManager.ref.sense = null;
            });
        }
    }

}

//////////////////// TEST CODE //////////////////
function testRsManager(logger){
    var rMan = new RsManager();
    if(!logger)
        logger = function(msg) {console.log(msg);};
    var pLog = function(title){return function(msg){logger(title+":"+msg);};};
    var onSuccess = function()
    {
        logger("--- Init Success ---- ");
        rMan.startCapture(pLog("Error"),pLog("Status"),pLog("Connection"));
    };

    logger("===== Testing RS Manager =======");
    rMan.init(onSuccess,pLog("Init Error"));
    rMan.onPointUpdate = function(x, y, z) {logger("POINT: [X:"+x+"\tY:"+y+"\tZ:"+z+"]");};
    rMan.onAlertUpdate = pLog("Alert");
    rMan.onGesture = pLog("Gesture");
}
//////////////////////////////////////////////////


if(typeof(module) != 'undefined') module.exports.rsCtrl = RsManager;