// Visiblity API startup
// This block is to handle different browser implementations of the VisibilityAPI
var hiddenObj, visChangeEvent;
if (typeof document.hidden !== "undefined") {
    hiddenObj = "hidden";
    visChangeEvent = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
    hiddenObj = "msHidden";
    visChangeEvent = "msvisibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
    hiddenObj = "mozHidden";
    visChangeEvent = "mozvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
    hiddenObj = "webkitHidden";
    visChangeEvent = "webkitvisibilitychange";
}


function Start() {
    //$("div").hide();
    $(".init-noshow").hide();
    
    $("#check").show(500, function () {
        // check platform compatibility
        intel.realsense.SenseManager.detectPlatform(['handcursor'], ['f250']).then(function (info) {
            document.getElementById("Start").disabled = true;
            if (info.nextStep == 'ready') {
                $("#check").hide(200, function () {
                    $("#checkok").show(200, function () {
                        setTimeout(function(){ 
                            $(".init-alert").hide(400, function () {
                                $(".init-noshow").show();
                                main_logic();
                            });

                         }, 1000);
                        

                    });
                });
                document.getElementById("Start").disabled = false;
            }
            else {
                $('#fail').append("some error");

            }

        }).catch(function (error) {
            $('#fail').append("CheckPlatform failed " + JSON.stringify(error));
            $('#fail').show();
        });
    });
}

function main_logic() {
    var cursorElem = document.getElementById("cursorImg");
    // Close when page goes away
    var sense;
    $(window).bind("beforeunload", function (e) {
        if (sense != undefined) {
            sense.release().then(function (result) {
                sense = undefined;
            });
        }
    })

    $(document).ready(function () {

        var rs = intel.realsense; // name space short-cut
        //var handModule; // hand module instance
          var cursorModule; 
        var handConfig; // hand module configuration instance

        var imageSize; //image stream size
        var scaleFactor = 1900;// scaleFactor for the sample renderer
        var nodestorender; // data structure to hold sphere objects to render

        // Pause the module when the page goes out of view
        $(document).bind(visChangeEvent, function () {
            if (sense !== undefined && handModule !== undefined) {
                if (document[hiddenObj]) {
                    handModule.pause(true);
                }
                else {
                    handModule.pause(false);
                }
            }
        });

        $('#Start').click(function () {
            document.getElementById("Start").disabled = true;

            // Create a SenseManager instance
            rs.SenseManager.createInstance().then(function (result) {
                sense = result;
                return rs.cursor.HandCursorModule.activate(sense);
            }).then(function (result) {
                cursorModule = result;
                status('Init started');

                // Set the on connect handler
                sense.onDeviceConnected = onConnect;

                // Set the status handler
                sense.onStatusChanged = onStatus;

                // Set the data handler
                cursorModule.onFrameProcessed = onCursorData;

                // SenseManager Initialization
                return sense.init();
            }).then(function (result) {

                // Configure Hand Tracking
                return cursorModule.createActiveConfiguration();
            }).then(function (result) {
                handConfig = result;

                // Enable all alerts
                handConfig.allAlerts = true;

                // Enable all gestures
                handConfig.allGestures = true;

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
                //$('#cursorImg').toggle();
                status('Streaming ' + imageSize.width + 'x' + imageSize.height);
                document.getElementById("Stop").disabled = false;

            }).catch(function (error) {
                // handle pipeline initialization errors
                status('Init failed: ' + JSON.stringify(error));
                document.getElementById("Start").disabled = false;
            });
        });


        var lowX=0;
        var highX=0;
        var lowY=0;
        var highY=0;
        var lowZ=0;
        var highZ=0;
        var first=true;
        function foo(x,y,z){
            if(first){
                lowX=x;highX=x;
                lowY=y;highY=y;
                lowZ=z;highZ=z;
                first=false;
            }
            if(x>highX) highX=x;
            if(y>highY) highY=y;
            if(z>highZ) highZ=z;
            if(x<lowX) lowX=x;
            if(y<lowY) lowY=y;
            if(z<lowZ) lowZ=z;
             DroneUi.SetMessage("x["+lowX+","+highX+"], y["+lowY+","+highY+"],z["+lowZ+","+highZ+"]",DroneUi.MESSAGE_TYPE.SUCCESS);
              
        }

 // Process cursors data when ready
        function onCursorData (sender, data){

            // if no cursors found
            if (data.numberOfCursors == 0) return;

            // retrieve cursor data 
            var allData = data.queryCursorData(rs.hand.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);

            // Point to use for the cursor
            var x = 0;
            var y = 0;
            // for every cursor in current frame
            for (h = 0; h < data.numberOfCursors; h++) {
                var iCursor = allData[h]; //retrieve hand data
            
                // Because the points are given in reference to the camera's
                // point of view, we must reverse the point to draw the cursor
                // according to the user's point of view.
                var x = (1 - iCursor.adaptivePoint.x) * window.innerWidth;
                var y = iCursor.adaptivePoint.y * window.innerHeight;
                
                // Move the cursor image by its center
                cursorElem.style.top = y - cursorElem.clientHeight/2 + "px";
                cursorElem.style.left = x - cursorElem.clientHeight/2 + "px";
                //DroneUi.SetMessage("x:"+iCursor.adaptivePoint.x+", y: "+iCursor.adaptivePoint.y+", z:"+iCursor.adaptivePoint.z,DroneUi.MESSAGE_TYPE.SUCCESS);              
                DroneRsManager.onData({x:iCursor.adaptivePoint.x,y:iCursor.adaptivePoint.y,z:iCursor.adaptivePoint.z},data.firedGestureData);
            }

            // retrieve the fired alerts
             for (a = 0; a < data.firedAlertData.length; a++) {
                $('#alerts_status').text('Alert: ' + JSON.stringify(data.firedAlertData[a]));
            }

            // retrieve the fired gestures
            for (g = 0; g < data.firedGestureData.length; g++) {
                $('#gestures_status').text('Gesture: ' + JSON.stringify(data.firedGestureData[g]));
                var _label = data.firedGestureData[g].label;
                if (_label == rs.cursor.GestureType.CURSOR_CLICK) {
                    var myButton = document.getElementById("clickButton");
                    var rect = myButton.getBoundingClientRect();
                    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                        myButton.click();
                    }
                }
            }
        }


        // Process hand data when ready
        function onHandData(sender, data) {

            // if no hands found
            if (data.numberOfHands == 0) return;

            // retrieve hand data 
            var allData = data.queryHandData(rs.hand.AccessOrderType.ACCESS_ORDER_NEAR_TO_FAR);

            if(data.numberOfHands>0){
                var ihand = allData[0]; //retrieve hand data
                var joints = ihand.trackedJoints; //retrieve all the joints
                if (joints[1] == null || joints[1].confidence <= 0){


                }else{
                //foo(joints[1].positionWorld.x,joints[1].positionWorld.y,joints[1].positionWorld.z);
                //x[-0.4241553,0.3186253], y[-0.2803778,0.276096],z[0.1640132,0.7862611]
                }
            }

            // for every hand in current frame
            for (h = 0; h < data.numberOfHands; h++) {
                var ihand = allData[h]; //retrieve hand data
                var joints = ihand.trackedJoints; //retrieve all the joints
                 // for every joint
                for (j = 0; j < joints.length; j++) {

                    // if a joint is not valid
                    if (joints[j] == null || joints[j].confidence <= 0) continue;

                    // update sample renderer joint position
                    nodestorender[h][j].position.set(joints[j].positionWorld.x * scaleFactor, joints[j].positionWorld.y * scaleFactor, joints[j].positionWorld.z * scaleFactor);
                    
                }
                if (joints.length>1 && joints[1] != null && joints[1].confidence > 0)
                    DroneRsManager.onData(joints,data.firedGestureData);
            }

            // retrieve the fired alerts
            for (a = 0; a < data.firedAlertData.length; a++) {
                $('#alerts_status').text('Alert: ' + JSON.stringify(data.firedAlertData[a]));
                var _label = data.firedAlertData[a].label;

                // notify the sample renderer the tracking alerts
                if (_label == rs.hand.AlertType.ALERT_HAND_NOT_DETECTED || _label == rs.hand.AlertType.ALERT_HAND_NOT_TRACKED || _label == rs.hand.AlertType.ALERT_HAND_OUT_OF_BORDERS) {
                    clearHandsPosition();
                }
            }

            // retrieve the fired gestures
            if(data.firedGestureData.length>0)
                $('#gestures_status').text('Gesture: ' + JSON.stringify(data.firedGestureData));
            //for (g = 0; g < data.firedGestureData.length; g++) {

                //$('#gestures_status').text('Gesture: ' + JSON.stringify(data.firedGestureData[g]));
            //}
        }

        // stop streaming
        $('#Stop').click(function () {
            document.getElementById("Stop").disabled = true;
            sense.release().then(function (result) {
                status('Stopped');
                sense = undefined;
                clear();
            });
        });

        // On connected to device info
        function onConnect(sender, connected) {
            if (connected == true) {
                $('#alerts_status').append('Connect with device instance: ' + sender.instance + '<br>');
            }
        }

        // Error status
        function onStatus(sender, sts) {
            if (sts < 0) {
                status('Module error with status code: ' + sts);
                clear();
            }
        }

        // Status msg
        function status(msg) {
            $('#status').text(msg);
        };

        // clear alerts & gestures
        function clear() {
            clearHandsPosition();
            $('#alerts_status').text('');
            $('#gestures_status').text('');
            document.getElementById("Start").disabled = false;
        };

    });

};


$(document).ready(Start);

