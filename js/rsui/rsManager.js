
var RsManager = 
{
    sense : null,

    cursorModule : {},

    /**
    *  Inits realsense module, 
    *  @param onSuccess : callback that is called once init is complets
    *  @param onError : callback that is called upon error  
    */
    init : function(onSuccess,onError){
         var errorMsg="none";
         intel.realsense.SenseManager.detectPlatform(['handcursor'], ['f250']).then(function (info) {
            if(info.nextStep == 'ready') {
                $(window).bind("beforeunload", function (e) {
                if (RsManager.sense != null) {
                    RsManager.sense.release().then(function (result) {
                        RsManager.sense = undefined;
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
    },


    /**
    *  starts the realsense capture, 
    *  @param errorHandler : handler to take careof any errors .
    *  @param statusHandler : handler for any status updates  .
    *  @param statusHandler : handler for connection info.   
    */
    startCapture : function(errorHandler,statusHandler,onConnectedHandler){
            var rs = intel.realsense;
         // Create a SenseManager instance
            rs.SenseManager.createInstance().then(function (result) {
                RsManager.sense = result;
                return rs.cursor.HandCursorModule.activate(sense);
            }).then(function (result) {
                RsManager.cursorModule = result;
                
                // Set the on connect handler
                 RsManager.sense.onDeviceConnected = onConnectedHandler;

                // Set the status handler
                 RsManager.sense.onStatusChanged = statusHandler;

                // Set the data handler
                 RsManager.cursorModule.onFrameProcessed = RsManager.cursorHandler;

                // SenseManager Initialization
                return RsManager.sense.init();
            }).then(function (result) {
                return RsManager.cursorModule.createActiveConfiguration();
            }).then(function (result) {
                RsManager.handConfig = result;

                // Enable all alerts
                RsManager.handConfig.allAlerts = true;

                // Enable all gestures
                RsManager.handConfig.allGestures = true;

                // Apply Hand Configuration changes
                return handConfig.applyChanges();
            }).then(function (result) {
                return handConfig.release();
            }).then(function (result) {
                // Query image size 
                imageSize = sense.captureManager.queryImageSize(rs.StreamType.STREAM_TYPE_DEPTH);

                // Start Streaming
                return sense.streamFrames();
            }).then(function (result) {
            }).catch(function (error) {
               errorHandler(error);
            });
    },


    /**
    *  PRIVATE: Inner handler for rs cursor data calls 
    *  (calls public handlers: onPointUpadate,onGesture,onAlertUpdate) 
    **/
    cursorDataHandler : function(sender, data){

            if (data.numberOfCursors == 0) return;

            var allData = data.queryCursorData(rs.hand.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);

            if(data.numberOfCursors>0){
                var iCursor = allData[0];
                RsManager.onPointUpadate(iCursor.adaptivePoint.x,iCursor.adaptivePoint.y,iCursor.adaptivePoint.z);
            }

            // retrieve the fired alerts
             for (a = 0; a < data.firedAlertData.length; a++) {
                RsManager.onAlertUpdate(data.firedAlertData[a]);
            }

            // retrieve the fired gestures
            for (g = 0; g < data.firedGestureData.length; g++) {
                 RsManager.onGesture(data.firedGestureData[g]);
                 //data.firedGestureData[g].label // rs.cursor.GestureType.CURSOR_CLICK
            }
          
    },

    /**
    *  Handlers : register here for updates
    */
    onPointUpadate: function(x,y,z){
        //place holder 
    },

    onAlertUpdate: function(alert){
        //place holder 
    },

    onGesture: function(gesture){
        //place holder 
    },

    /**
    * Stop the sampling.
    */
    terminate: function(){
        RsManager.sense.release().then(function (result) {       
                RsManager.sense = null;
        });
    }

}
