var sakai = sakai || {};

sakai.wookiechat = function(tuid, placement, showSettings){
        var rootel = $("#" + tuid);
        var me = false;
        var wookieDomain = "";	//	The domain wookie server is running on.
        var wookiePort = 8080;
       
       
        //      Get the current logged in user.
        /**
         * Set the current user
         */
        var getCurrentUser = function() {
                sdata.Ajax.request({
                        httpMethod: "GET",
                        url: "/rest/me",
                        onSuccess: function(data){
                                me = eval('(' + data + ')');
                                if (!me) {
                                        alert('An error occured when getting the current user.');
                                }
                                else {
                                	if (!showSettings) {
                                		//	Show the chat box
                                		showChatPage();
                                	}
                                }
                        },
                        onFail: function(status){
                                alert("Couldn't connect to the server.");
                        }
                });
        }

        /**
         * This will add a chat window on the page.
         */
        var showChatPage = function() {
               //	Get the chat 
               sdata.Ajax.request({
       			url :"/sdata/f/" + placement + "/" + tuid + "/discussion?sid=" + Math.random(),
       			httpMethod : "GET",
       			onSuccess : function(data) {
            	   chat = eval('(' + data + ')');
            	   
            	   //	Construct the iframe
            	   //sFrame = '<iframe style="border:0px;" border="0" width="' + chat.width + '" height="' + chat.height + '" src="' + chat.url;
            	   sFrame = '<iframe style="border:0px;" border="0" width="640" height="580" src="' + chat.url;
	       			// if we have a valid user, we can change the nickname into the users
	       			// real name.
	       			if (me) {
	       				sFrame += "&nickname=" + me.profile.firstName + '-'
	       						+ me.profile.lastName;
	       				//	avatar
	       				if (me.profile.picture) {
	       					oPicture = eval('(' + me.profile.picture + ')');
	       					sAvatar = getSakaiDomain() + getSakaiPort() + "/sdata/f/_private" + me.userStoragePrefix + oPicture.name;
		       				sFrame += "&avatar=" + sAvatar;
	       				}
	       			}
	       			sFrame += '"></iframe>';
	       	
	       			// show the chat window on the page.
	       			$("#wookiechat_mainContainer", rootel).append(sFrame);
            	   
       			},
       			onFail : function(status) {
       				alert("Unable to get the chat preferences.")
       			}
       		});
	        
        }
       
       
        if (showSettings) {
                $("#wookiechat_mainContainer", rootel).hide();
                $("#wookiechat_settings", rootel).show();
        }
        else {
                $("#wookiechat_settings", rootel).hide();
                $("#wookiechat_mainContainer", rootel).show();
        }
        getCurrentUser();
       
       
       
        /**
         * Will initiate a request to the wookie server to get a unique chat window.
         */
        var createChatRoom = function() {
               
        	 
        	 url = "";
        	 if (wookieDomain != "") {
        		 url = wookieDomain;
        	 }
        	 else {
        		 //	there was no domain specified, use same as current, just different port
        		 url = getSakaiDomain() + ":" + wookiePort;
        	 }
        	 
        	 url += "/wookie/WidgetServiceServlet";
                
        	 
        	 //	The data we want posted to the wookie servlet.
        	 //	as a uniaue shared key we will use this widget's ID.
        	 var sDataToWookie = "userid=" + me.preferences.uuid + "&shareddatakey=" + tuid + "&servicetype=chat&requestid=getwidget";                 
        	 
        	 
        	 var oPostData = {"method" : "POST", "url" : url, "post" : escape(sDataToWookie)};
                
               
               
                sdata.Ajax.request({
                        url :"/proxy/proxy",
                        httpMethod : "POST",
                        onSuccess : function(data) {
                                createChatRoomFinished(data);
                        },
                        onFail : function(status) {
                                alert("Unable to contact wookie chat server.");
                        },
                        postData : oPostData,
                        contentType : "application/x-www-form-urlencoded"
                });
           }
       
         /*
          * This will return the domain where sakai is running on.
          * ex: http://localhost:8080/dev will return http://localhost
          */
         var getSakaiDomain = function() {
        	 var loc = new String(window.location);
    		 parts = loc.split("/");
    		 var dompart = new String(parts[2]);
    		 domain = dompart.split(":");
    		 url = parts[0] + "//" + domain[0];
    		 return url;
         }
          
          var getSakaiPort = function() {
        	  var loc = new String(window.location);
     		 parts = loc.split("/");
     		 var dompart = new String(parts[2]);
     		 domain = dompart.split(":");
     		 if (domain.length > 1) {
     			 return ":" + domain[1];
     		 }
     		 return "";
          }
       
         var createChatRoomFinished = function(data) {
        	 url = $("url", data).html();
        	 width = $("width", data).html();
        	 height = $("height", data).html();
        	 maximize = $("maximize", data).html();
        	 
        	 chat = {"url" : url, "width" : width, "height" : height, "maximze" : maximize};
        	 
        	 //	sava data to widgets jcr
        	 str = sdata.JSON.stringify(chat); // Convert the posts to a JSON string
     		 sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "discussion", str, chatRoomSaved);
         }
       
         var chatRoomSaved = function() {
        	 //	notify the container that we are finished.
 			sdata.container.informFinish(tuid);
         }
       
       
        //      bind actions
        $("#wookiechat_settings_btnAddChat", rootel).bind("click", function() {
                createChatRoom();
        });

}

sdata.widgets.WidgetLoader.informOnLoad("wookiechat");