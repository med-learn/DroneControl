var $DUI_D_MESSAGE;

$(document).ready(
    function(){
        $DUI_D_MESSAGE = $("#drone-message");
    }
);

var DroneUi =
{

    MESSAGE_TYPE : {SUCCESS:"good",WARNING:"warn"},

    SetMessage : function(msg,type){
        if(type==this.MESSAGE_TYPE.SUCCESS){
            $DUI_D_MESSAGE.removeClass();
            $DUI_D_MESSAGE.addClass("label label-success");
        }else if(type == this.MESSAGE_TYPE.WARNING){
            $DUI_D_MESSAGE.removeClass();
            $DUI_D_MESSAGE.addClass("label label-warning");
        }
      $DUI_D_MESSAGE.text(msg);
    }
}