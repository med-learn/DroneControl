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

    }

    callibrate(){

    }

    shakeOff(){

    }

    closeWindow(){

    }

    setBorderBlink(blink){
       if(blink){
           intervalId = setInterval(function(){
               $("#playground").toggleClass("out_of_bounds_border")
           }, 500);
       } else{
           clearInterval(intervalId);
           $("#playground").removeClass("out_of_bounds_border")
       }
    }

    showOutOfBoundAlert(){
        this.setBorderBlink(true);
        this.hideDroneImg();
        this.setAlertMsg(true, "Out Of Bounds!");
    }

    hideOutOfBoundAlert(){
        this.setBorderBlink(false);
        this.setAlertMsg(false);
        this.showDroneImg();
    }

    showOutOfFieldViewAlert(){
        $("#countdown").hide(); //in case timer started
        this.hideDroneImg();
        this.setAlertMsg(true, "Hand Lost!\nPlease hold your hand at the center");
        this.showHandImg();
    }

    showHandImg(){
        $("#handImg").css("display", "block");
    }

    hideHandImg(){
        $("#handImg").css("display", "none");
    }

    startHandInCenterCounter(){
        this.setAlertMsg(false);
        this.hideHandImg();
        $("#countdown").show();

        var countdown = $("#countdown").countdown360({
            radius: 160,
            seconds: 3,
            label: ['sec', 'secs'],
            fontColor: '#FFFFFF',
            autostart: false,
            onComplete: function () {
                $("#countdown").hide();
                uiRef.showDroneImg();
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

    setAlertMsg(show, msg){
        if(show){
            $('#msg-box-txt').text(msg);
            $('#msg-box').show();
        }
        else{
            $('#msg-box-txt').text("");
            $('#msg-box').hide();
        }
    }


}



module.exports.UIController = UIController;