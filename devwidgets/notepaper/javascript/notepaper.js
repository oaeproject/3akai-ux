/**
 * notepaper模块
 */
var sakai = sakai || {};

sakai.notepaper = function(tuid, showSettinds) {
    var notepaper = "#notepaper";
    var notepaperTemplate = notepaper + "_template";
    var notepaperArea = notepaper + "_area";
    var orignHeight = $(notepaper).height();
    var extraSpace = 16;
    
    var loadData = function() {
        $.ajax({
            url:"/system/notepaper",
            type: "GET",
            success: function(data) {
                var json = jQuery.parseJSON(data);
                $(notepaperArea).val(json.message);
                if(json.message){
                    $("#time").html(json.modifyTime);
                }else{
                    $("#timeDIV").hide();
                }
                $(notepaperArea).scrollTop(1000);
                $(notepaperArea).height($(notepaperArea).height() + $(notepaperArea).scrollTop());
            },
            error: function() {
                alert("error");
            },
        });
    };
    
    var saveData = function(message) {
        $.ajax({
            url:"/system/notepaper",
            type: "POST",
            data: {
                "message": message
            },
            success: function(data) {
                var json = jQuery.parseJSON(data);
                // $("#time").html(json.modifyTime);
                $("#time").html(getCurrentTime());
                $("#timeDIV").show();
            },
            error: function() {
                alert("Error:can not save your message :" + message);
            },
        });
    };
    
    var getCurrentTime = function(){
        var now = new Date();
        var month = ( (now.getMonth()+1) < 10 ) ? ( "0" + (now.getMonth()+1) ) : (now.getMonth()+1);
        var date = ( now.getDate() < 10 ) ? ( "0" + now.getDate() ) : now.getDate();
        var hour = ( now.getHours() < 10 ) ? ( "0" + now.getHours() ) : now.getHours();
        var minute = ( now.getMinutes() < 10 ) ? ( "0" + now.getMinutes() ) : now.getMinutes();
        var second = ( now.getSeconds() < 10 ) ? ( "0" + now.getSeconds() ) : now.getSeconds();
        var toString = now.getFullYear() + "-" + month + "-" + date + " " + 
                        hour + ":" + minute + ":" + second;
        return toString;
    }
    
    var resize = function(){
        $(notepaperArea).height(orignHeight);
        $(notepaperArea).scrollTop(1000);
        $(notepaperArea).height($(notepaperArea).height() + $(notepaperArea).scrollTop() + extraSpace);
    }
    
    var init = function() {
        loadData();
        
        $(notepaperArea).live("keyup", resize);
        
        $(notepaperArea).live("focus", function() {
            $(this).css({"background-color":"#454a4f","color":"white","border":"1px solid #d5d5d5"});
        });
         
        $(notepaperArea).live("blur", function() {
            $(this).css({"background-color":"#F0F0F0","color":"black","border":"0px"});
        });
        
        $(notepaperArea).live("change", function() {
            saveData($(this).val());
        });
    };
    
    init();
    
};

sakai.api.Widgets.widgetLoader.informOnLoad("notepaper");