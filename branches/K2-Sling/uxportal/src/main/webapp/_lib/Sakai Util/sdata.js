/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */


/*global $, jQuery, Config */


/*
 * Namespace that will be used for all of the utility functions related
 * to the mechanism of loading widgets into the document
 */
var sdata = {};
/*
 * Namespace that will be used for all of the widgets that are being loaded
 * into the document. Every widget will have an object called sakai.widgetid
 */
var sakai = {};


///////////////////////////
// jQuery AJAX extention //
///////////////////////////

/*
 * We override the standard jQuery.ajax error function, which is being executed when
 * a request fails. We will check whether the request has failed due to an authorization
 * required error, by checking the response code and then doing a request to the me service
 * to find out whether we are no longer logged in. If we are no longer logged in, and the
 * sendToLoginOnFail variable has been set in the options of the request, we will redirect
 * to the login page with the current URL encoded in the url. This will cause the system to
 * redirect to the page we used to be on once logged in.
 */
(function($){
	
	$.handleError = function (s, xhr, status, e) {
		
		var requestStatus = xhr.status;
		// if the sendToLoginOnFail hasn't been set, we assume that we want to redirect
		s.sendToLoginOnFail = s.sendToLoginOnFail || true;
		if ((requestStatus === 401 || requestStatus === 403) && s.sendToLoginOnFail){
			
			var decideLoggedIn = function(response, exists){
				var originalURL = document.location;
				originalURL = sdata.util.URL.encode(originalURL.pathname + originalURL.search + originalURL.hash);
				var redirecturl = Config.URL.GATEWAY_URL + "?url=" + originalURL;
				if (exists) {
					var me = $.evalJSON(response);
					if (me.preferences && (me.preferences.uuid === "anonymous" || !me.preferences.uuid)) {
						document.location = redirecturl;
					}
				}	
			};
			
			$.ajax({
				url : Config.URL.ME_SERVICE,
				cache : false,
				success : function(data) {
					decideLoggedIn(data,true);
				}
			});
			
		}
					
	    if (s.error) {
	        s.error(xhr, status, e);
	    }
	    if (s.global) {
	        jQuery.event.trigger("ajaxError", [xhr, s, e]);
	    }
		
	};
	
})(jQuery);


///////////////////////////////
// Form serialization plugin //
///////////////////////////////

(function($){
	
	$.FormBinder = {};
	
	$.FormBinder.serialize = function(form){
		
		var ret = {};
	
		// Input fields
		var fields = $("input", form);
	
		// Text fields
		for (var i = 0; i < fields.length; i++){
			var el = fields[i];
			if (el.name) {
				if (el.type.toLowerCase() === "text" || el.type.toLowerCase() === "password") {
					ret[el.name] = el.value;
				}
			}
		}
	
		// Checkboxes
		var chkboxesnames = [];
		for (var i = 0; i < fields.length; i++){
			var el = fields[i];
			if (el.name) {
				if (el.type.toLowerCase() == "checkbox") {
					var name = el.name;
					var exists = false;
					for (var ii = 0; ii < chkboxesnames.length; ii++) {
						if (name == chkboxesnames[ii]) {
							exists = true;
						}
					}
					if (exists == false) {
						chkboxesnames[chkboxesnames.length] = name
					}
				}
			}
		}
		for (var ii = 0; ii < chkboxesnames.length; ii++){
			var name = chkboxesnames[ii];
			var checkdones = [];
			for (var i = 0; i < fields.length; i++){
				var el = fields[i];
				if (el.type.toLowerCase() == "checkbox"){
					if (el.name == name && el.checked){
						checkdones[checkdones.length] = el.value;
					}
				}
			}
			ret[name] = checkdones;
		}
	
		// Radio buttons
		var radionames = [];
		for (var i = 0; i < fields.length; i++){
			var el = fields[i];
			if (el.name) {
				if (el.type.toLowerCase() == "radio") {
					var name = el.name;
					var exists = false;
					for (var ii = 0; ii < radionames.length; ii++) {
						if (name == radionames[ii]) {
							exists = true;
						}
					}
					if (exists == false) {
						radionames[radionames.length] = name
					}
				}
			}
		}
		for (var ii = 0; ii < radionames.length; ii++){
			var name = radionames[ii];
			var selected = null;
			for (var i = 0; i < fields.length; i++){
				var el = fields[i];
				if (el.type.toLowerCase() == "radio"){
					if (el.name == name && el.checked){
						selected = el.value;
					}
				}
			}
			ret[name] = selected;
		}
	
		// Select box
		fields = $("select", form);
		for (var i = 0; i < fields.length; i++){
			var el = fields[i];
			if (el.name) {
				var name = el.name;
				var selected = [];
				for (var ii = 0; ii < el.options.length; ii++) {
					if (el.options[ii].selected) {
						selected[selected.length] = el.options[ii].value;
					}
				}
				ret[name] = selected;
			}
		}
	
		// Textarea
		fields = $("textarea", form);
		for (var i = 0; i < fields.length; i++){
			if (el.name) {
				var el = fields[i];
				ret[el.name] = el.value;
			}
		}
	
		return ret;
	}
	
	$.FormBinder.deserialize = function(form, json){
		//i will be the name of the field
		var fields1 = $("input", form);
		for (var ii = 0; ii < fields1.length; ii++){
			var el = fields1[ii];
			if (el.type.toLowerCase() == "checkbox" || el.type.toLowerCase() == "radio"){
				el.checked = false;
			}
		}
		var fields2 = $("select", form);
		for (var ii = 0; ii < fields2.length; ii++){
			var el = fields2[ii];
			for (var iii = 0; iii < el.options.length; iii++){
				el.options[iii].selected = false;
			}
		}
		var fields3 = $("textarea", form);
		for (var i in json){
			for (var ii = 0; ii < fields1.length; ii++){
				var el = fields1[ii];
				if (el.name == i){
					//Text field
					if (el.type.toLowerCase() === "text" || el.type.toLowerCase() === "password"){
						el.value = json[i];
					}			
	
					//Checkbox
					if (el.type.toLowerCase() == "checkbox"){
						for (var iii = 0; iii < json[i].length; iii++){
							if (el.value == json[i][iii]){
								el.checked = true;
							}
						}
					}
	
					//Radio button
					if (el.type.toLowerCase() == "radio"){
						if (el.value == json[i]){
							el.checked = true;
						}
					}
				}
			}
	
			//Select
			for (var ii = 0; ii < fields2.length; ii++){
				var el = fields2[ii];
				if (el.name == i){
					for (var iii = 0; iii < el.options.length; iii++){
						for (var iiii = 0; iiii < json[i].length; iiii++){
							if (json[i][iiii] == el.options[iii].value){
								el.options[iii].selected = true;
							}
						}
					}
				}
			}
	
			//Textarea
			for (var ii = 0; ii < fields3.length; ii++){
				var el = fields3[ii];
				if (el.name == i){
					el.value = json[i];			
				}
			}
		}
	}
	
})(jQuery);


///////////////////////
// Utility functions //
///////////////////////

/*
 * There is no specific logging function within Sakai, but using console.debug will
 * only work in Firefox, and if written poorly, will brake the code in IE, ... If we
 * do want to use logging, we will reuse the logging function available in the Fluid
 * Infusion framework. In order to use this, you need to uncomment the fluid.setLogging(true)
 * line. After this has been done, all calls to 
 *	fluid.log(message);
 * will be logged in the most appropriate console
 *  NOTE: always disable debugging for production systems, as logging calls are quite
 *  expensive.
 */
fluid.setLogging(false);
//fluid.setLogging(true);

/*
 * In order to check whether an array contains an element, use the following function:
 *  $.inArray(valueToMatch, theArray)
 */





























/**
 * 
 * Mechanism that will be used for registering widgets
 * 
 */

sdata.me = false;

sdata.registerForLoad = function(id){
	sdata.toLoad[sdata.toLoad.length] = id;
	if (sdata.readyToLoad){
		sdata.performLoad();
	}
}

/**
 * 
 * SData functions which the container can use to register
 * functions that need to be executed when a widgets finishes editing
 * 
 */

sdata.container = {};

sdata.container.toCallOnFinish = false;
sdata.container.toCallOnCancel = false;

sdata.container.registerFinishFunction = function(callback){
	if (callback){
		sdata.container.toCallOnFinish = callback;
	}
}

sdata.container.registerCancelFunction = function(callback){
	if (callback){
		sdata.container.toCallOnCancel = callback;
	}
}

sdata.container.informFinish = function(tuid, widgetname){
	if (sdata.container.toCallOnFinish){
		sdata.container.toCallOnFinish(tuid, widgetname);
	}
}

sdata.container.informCancel = function(tuid, widgetname){
	if (sdata.container.toCallOnCancel){
		sdata.container.toCallOnCancel(tuid, widgetname);
	}
}

/**
 * 
 */

sdata.performLoad = function(){
	for (var i = 0; i < sdata.toLoad.length; i++){
		var fct = eval(sdata.toLoad[i]);
		try {
			fct();
		} catch (err){
			alert(err);
		}
	}
	sdata.toLoad = []
}

sdata.setReadyToLoad = function(set){
	sdata.readyToLoad = set;
	if (set){
		sdata.performLoad();
	}
}

sdata.readyToLoad = false;
sdata.toLoad = [];


sdata.widgets = {};


/**
 * @static 
 * @class The Main Widget Loader
 * @name sdata.widgets.WidgetLoader
 */
sdata.widgets.WidgetLoader =  {

	mountable_widgets : [],
	bigarray : false,
	toload : {},
	showSettings : false,	

	informOnLoad : function(widgetname){
		try {
			sdata.widgets.WidgetLoader.toload[widgetname].done++;
			//console.debug(widgetname);
			if (widgetname === "sites"){
				console.debug($.toJSON(sdata.widgets.WidgetLoader.bigarray));
			}
			if (sdata.widgets.WidgetLoader.toload[widgetname].done == sdata.widgets.WidgetLoader.toload[widgetname].todo){
				var initfunction = eval('sakai.' + widgetname);
				for (var i = 0; i < sdata.widgets.WidgetLoader.bigarray[widgetname].length; i++){
					try {
						if (sdata.widgets.WidgetLoader.showSettings){
							var obj = initfunction(sdata.widgets.WidgetLoader.bigarray[widgetname][i].uid, sdata.widgets.WidgetLoader.bigarray[widgetname][i].placement, true);
						} else {
							var obj = initfunction(sdata.widgets.WidgetLoader.bigarray[widgetname][i].uid, sdata.widgets.WidgetLoader.bigarray[widgetname][i].placement);
						}
					} catch (err){ alert("Plaats 1 : " + err) }
				}
			}
		} catch (err){
			try {
				var initfunction = eval('sakai.' + widgetname);
				if (sdata.readyToLoad) {
					initfunction();
				} else {
					sdata.toLoad[sdata.toLoad.length] = initfunction;	
				}
			} catch (err){ alert (err)}
		}
	},

	/**
	 * Insert inline widgets into divs in the template
	 */
	insertWidgets : function(id, showSettings){

		var el = $(document.body);
		if (id){
			el = $("#" + id);
		}
		
		var divarray = $(".widget_inline", el);
		var bigarray = {};
		if (showSettings){
			sdata.widgets.WidgetLoader.showSettings = true;
		} else {
			sdata.widgets.WidgetLoader.showSettings = false;
		}
		for (var i = 0; i < divarray.length; i++){
			try {
				var id = divarray[i].id;
				var split = id.split("_");
				var widgetname = split[1];
				if (Widgets.widgets[widgetname] && Widgets.widgets[widgetname].iframe === 1){
					
					var portlet = Widgets.widgets[widgetname];
					var html = '<div style="padding:0 0 0 0" id="widget_content_'+ split[1] + '">' +
		    	   				'<iframe src="'+ portlet.url+'" ' +
		    	   				'id="widget_frame_'+ split[1]+'" ' +
		    	   				'name="widget_frame_'+ split[1]+'" ' +
		    	   				'frameborder="0" ' +
		    	   				'height="'+ portlet.height +'px" ' +
		    	   				'width="100%" ' +
		    	   				'scrolling="no"' +
		    	   				'></iframe></div>';
					$("#" + divarray[i].id).html(html);
					
				} else if (Widgets.widgets[widgetname]){
					
					var widgetid = "id0";
					if (split[2]){
						widgetid = split[2];
					}
									
					var length = split[0].length + 1 + widgetname.length + 1 + widgetid.length + 1; 
					
					var placement = "";
					if (split[3]){
						placement = id.substring(length);
					}
					
					if (! bigarray[widgetname]){
						bigarray[widgetname] = [];
					}
					var index = bigarray[widgetname].length;
					bigarray[widgetname][index] = [];
					bigarray[widgetname][index].uid = widgetid;
					bigarray[widgetname][index].placement = placement;
					bigarray[widgetname][index].id = id;
					var floating = "inline_class_widget_nofloat";
					if (divarray[i].style.cssFloat) {
						if (divarray[i].style.cssFloat == "left") {
							floating = "inline_class_widget_leftfloat";
						}
						else 
							if (divarray[i].style.cssFloat == "right") {
								floating = "inline_class_widget_rightfloat";
							}
					} else {
						if (divarray[i].style.styleFloat == "left") {
							floating = "inline_class_widget_leftfloat";
						}
						else 
							if (divarray[i].style.styleFloat == "right") {
								floating = "inline_class_widget_rightfloat";
							}
					}
					bigarray[widgetname][index].floating = floating;
				}
			} catch (err){
				fluid.log("An error occured whilst searching for widget definitions");
			};
		}

		for (var i in bigarray){
			if (bigarray[i]) {
				try {
					for (var ii = 0; ii < bigarray[i].length; ii++) {
						var el = document.getElementById(bigarray[i][ii].id);
						var newel = document.createElement("div");
						newel.id = bigarray[i][ii].uid;
						newel.className = bigarray[i][ii].floating;
						newel.innerHTML = "";
						el.parentNode.replaceChild(newel, el);
					}
				} 
				catch (err) {
					console.debug(err + " - " + bigarray[i][ii].id);
				};
			}
		}

		sdata.widgets.WidgetLoader.bigarray = bigarray;

		for (var i in bigarray){
			if (bigarray[i]) {
				sdata.widgets.WidgetLoader.loadWidgetFiles(bigarray, i);
			}
		}

	},

	loadWidgetFiles : function(bigarray,widgetname){
		$.ajax({
			url : Widgets.widgets[widgetname].url,
			success : function(response) {
				var thisobj2 = {};
				var newstring = sdata.i18n.processhtml(response, sdata.i18n.localBundle, sdata.i18n.defaultBundle);
				sdata.widgets.WidgetLoader.sethtmlover(null,newstring,bigarray,widgetname);	
			}
		});
	},

	sethtmlover : function (div,content,bigarray,widgetname){
   
   		var anotherone = true;

		while (anotherone === true){
			
			var startscript = content.indexOf("<link");
   			var eindscript = content.indexOf("<\/link>");

			if (startscript !== -1 && eindscript !== -1){
   			
   				var linktag = content.substring(startscript, eindscript);
   				linktag = linktag.substring(linktag.indexOf("href=") + 6);
   				linktag = linktag.substring(0, linktag.indexOf("\""));
				
				if (linktag !== "/resources/css/ext-all.css"){
   			
   					var oScript = document.createElement('link');
  					oScript.setAttribute('rel','stylesheet');
  					oScript.setAttribute('type','text/css');
   					oScript.setAttribute('href',linktag);
   					document.getElementsByTagName("head").item(0).appendChild(oScript);
	
				}

				var tussencontent = content;
				content = tussencontent.substring(0, startscript);
				content += tussencontent.substring(eindscript + 7);
   			
   			} else {

				anotherone = false;

			}

		}

		anotherone = true;

		var scripttags = [];
		while (anotherone === true){
			
			startscript = content.indexOf("<script");
   			eindscript = content.indexOf("<\/script>");

			if (startscript !== -1 && eindscript !== -1){
   			
   				var linktag = content.substring(startscript, eindscript);
				
   				linktag = linktag.substring(linktag.indexOf("src=") + 5);
   				linktag = linktag.substring(0, linktag.indexOf("\""));

				if ( sdata.widgets.WidgetLoader.acceptJS(linktag) ) {
	   				var oScript = document.createElement('script');
	  				oScript.setAttribute('language','JavaScript');
	  				oScript.setAttribute('type','text/javascript');
	   				oScript.setAttribute('src',linktag);
			
					scripttags[scripttags.length] = oScript;									
				}
				
				var tussencontent = content;
				content = tussencontent.substring(0, startscript);
				content += tussencontent.substring(eindscript + 9);
   			
   			} else {

				anotherone = false;

			}

		}
		
		for (var ii = 0; ii < bigarray[widgetname].length; ii++){
			var newel = document.createElement("div");
			newel.innerHTML = content;
			document.getElementById(bigarray[widgetname][ii].uid).appendChild(newel);
		}
	
		sdata.widgets.WidgetLoader.toload[widgetname] = {};
		sdata.widgets.WidgetLoader.toload[widgetname].todo = scripttags.length;
		sdata.widgets.WidgetLoader.toload[widgetname].done = 0;
	
		for (var iii = 0; iii < scripttags.length; iii++){
			document.getElementsByTagName("head").item(0).appendChild(scripttags[iii]);
		}	
			
	},
	
	acceptJS : function(link) {
		
		var elements = link.split("/");
		if ( elements.length > 0 ) {
			var locate = 0;
			if ( elements[locate] === "" ) {
				locate++;
			}
			//if ( SDATA_DEMOSITES[elements[locate]] === 1 ) {
			//	locate++;
			//}
			//if ( SDATA_IGNORE_JS_LIB[elements[locate]] === 1 ) {
			//	return false;
			//}
		}
		return true;
	}

	
};
	
/**
 * @static 
 * @class Widget Preference persistance
 * @name sdata.widgets.WidgetPreference
 * <pre>
 *	In your widget you can use the following functions to save/get widget preferences
 *	
 *		* Save a preference with feedback:	var response = WidgetPreference.save(preferencename:String, preferencontent:String, myCallbackFunction);	
 *		
 *			This will warn the function myCallbackFunction, which should look like this:
 *			
 *				function myCallbackFunction(success){
 *					if (success) {
 *						//Preference saved successfull
 *						//Do something ...
 *					} else {
 *						//Error saving preference
 *						//Do something ...
 *					}
 *				}
 *		
 *		* Save a preference without feedback:	var response = WidgetPreference.quicksave(preferencename:String, preferencontent:String);
 *		
 *			This will not warn you when saving the preference was successfull or unsuccessfull
 *		
 *		* Get the content of a preference:	var response = WidgetPreference.get(preferencename:String, myCallbackFunction);
 *		
 *			This will warn the function myCallbackFunction, which should look like this:
 *			
 *				function myCallbackFunction(response, exists){
 *					if (exists) {
 *						//Preference exists
 *						//Do something with response ...
 *					} else {
 *						//Preference does not exists
 *						//Do something ...
 *					}
 *				}
 *	 </pre>
 */
sdata.widgets.WidgetPreference =  {
	/**
	 * Get a preference from personal storage
	 * @param {string} prefname the preference name
	 * @param {function} callback the function to call on sucess
	 * 
	 */
	get : function(prefname, callback, requireslogin){ 
		var url= "/sdata/p/widgets/" + prefname;
		var args = (requireslogin === false ? false : true);
		$.ajax ( {
			url : url,
			cache : false,
			success : function(data) {
				callback(data,true);
			},
			error : function(status) {
				callback(status,false);
			},
			sendToLoginOnFail: args
		});

	},

	/**
	 * Save a preference to a name
	 * @param {string} prefname the preference name
	 * @param prefcontent the content to be saved
	 * @param {function} callback, the call back to call when the save is complete
	 */
	save : function(url, prefname, prefcontent, callback, requireslogin,contentType){
		var ct = contentType || "text/plain";
		var cb = callback || function() {}; 
		var args = (requireslogin === false ? false : true);
		var ct = contentType || "text/plain";
		var data = {};
		data[prefname] = prefcontent;
		
		$.ajax({
			url :url,
			type : "POST",
			success : function(data) {
				cb(data,true);
			},
			error : function(status) {
				cb(status,false);
			},
			data : data,
			sendToLoginOnFail: args
		});
			
 	}
};
	
sdata.util = {};	

/**
 * Strip out all HTML tags from an HTML string
 * @param {string} the HTML string
 * @return the stripped string
 * @type String
 */
sdata.util.stripHTML = function(htmlstring, limit){
	if (htmlstring){
		var endstring = htmlstring.replace(/&nbsp;/ig," ").replace(/<br([^>]+)>/ig," ").replace(/(<([^>]+)>)/ig,"");
		if (limit){
			if (endstring.length > limit){
				endstring = endstring.substrin(0,limit) + " ...";
			}
		} 
		return endstring;
	} else {
		return null;
	}
}

/**
 * @static 
 * @class String utilities
 * @name sdata.util.String
 */
sdata.util.String = {
	/**
	 * Display bytes with a size string, B,MB,GB,TB
	 * @param {integer} nbytes the bytes to be formatted
	 * @return the formatted byte string
	 * @type String
	 */
	formatBytes: function(nbytes) {
		if ( nbytes < 1024 ) {
			return nbytes.toString()+" B";
		}
		nbytes = nbytes/1024;
		if ( nbytes <  1024 ) {				
			return nbytes.toFixed(2)+" KB";
		}
		nbytes = nbytes/1024;
		if ( nbytes <  1024 ) {
			return nbytes.toFixed(2)+" MB";
		}
		nbytes = nbytes/1024;
		return nbytes.toFixed(2)+" GB";			
	},
	
	/**
	 * Format a time interval into the form hh:mm:ss
	 * @param {integer} t the time to be formatted in seconds.
	 * @return a formatted time interval string
	 * @type String
	 */
	formatTime: function(t) {
		if ( t < 0 ) {
			t = 1;
		}
		t = Math.ceil(t);
		var s = t%60;
		var sec = s<10?"0"+s.toString():s.toString();
		t = (t-s)/60;
		var m = t%60;
		var min = m<10?"0"+m.toString():m.toString();
		var h = (t-m)/60;
		var hour = h<10?"0"+h.toString():h.toString();
		return hour+":"+min+":"+sec;
	},
	
	/**
	 * Replace all occurances of replacements in str
	 * @param {string} str the string to be searched for replacements
	 * @param {array} replacements an array of 2 element arrays containing the search string and optionally the replace string
	 * @return The string after replacements
	 * @type String
	 */
	replaceAll : function( str, replacements ) {
	    for ( var i = 0; i < replacements.length; i++ ) {
	        var idx = str.indexOf( replacements[i][0] );
	
	        while ( idx > -1 ) {
	            str = str.replace( replacements[i][0], replacements[i][1] ); 
	            idx = str.indexOf( replacements[i][0] );
	        }
	
	    }
		return str;
	}				
};

sdata.util.URL = {

    // public method for url encoding
    encode : function (string) {
        return escape(this._utf8_encode(string));
    },

    // public method for url decoding
    decode : function (string) {
        return this._utf8_decode(unescape(string));
    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
		try {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
		} catch (err){
			return string;
		}
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }
	
}

sdata.lib = {};

/**
 * @static 
 * @class Load to load javascript libraries
 */
sdata.lib.Load = {
	/**
	 * @desc A cache of JS files to avoid duplicate load attempts from Require Once
	 * @private
	 * @static
	 */
	js_cache : [],
	

	/**
	 * Require a JS library
	 * @param {String} url is the URL of the script file relative to the parent dom.
	 * @static
	 */
	requireOnce : function(url) {
		if ( ! sdata.lib.Load.js_cache[url] ) {
   			var script = document.createElement("script");
   			var head = document.getElementsByTagName('head').item(0); 
   			script.src = url;
   			script.type="text/javascript";
   			script.language="JavaScript";
   			head.appendChild(script); 
   			sdata.lib.Load.js_cache[url] = url;
		}
	},
	/**
	 * Require a CSS library, however since we need page context on this, we dont attempt to 
	 * prevent loading if its already there as the JS may cover more than one frame.
	 * @param {String} url is the URL of the script file relative to the parent dom.
	 * @static
	 */
	requireCSS : function(url) {
   		var script = document.createElement("link");
   		var head = document.getElementsByTagName('head').item(0); 
   		script.href = url;
   		script.type = "text/css";
   		script.rel = "stylesheet";
   		head.appendChild(script); 
	}
	
};

sdata.html = {};

/**
 * @static 
 * @class Template utilities
 * @name sdata.html.Template
 */
 
sdata.html.Template = {
	
	/**
	 * A persistant cache for the templates
	 * @private
	 */
	templateCache : [],
	
	/**
	 * render the temlate with a context
	 * @param {string} templateName the name of the element ID.
	 * @param {object} contextObject the javascript object containing the data to be rendered
	 * @param {string} [optional] where the rendered output should be placed.
	 * @return The rendered template
	 * @type String
	 */
	render : function(templateName, contextObject, output)  {
		 try {
			
			if ( ! sdata.html.Template.templateCache[templateName] ) {
				 var templateNode = document.getElementById(templateName);
				 if (templateNode) {
				 	var firstNode = templateNode.firstChild;
				 	var template = null;
				 	if (firstNode && (firstNode.nodeType === 8 || firstNode.nodeType === 4)) {
				 		template = templateNode.firstChild.data.toString();
				 		
				 	}
				 	else {
				 		template = templateNode.innerHTML.toString();
				 	}
				 	sdata.html.Template.templateCache[templateName] = TrimPath.parseTemplate(template, templateName);
				 } else {
				 	return "";
				 }
			}

			var render = sdata.html.Template.templateCache[templateName].process(contextObject);

			if (output) {
				output.html(render);
			}
				
			return render;
		} catch (error){
			alert(error);
		}
	},
	
	/**
	 * test the template and inject it into test div 
	 * @param {string} target the target test div
	 * @param {array} templates an array of template names
	 */
	test : function(target,templates) {
			var rc = {
				response : {},
            	id : 'f' + Math.floor(Math.random() * 999999999)
			};
			for ( var name in templates ) {
				document.getElementById(target).innerHTML += sdata.html.Template.render(templates[name],rc);
			}
	}

};

/**
 * Provides i18n capabilities to SData. 
 * Message bundles are retrieved over ajax, the bundle is used to process
 * inbound strings.
 */
sdata.i18n = function() {
	var preferences = {};

	/**
	 * get the bundle and invoke a callback
	 * @param {Object} callback the sucess callback invoked as callback(bundle)
	 * @param {Object} failcallback the failure callback invoked as failcallback();
	 * @param {Object} bundleLocations an associative array of locations keyed on the locale
	 * @param {Object} defaultLocale the default locale key
	 */	
	function _get(callback,failcallback,bundleLocations,defaultLocale) {
		
		// we have a person object, work out the prefered locale
		var localeKey = "";
		try {
			localeKey = sdata.me.locale.language+"_"+sdata.me.locale.country;
		} catch (err){}
				
		if ( !preferences[localeKey] ) {
			// not loaded, get the target URL
			var targetUrl = bundleLocations[defaultLocale];
			var defaultTargetUrl = targetUrl;
			if ( bundleLocations[localeKey] ) {
				targetUrl = bundleLocations[localeKey];
			}
			if ( !targetUrl ) {
				failcallback();
				return;
			}
			// load the target URL
			_loadBundle(callback,failcallback,localeKey,targetUrl,defaultTargetUrl);				
		} else {
			var bundle = preferences[localeKey];
			callback(bundle);
			return;
		}
		
	};
	/**
	 * Load a bundle using async calls and callbacks
	 * @param {Object} callback the callback on sucess invoked as callback(bundle)
	 * @param {Object} failcallback the failure callback invoked as failcallbacl()
	 * @param {Object} localeKey the localeKey to cache the result into 
	 * @param {Object} url the location of the prefered bundle
	 * @param {Object} defaultUrl the location of the default bundle
	 */
	function _loadBundle(callback,failcallback,localeKey,url,defaultUrl) {
		if ( !url ) {
			failcallback();
			return;
		}
		sdata.Ajax.request({
			url : url,
			sendToLoginOnFail : "false",
			/**
			 * sucess callback
			 * @param {Object} response
			 */
			onSuccess :  function (response) {
				bundle = eval('(' + response + ')');
				preferences[localeKey] = bundle;
				callback(bundle);
			},
			/**
			 * Failure Callback
			 * @param {Object} httpstatus
			 */
			onFail : function(httpstatus) {
				if ( defaultUrl == null ) {
					failcallback();
					return;
				}
				// requested bundle was not available
				sdata.Ajax.request({
					url : defaultUrl,
					sendToLoginOnFail : "false",
					/**
					 * Sucess callback
					 * @param {Object} response
					 */
					onSuccess :  function (response) {
						bundle = eval('(' + response + ')');
						preferences[localeKey] = bundle;
						callback(bundle);
					},
					/**
					 * Failiure callback
					 * @param {Object} httpstatus
					 */
					onFail : function(httpstatus) {
						failcallback();
			        }
				})
	        }
			
			
		});
	};
	/**
	 * get the replacement for the target in the bundle. The target is of the form __MSG__key__
	 * @param {Object} target
	 * @param {Object} bundle
	 */
	function _replaceTarget(target,bundle) {
		var name = target.substring(7,target.length-2);
		return bundle[name];
	};

	function _processhtml(toprocess, localbundle, defaultbundle) {
		var re = new RegExp("__MSG__(.*?)__", "gm");
		var processed = "";
		var lastend = 0;
		while(re.test(toprocess)) {
			var replace = RegExp.lastMatch;
			var toreplace = "";
			var lastParen = RegExp.lastParen;
			try {
				if (localbundle[lastParen]){
					toreplace = localbundle[lastParen];
				} else {
					throw "Not in local file";
				}
			} catch (err){
				try {
					if (defaultbundle[lastParen]){
						toreplace = defaultbundle[lastParen];
					} else {
						throw "Not in default file";
					}
				} catch (err){};
			}
			processed += toprocess.substring(lastend,re.lastIndex-replace.length)+ toreplace;
			lastend = re.lastIndex;
		}
		processed += toprocess.substring(lastend)
		return processed;
	};
	
	/**
		 * Process the string
		 * @param {String} toprocess The string to process
		 * @param {function} callback the callback that gets the processed string
		 * @param {Array} bundleLocations an associative array of locations
		 * @param {String} defaultLocale the default Locale
		 */
	function _process(toprocess,callback,bundleLocations,defaultLocale) {
		if ( bundleLocations.length === 0 ) {
			callback(toprocess);
			return;
		}	
		_get(
			/**
			 * Callback for a sucessfull bundle get
			 * @param {Object} bundle
			 */
			function(bundle){
				var re = new RegExp("__MSG__(.*?)__", "gm");
				var processed = "";
				var lastend = 0;
				while(re.test(toprocess)) {
					var replace = RegExp.lastMatch;
					if ( bundle[RegExp.lastParen] ) {
						replace = bundle[RegExp.lastParen];
					}
					processed += toprocess.substring(lastend,re.lastIndex-RegExp.lastMatch.length)+replace;
					lastend = re.lastIndex;
				}
				processed += toprocess.substring(lastend)
				callback(processed);
			},
			/**
			 * Failed
			 */
			function(){
				callback(toprocess);
			},
			bundleLocations,
			defaultLocale
		);
	};
	

	/**
	 * Gets an associative array of bundles from the widget. 
	 * Bundles are defined using <link href="budlesrc" hreflang="en_US"  type="messagebundle/json" />
     * where bundle src is the source url of the bundle for the widget
	 * @param {Object} widgetMarkup
	 */
	function _getBundles(widgetMarkup) {
		var scripttags = sdata.widgets.WidgetLoader.getLinks("link",widgetMarkup);
		var bundle = {};
		for( var i = 0; i < scripttags.length; i++ ) {
			if ( scripttags[i].type === "messagebundle/json" ) {
				var locale = "default";
				if ( scripttags[i].hreflang ) {
					locale = scripttags[i].hreflang;
				}
				bundle[locale] = scripttags[i].src;
			}
		}
		return bundle;				
	};
	
	return {
		/**
		 * Process the string
		 * @param {String} toprocess The string to process
		 * @param {function} callback the callback that gets the processed string
		 * @param {Array} bundleLocations an associative array of locations
		 * @param {String} defaultLocale the default Locale
		 */
		process : _process,
		processhtml : _processhtml,
		/**
		 * Async Get into the callback or failcallback of the bundle for the user, specified by the bundleLocations.
		 * If the bundle cant be found, the defaultLocale is tried. If that cant be found failcallback is invoked.
		 * @param {Object} callback The successfull callback, invoked as callback(bundle)
		 * @param {Object} failcallback The failure callback, invokec as failcallback()
		 * @param {Object} bundleLocations an associative array of bundle locations.
		 * @param {Object} defaultLocale the default locale key
		 */
		get : _get,
				
		getBundles : _getBundles

	};	

}();


////////////////////////
// Necessairy imports //
////////////////////////
	
sdata.lib.Load.requireOnce('/dev/_configuration/widgets.js');
sdata.lib.Load.requireOnce('/dev/_configuration/config.js');