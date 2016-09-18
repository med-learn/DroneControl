var uiRef;
var isBlinking=false;
var ALERT_WARNING = "warn";
var ALERT_ERROR = "error";
var ID_WARN_BOX = "#warnBox";
var CLASS_WARN = "warnBorder";
var CLASS_ERROR = "errorBorder";
var PLAY_GROUND_ID = "playground";
var CLASS_WARN_TEXT="warn_text";
class UIController {
    constructor(){
        this.cursorElem = document.getElementById("cursorImg");
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
        this.isTimerActive=false;
        this.handImge=null;
        this.handVisable=false;
        $("#handImg").hide();
        //hideDroneImg();
        uiRef = this;
    }


    init(){

    }

    drawPos(x, y, z){
        if(uiRef.cursorElem == null) uiRef.cursorElem=document.getElementById("cursorImg");


        var playgroundElem =  document.getElementById(PLAY_GROUND_ID);
        var cursorSize = ((1-z)*400);
        var maxDisplayWidth = Math.abs(playgroundElem.clientWidth-cursorSize);
        var maxDisplayHeight =Math.abs(playgroundElem.clientHeight-cursorSize);

        var cx = (1 - x) *maxDisplayWidth;// window.innerWidth;
        var cy = y * maxDisplayHeight;// window.innerHeight;
        uiRef.cursorElem.style.top = (cy - (uiRef.cursorElem.clientHeight-cursorSize)/2) + "px";
        uiRef.cursorElem.style.left = (cx - (uiRef.cursorElem.clientWidth-cursorSize)/2) + "px";

        uiRef.cursorElem.style.width = cursorSize+"px"; //(z*mcRef.cursorElem.style.width)+"px";
        uiRef.cursorElem.style.height = cursorSize+"px";//(z*mcRef.cursorElem.style.height)+"px";


        //p("point x:"+x);
        //mcRef.droneCtrl.FlyTo(2*(1-2*x),2*(1-2*y),1.2*(z-1));
        //uiRef.droneCtrl.FlyTo(x,y,z);
    }

    log(msg){
        var box = $('#debug-console');
        var date = new Date();
        var timestamp = date.getHours() +  ":" + date.getMinutes() + ":" + date.getSeconds();

        box.val(box.val() + "<" + timestamp + ">" + " " + msg + "\n");
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
        $("#battery-progress-bar").width(level + "%")
        $("#battery-progress-bar").html(level + "%");
    }

    callibrate(){

    }

    shakeOff(){

    }

    closeWindow(){

    }

    blinkElem($elem){
        if(!isBlinking) return;
        $elem.fadeTo("fast",1,function(){ $elem.fadeTo("slow",0,function(){uiRef.blinkElem($elem)}); });
    }

    setBorderBlink(blink){
        console.log("BLINK: "+blink);
       if(blink){

           if(isBlinking) return;
           isBlinking=true;
           uiRef.blinkElem($(ID_WARN_BOX));
            console.log("BLINk");
       } else{
           isBlinking=false;

           //clearInterval(intervalId);
           //$("#playground").removeClass("out_of_bounds_border")
           //intervalId=null;
       }
    }

    toggleErrorAlert(msg,errorOn){
        uiRef.alertMessage(msg,errorOn,ALERT_ERROR);
    }

    toggleWarningAlert(msg,errorOn){
        uiRef.alertMessage(msg,errorOn,ALERT_WARNING);
    }
    alertMessage(msg,errorOn,level) {
        var alertClass;
        if ((isBlinking && errorOn) || (errorOn !== true && errorOn !== false) ) return;
        if(errorOn !== true && errorOn !== false){
            console.log("yay");
        }
        console.log("EON: "+errorOn);
        uiRef.setBorderBlink(errorOn);

        alertClass = (level == ALERT_WARNING) ? CLASS_WARN : CLASS_ERROR;
        if (!$(ID_WARN_BOX).hasClass(alertClass))
            $(ID_WARN_BOX).removeClass();
        if (errorOn) {
            $(ID_WARN_BOX).addClass(alertClass);
            //if (level == ALERT_ERROR)
                //uiRef.hideDroneImg();
        }else {
            //uiRef.showDroneImg();
        }
        uiRef.setAlertMsg(errorOn, msg,level);
    }

    showOutOfFieldViewAlert(){
        $("#countdown").hide(); //in case timer started
        this.hideDroneImg();
        this.setAlertMsg(true, "Hand Lost!\nPlease hold your hand at the center");
        this.showHandImg();
    }

    showHandImg(){
        if(uiRef.handVisable) return;
        uiRef.handVisable=true;
        $("#handImg").show();//css("display", "block");
    }

    hideHandImg(){
        if(!uiRef.handVisable) return;
        uiRef.handVisable=false;
        $("#handImg").hide();//css("display", "none");
    }

    positionHand(x,y,z)
    {
        if(uiRef.handImge == null) uiRef.handImge=document.getElementById("handImg");

        var playgroundElem =  document.getElementById(PLAY_GROUND_ID);
        var cursorSize = ((1-z)*400);
        var maxDisplayWidth = Math.abs(playgroundElem.clientWidth-cursorSize);
        var maxDisplayHeight =Math.abs(playgroundElem.clientHeight-cursorSize);

        var cx = (1 - x) *maxDisplayWidth;// window.innerWidth;
        var cy = y * maxDisplayHeight;// window.innerHeight;
        uiRef.handImge.style.top = (cy - (uiRef.handImge.clientHeight-cursorSize)/2) + "px";
        uiRef.handImge.style.left = (cx - (uiRef.handImge.clientWidth-cursorSize)/2) + "px";

        uiRef.handImge.style.width = cursorSize+"px"; //(z*mcRef.cursorElem.style.width)+"px";
        uiRef.handImge.style.height = cursorSize+"px";//(z*mcRef.cursorElem.style.height)+"px";

    }

    stopHandInCenterCounter(){
        uiRef.isTimerActive=false;
        $("#countdown").hide();
    }
    startHandInCenterCounter(callback){
        if(uiRef.isTimerActive) return;
        uiRef.isTimerActive=true;
        //uiRef.showOutOfFieldViewAlert();
      //  this.setAlertMsg(false);
        uiRef.hideHandImg();
        $("#countdown").show();

        var countdown = $("#countdown").countdown360({
            radius: 160,
            seconds: 3,
            label: ['sec', 'secs'],
            fontColor: '#FFFFFF',
            autostart: false,
            onComplete: function () {
                $("#countdown").hide();
                uiRef.toggleErrorAlert(false,"");

                if(uiRef.isTimerActive) {
                    callback();
                }
                uiRef.isTimerActive=false;
            }
        });

        // Replace draw function so it rounds to 1/10 of a second
        countdown._draw = function () {
            var secondsElapsed = Math.round((new Date().getTime() - this.startedAt.getTime())/1000),
                tenthsElapsed = Math.round((new Date().getTime() - this.startedAt.getTime())/100)/10,
                endAngle = (Math.PI*3.5) - (((Math.PI*2)/this.settings.seconds) * tenthsElapsed);
            this._clearRect();
            this._drawCountdownShape(Math.PI*3.5, false);
            if (secondsElapsed < this.settings.seconds) {
                this._drawCountdownShape(endAngle, true);
                this._drawCountdownLabel(secondsElapsed);
            } else {
                this._drawCountdownLabel(this.settings.seconds);
                this.stop();
                this.settings.onComplete();
            }
        }

        // Proxy start function so it uses a smaller time interval
        var oldStart = countdown.start;
        countdown.start = function() {
            oldStart.call(this);
            clearInterval(this.interval);
            this.interval = setInterval(jQuery.proxy(this._draw, this), 100);
        };

        countdown.start();
    }

    restartTimer(){
        $('#countdown').click(function() {
            countdown.extendTimer(2);
        });
    }

    hideDroneImg(){
        $('#cursorImg').hide();
    }

    showDroneImg(){
        $('#cursorImg').show();
    }

    setAlertMsg(show, msg,level) {

        var ID_MSG_BOX_TEXT = '#msg-box-txt';
        var ID_MSG_BOX = '#msg-box';
        var $msgBox = $(ID_MSG_BOX);
        var playgroundElem = document.getElementById(PLAY_GROUND_ID);
        var maxDisplayWidth = Math.abs(playgroundElem.clientWidth);
        var maxDisplayHeight = Math.abs(playgroundElem.clientHeight);
        if (show) {
            if (level == ALERT_WARNING) {
                $msgBox.addClass(CLASS_WARN_TEXT);
            } else{
                $msgBox.removeClass(CLASS_WARN_TEXT);
            }
            $msgBox.css({ top: (maxDisplayHeight*(2/3))+'px' ,left:((maxDisplayWidth-$msgBox.width())/2)+"px"});
            //$msgBox.top(maxDisplayHeight/3);
            $(ID_MSG_BOX_TEXT).text(msg);
            $(ID_MSG_BOX).show();
        }
        else{
            $(ID_MSG_BOX_TEXT).text("");
            $(ID_MSG_BOX).hide();
        }
    }

    setParameters(x,y,z,w){
        if(x !== undefined){
            uiRef.x = parseInt(x);
            $('#x_var').val(uiRef.x);
        }
        else{
            uiRef.x = parseInt($('#x_var').val());
        }

        if(y !== undefined){
            uiRef.y = parseInt(y);
            $('#y_var').val(uiRef.y);
        }
        else{
            uiRef.y = parseInt($('#y_var').val());
        }

        if(z !== undefined){
            uiRef.z = parseInt(z);
            $('#z_var').val(uiRef.z);
        }
        else{
            uiRef.z = parseInt($('#z_var').val());
        }

        if(w !== undefined){
            uiRef.w = parseInt(w);
            $('#w_var').val(uiRef.w);
        }
        else{
            uiRef.w = parseInt($('#w_var').val());
        }
    }

    getX(){
        return uiRef.x;
    }

    getY(){
        return uiRef.y;
    }

    getZ(){
        return uiRef.z;
    }

    getW(){
        return uiRef.w;
    }

}



module.exports.UIController = UIController;