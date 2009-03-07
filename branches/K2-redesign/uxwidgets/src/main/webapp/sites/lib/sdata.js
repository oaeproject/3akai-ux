if (typeof XMLHttpRequest === "undefined") 
{
	if (window.ActiveXObject) {
		XMLHttpRequest = function () {
			return new ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >= 0 ?
			"Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
		};
	} 
	
}
/**
 * @fileoverview
 * SData provides a name space that interfaces to the SData REST API's provided on the server
 * The aim of this namespace is to make it easier to write widgets
 * 
 */
  
var sdata = {};
var sakai = {};

 
/**
 * @static
 * @class Ajax Loader
 */  
sdata.Ajax =  {
	

	get_response_cache : {}, 			
	/**
	 * <pre>
	 * Sends a Ajax Request to the server based on the options passed in.
	 * options.httpMethod is the standard method (string default GET)
	 * options.url is the URL to send to (string required)
	 * options.onFail is the function that is invoked on a failed request
	 * options.onSuccess is the function that is invokec on sucess
	 * options.onComplete is called when the request is complete (fail or success)
	 * options.onTimeout is called when the requests timesout
	 * options.timeout is the timeout in ms (default 30000ms)
	 * options.responseType is the response type (default text)
	 * 		text : just return the text
	 *      xml : return a dom
	 *      script : run the script against the window
	 *      If there is anything that indicates XML in the content type a DOM will be returned.
	 * 
	 * options.sync true of synchronouse, false if async (default false)
	 * options.contentType the content type of the POST, if a post (default text/plain)
	 * options.postData an array of data 
	 * options.getData a fucntion to get the data to be sent in the body.
	 * 
	 * GET,HEAD.DELETE
	 * If the options.httpMethod is a GET,HEAD,DELETE then the url is invoked with no body
	 * 
	 * PUT
	 * If getData is defined, this is used to retrieve the body of the post, if that is not 
	 * set postData is used.
	 * 
	 * POST
	 * If getData is defined, this is used, otherwise, getData is assumed to be an array.
	 * If the form is url encoded, then postData should be a name value array.
	 * If the form is multipart, then the postData should be a name value array, where 
	 * the value of the array is an object
	 * The name of the element in the array is used as the form element name.
	 * value.fileName is used as a filename for the form element
	 * value.contentType is used as the content type for the element
	 * value.data is the data for the element
	 * 
	 * The fucntion will not perform file uplaods from a file input form, for that you should use
	 * SWFUpload and do it all via flash.
	 * </pre>
	 * 
	 * 
	 * 	  
	 * @param options a structure of options
	 * @static 
	 */
	request : function (options) {
		/**
		 * The options structure with defaults
		 */
		var opt = {
			httpMethod : options.httpMethod || "GET",
			url : options.url || "",
			onFail : options.onFail || function () {},
			onSuccess : options.onSuccess || function () {},
			onComplete : options.onComplete || function () {},
			onTimeout : options.onTimeout || function () {},
			sync : !options.async || false,
			contentType : options.contentType || "text/plain",
			postData : options.postData || null,
			getData : options.getData || null,
			timepout : options.timeout || 30000,
			responseType : options.responseType || "text",
			sendToLoginOnFail : options.sendToLoginOnFail || "true",
			useCache : options.useCache || "false"
		};
		/**
		 * is the response Ok
		 * @private
		 */
		function httpOk(response) {
			try {
				try {
					if (response.status == 401 && opt.sendToLoginOnFail == "true"){
						if (response.getAllResponseHeaders().indexOf("/p/widgets/loggedIn") == -1 && response.getAllResponseHeaders().indexOf("/p/widgets/search") == -1){
							var redirect = document.location;
							var redirectURL = sdata.util.URL.encode(redirect.pathname + redirect.search + redirect.hash);
							document.location = "/index.html?url=" + redirectURL;
						}
					}
				} catch (err){}
				return !response.status && location.protocol === "file:" ||
				(response.status >= 200 && response.status < 300) ||
				(response.status === 304) ||
				(navigator.userAgent.indexOf("Safari") >= 0 && 
					typeof response.status === "undefined");
			} catch (e) {
				
			}
			return false;
		};
		/**
		 * get the response data and if a script, run the script
		 * @private
		 */
		function getResponseData(response, responseType) {
		    var rct = response.getResponseHeader("content-type");
		    var data = !responseType && rct && rct.indexOf("xml") >= 0;
		    data = responseType === "xml" || data ? response.responseXML : response.responseText;
		    if (responseType === "script") {
		 	   eval.call(window, data);
		    }
		    else if (responseType === 'json') {
		    	data = eval('(' + data + ')');
		    }
		    return data;
		};
		
		if ( opt.useCache && opt.httpMethod === "GET" &&  sdata.Ajax.get_response_cache[opt.url] ) {
			options.onSuccess(sdata.Ajax.get_response_cache[opt.url]);
			return;
		}
		
		
		
		
		var sdata_xmlHttp = new XMLHttpRequest();
		//sdata_xmlHttp.setRequestHeader("x-ajax-client", "SData Client 1.0");
		//sdata_xmlHttp.setRequestHeader("sdata-url", url);
		sdata_xmlHttp.open(opt.httpMethod, opt.url, true);
		//
		/**
		 * A timeout function
		 */
		
		var requestTimeout = false;
		//setTimeout("try { timeo(); } catch (err) {}", opt.timeout);
		
		/**
		 * the on ready event
		 */
	    sdata_xmlHttp.onreadystatechange = function () {
			if (sdata_xmlHttp.readyState === 4 && !requestTimeout) {
				//for (var l in sdata_xmlHttp){
				//	alert(l + " = " + sdata_xmlHttp[l]);
				//}
				if (httpOk(sdata_xmlHttp)) {
				   var responseData = getResponseData(sdata_xmlHttp, opt.responseType);
				   if ( opt.useCache && opt.httpMethod === "GET" ) {
				   		sdata.Ajax.get_response_cache[opt.url] = responseData;
				   }
			 	   opt.onSuccess(responseData);
				} else {
				    opt.onFail(sdata_xmlHttp.status);
				}
			    opt.onComplete();
			    sdata_xmlHttp = null;
			}
	    };
	    
		
		
		/**
		 * get the request body
		 */
		var out = [];
		var outputData = null;
		if (opt.httpMethod === "POST" || opt.httpMethod === "PUT") {
			if (opt.getData !== null) {
				outputData = opt.getData();
			} else if (opt.httpMethod === "POST" || opt.postData !== null) {
				if (opt.contentType === "application/x-www-form-urlencoded") {
					if (opt.postData.constructor === Array) {
						for ( var i = 0; i < opt.postData.length; i++ ) {
							out.push( opt.postData[i].name + "=" + encodeURIComponent(opt.postData[i].value));
						}		
					} else {
						for ( var j in opt.postData ) {
							var item = opt.postData[j];
							if ( item.constructor == Array ) {
								for ( var i = 0; i < item.length; i++ ) {
									out.push( j + "=" + encodeURIComponent(item[i]));
								}               
							} else {
								out.push(j+"="+encodeURIComponent(item));
							}
						}
					}
					outputData = out.join("&");
				} else if ( opt.contentType === "multipart/form-data" )  {
					if ( opt.postData.constructor === Array ) {
						for ( var k = 0; k < opt.postData.length; k++ ) {
							var name = opt.postData[k].name;
							var value = opt.postData[k].value;
							var fileName = value.fileName || null;
							var contentType = value.contentType || 'text/plain';
							if ( fileName !== null ) {
								fileName = ' filename="' + fileName + '"'; 
							}
							out.push(
								'\r\n'+ 
								'Content-Disposition: form-data; name="' + name + '";' + fileName + '\r\n'+ 
								'Content-Type: '+contentType+ '\r\n' +
								'\r\n'+
								value.data+
								'\r\n');
						}		
					} else {
						for ( var l in opt.postData ) {
							var fileName = opt.postData[l].fileName || null;
							var fileName2 = opt.postData[l].fileName || null;
							var contentType = opt.postData[l].contentType || 'text/plain';
							if ( fileName !== null ) {
								fileName = ' filename="' + fileName + '"'; 
							}
							out.push(
								'\r\n' +
								'Content-Disposition: form-data; name="' + fileName2 + '";' + fileName + '\r\n'+ 
								'Content-Type: '+contentType+ '\r\n' +
								'\r\n'+
								opt.postData[l].data+
								'\r\n');
						}
					}
					var boundaryString = "bound"+Math.floor(Math.random() * 9999999999999);
					var boundary = '--' + boundaryString;
					opt.contentType = opt.contentType +"; boundary=" + boundaryString + "";
					outputData = out.join(boundary) + "--";

					outputData = boundary + '\r\n' +
								'Content-Disposition: form-data; name="' + fileName2 + '";' + fileName + '\r\n'+ 
								'Content-Type: '+contentType+ '\r\n' +
								'\r\n'+
								opt.postData[l].data+
								'\r\n'+
								boundary + "--";

				} else {
					outputData = opt.postData;
				}
			} else {
				outputData = opt.postData;
			}
		}
		
		/**
		 * set the content type and send the request
		 */
		sdata_xmlHttp.setRequestHeader("Content-type",opt.contentType);
		if ( sdata_xmlHttp.overrideMimeType ) {
			// Mozilla browsers have problems with content length
			sdata_xmlHttp.setRequestHeader("Connection","Close");
			
		} else {
			if ( outputData !== null ) {		
	    		//sdata_xmlHttp.setRequestHeader("Content-length", outputData.length);
			}
		}
	
		sdata_xmlHttp.send(outputData);
		
	}
};


/**
 * @static 
 * @class Logger Class
 * @name sdata.Log
 */
sdata.Log =  {
	/**
	 * Appends a message to a an element with the id 'log' in the current document.
	 * @param msg the log message
	 * @static
	 * 
	 */
	info : function(msg) {
		var logWindow = document.getElementById('log');
		if ( logWindow ) {
			logWindow.innerHTML += "<br />"+msg;
		}
	},
	
	/**
	 * Clear the log element in the current dom, identified by id='log' 
	 */
	clear : function() {
		var logWindow = document.getElementById('log');
		if ( logWindow ) {
			logWindow.innerHTML = "";
		}
	}
};

	
sdata.events = {};

/**
 * @static 
 * @class Listener for managing events 
 * @name sdata.events.Listener
 */
sdata.events.Listener =  {
	/**
	 * Attach a function to the onload event, maintaining existing onload functions.
	 * @param {fucntion} func a function
	 */
	onLoad : function (func) {    
	    var oldonload = window.onload;
	    if (typeof window.onload != 'function')
	    {
	        window.onload = func;
	    } 
	    else 
	    {
	        window.onload = function()
	        {
	            oldonload();
	            func();
	        }
	    }
	}
};

sdata.widgets = {};

/**
 * Create a Loader Object to pull HTML for widgets
 * @constructor
 * @class 
 */
sdata.widgets.Loader = function(){
	
		this.div = "";
		this.url = "";
		this.id = "";
		this.bundle = null;

};
/**
 * initialise the widget
 * @param {Object} divName
 * @param {Object} loadurl
 */
sdata.widgets.Loader.prototype.init = function(divName,loadurl) {
	this.div = divName;
	this.url = loadurl;	
	this.id =  Math.random();	
};

/**
 * load the widget and bundles
 */
sdata.widgets.Loader.prototype.load = function() {
	sdata.Ajax.request({
		url : this.url,
		onSuccess : this.finishLoad
	});	    				
};

/**
 * complete the load of the widget
 * @param {Object} response
 * @private
 */
sdata..widgets.Loader.prototype.finishLoad = function(response) {
	this.bundle = sdata.i18n.getBundles(content);
	sdata.i18n.process(content,this.finishInject,
	this.bundle,"default");		
};

/**
 * Inject the widget
 * @param {Object} response
 * @private
 */
sdata..widgets.Loader.prototype.finishInject = function(response) {
	sdata.widgets.WidgetLoader.sethtmlover(this.div,i18nrespone);                            
};


/**
 * @static 
 * @class The Main Widget Loader
 * @name sdata.widgets.WidgetLoader
 */
sdata.widgets.WidgetLoader =  {

	mountable_widgets : [],

	/**
	 * Insert inline widgets into divs in the template
	 */
	insertWidgets : function(id){

		var divarray = sdata.widgets.WidgetLoader.getElementsByClassName("widget_inline", id);
		for (var i = 0; i < divarray.length; i++){
			var portlet = Widgets.widgets[divarray[i].id.substring(7)];
			try {
	    		if ( portlet.url !== null ) {
					if ( portlet.iframe === 1 ) {
		    	   		var html = '<div style="padding:0 0 0 0" id="widget_content_'+ portlet.id+ '">' +
		    	   				'<iframe src="'+ portlet.url+'" ' +
		    	   				'id="widget_frame_'+ portlet.id+'" ' +
		    	   				'name="widget_frame_'+ portlet.id+'" ' +
		    	   				'frameborder="0" ' +
		    	   				'height="'+ portlet.height +'px" ' +
		    	   				'width="100%" ' +
		    	   				'scrolling="no"' +
		    	   				'></iframe></div>';
						document.getElementById(divarray[i].id).innerHTML = html;
		    	   } else {
	    				var divName = new String(portlet.divid);
	    				var loader = new sdata.widgets.Loader();
	    				loader.init(divarray[i].id,portlet.url);
	    				loader.load();	
					}    			
	    		}
			} catch (err){ alert(divarray[i].id + ' didn\'t find a portlet (' + err + ')')}
		}

		var divarray = sdata.widgets.WidgetLoader.getElementsByClassName("widget_mountable", id);
		for (var i = 0; i < divarray.length; i++){
			
			var portlet = Widgets.widgets[divarray[i].id.substring(7)];
			try {
	
				var button = Ext.get(divarray[i].id);
				if (!sdata.widgets.WidgetLoader.mountable_widgets[divarray[i].id.substring(7)]){
					sdata.widgets.WidgetLoader.mountable_widgets[divarray[i].id.substring(7)] = new Object();
				}

				var el = document.getElementById(divarray[i].id);

    			el.onclick = function() {
					var tid = this.id;

					var ihtml = "<div id='floatable_widget_" + tid.substring(7) + "'><img src='/resources/images/loader.gif'/></div>";
					var iheight = 400;
					var iwidth = 600;
					var ititle = "Widget"

					var portlet = Widgets.widgets[tid.substring(7)];
					try {
	    				if ( portlet.url !== null ) {
							ititle = portlet.name;
							if ( portlet.iframe === 1 ) {
		    	   				ihtml = '<div id="floatable_widget_' + tid.substring(7) + '">' +
										'<div style="padding:0 0 0 0" id="widget_content_'+ portlet.id+ '">' +
		    	   						'<iframe src="'+ portlet.url+'" ' +
		    	   						'id="widget_frame_'+ portlet.id+'" ' +
		    	   						'name="widget_frame_'+ portlet.id+'" ' +
		    	   						'frameborder="0" ' +
		    	   						'height="'+ portlet.height +'px" ' +
		    	   						'width="100%" ' +
		    	   						'scrolling="no"' +
		    	   						'></iframe></div></div>';	
								iheight = portlet.height + 70;	
							}
						}
					} catch (err){ alert(err);}

        			if(!sdata.widgets.WidgetLoader.mountable_widgets[tid.substring(7)].win){
            			sdata.widgets.WidgetLoader.mountable_widgets[tid.substring(7)].win = new Ext.Window({
							title : ititle,
							header : true,
                			layout:'fit',
                			width: iwidth,
                			height: iheight,
                			closeAction:'hide',
                			plain: true,
							html : ihtml,
							border:true,
                    		bodyStyle:'position:relative',
                    		anchor:'100% 100%',
                    		overflow:'auto',
                    		fitToFrame:'true',
                    		autoScroll:'true',
							style:'background-color:#FFFFFF',
                    		defaults:{autoHeight:true,autoWidth:true,bodyStyle:'padding:10px'},
                
	                		buttons: [{
    	                		text: 'Close',
        	            		handler: function(){
            	            		sdata.widgets.WidgetLoader.mountable_widgets[tid.substring(7)].win.hide();
                	    		}
                			}]
            			});

						var portlet = Widgets.widgets[tid.substring(7)];
						try {
	    					if ( portlet.url !== null ) {
								if ( portlet.iframe === 0 ) {
	    							var loader = new sdata.widgets.Loader();
	    							loader.init("floatable_widget_" + tid.substring(7),portlet.url);
	    							loader.load();	    			
	    						}
							}
						} catch (err){}
	
        			}
        			sdata.widgets.WidgetLoader.mountable_widgets[tid.substring(7)].win.show(this);
    			};

			} catch (err){ alert(err);}
		}

	},	

	getElementsByClassName : function (needle, divid) { 
   		var s, i, r = [], l = 0, e; 
    	var re = new RegExp('(^|\\s)' + needle + '(\\s|$)'); 

		var div = document.body;
		if (divid){
			div = document.getElementById(divid);
		}

    	if (navigator.userAgent.indexOf('Opera') > -1) 
   	 	{ 
        	//s = [document.documentElement || document.body], i = 0; 
			s = [div], i = 0; 

        	do 
        	{ 
            	e = s[i]; 

 	           	while (e) 
            	{ 
                	if (e.nodeType == 1) 
                	{ 
                    	if (e.className && re.test(e.className)) r[l++] = e; 

                    	s[i++] = e.firstChild; 
                	} 

                	e = e.nextSibling; 
            	} 
        	} 
        	while (i--); 
    	} 
    	else 
    	{ 
        	s = div.getElementsByTagName('*'), i = s.length; 

        	while (i--) 
        	{ 
            	e = s[i]; 
            	if (e.className && re.test(e.className)) r[l++] = e; 
        	} 
    	} 

    	return r; 
	},

	/**
	 * Gets an associative array of bundles from the widget. 
	 * Bundles are defined using <link href="budlesrc" hreflang="en_US"  type="messagebundle/json" />
     * where bundle src is the source url of the bundle for the widget
	 * @param {String} tag
	 * @param {String} widgetMarkup
	 */
	getLinks : function(tag,widgetMarkup) {
		var findLinks = new RegExp("<"+tag+".*?>","gim");
		var extractAttributes = /\s\S*?="(.*?)"/gim;	
		var bundle = [];	
		while (findLinks.test(widgetMarkup)) {
			var linkMatch = RegExp.lastMatch;
			var linkTag = new Array();
			while (extractAttributes.test(linkMatch)) {
				var attribute = RegExp.lastMatch;
				
				var value = RegExp.lastParen;
				var attributeName = attribute.substring(1,attribute.indexOf("="));
				linkTag[attributeName] = value;
			}
			bundle.push(linkTag);
		}
		return bundle;				
	},


	/**
	 * Load Widget HTML
	 * @param div the target div
	 * @param the content of the widget as HTML
	 */
	sethtmlover : function (div,content,callback){
   
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

		while (anotherone === true){
			
			startscript = content.indexOf("<script");
   			eindscript = content.indexOf("<\/script>");

			if (startscript !== -1 && eindscript !== -1){
   			
   				var linktag = content.substring(startscript, eindscript);
   				linktag = linktag.substring(linktag.indexOf("src=") + 5);
   				linktag = linktag.substring(0, linktag.indexOf("\""));
   			
   				var oScript = document.createElement('script');
  				oScript.setAttribute('language','JavaScript');
  				oScript.setAttribute('type','text/javascript');
   				oScript.setAttribute('src',linktag);
				if (linktag !== "lib/widgetdev.js" && linktag !== "lib/trimpath.js" && linktag !== "lib/json.js" && linktag !== "lib/ajaxform.js" && linktag !== "lib/sdata.js" && linktag !== "lib/jquery.js" && linktag !== "lib/jqueryui.js" && linktag !== "lib/jqueryuiblock.js" && linktag !== "/lib/widgetdev.js" && linktag !== "/lib/trimpath.js" && linktag !== "/lib/json.js" && linktag !== "/lib/ajaxform.js" && linktag !== "/lib/sdata.js" && linktag !== "/lib/jquery.js" && linktag !== "/lib/jqueryui.js" && linktag !== "/lib/jqueryuiblock.js"){
					scripttags[scripttags.length] = oScript;
				}

				var tussencontent = content;
				content = tussencontent.substring(0, startscript);
				content += tussencontent.substring(eindscript + 9);
   			
   			} else {

				anotherone = false;

			}

		}

		
	   		
	},
	
	finishWidgetLoad : function(i18ncontent) {
			document.getElementById(div).innerHTML=i18ncontent;
			
			for (var iii = 0; iii < scripttags.length; iii++){
				document.getElementsByTagName("head").item(0).appendChild(scripttags[iii]);
			}
			
		
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
		url = url +"?sid="+Math.random();
		var args = "true";
		if (requireslogin){
			args = "false";
		}
		sdata.Ajax.request( {
			url : url,
			onSuccess : function(data) {
				callback(data,true);
			},
			onFail : function(status) {
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
	save : function(prefname, prefcontent, callback, requireslogin){
		var cb = callback || function() {}; 
		var args = "true";
		if (requireslogin){
			args = "false";
		}
		var url= "/sdata/p/widgets?sid="+Math.random();
		var data = {"items":{"data": prefcontent,"fileName": prefname,"contentType":"text/plain"}};
		sdata.Ajax.request({
			url :url,
			httpMethod : "POST",
			onSuccess : function(data) {
				cb(data,true);
			},
			onFail : function(status) {
				cb(status,false);
			},
			postData : data,
			contentType : "multipart/form-data",
			sendToLoginOnFail: args
		});
			
 	}
};
	
sdata.util = {};	

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
	render : function(templateName, contextObject, outputId)  {
			if ( ! sdata.html.Template.templateCache[templateName] ) {
				 var templateNode = document.getElementById(templateName);
				 var firstNode = templateNode.firstChild;
				 var template = null;
				 if ( firstNode && ( firstNode.nodeType === 8 || firstNode.nodeType === 4)) {
				 	template = templateNode.firstChild.data.toString();
				 	
				 } else {
				 	template = templateNode.innerHTML.toString();
				 }
				 sdata.html.Template.templateCache[templateName] = TrimPath.parseTemplate(template,templateName);
			}

			var render = sdata.html.Template.templateCache[templateName].process(contextObject);

			if (outputId) {
				var output = document.getElementById(outputId);
				if (output) {
					output.innerHTML = render;
				}
			}
			return render;
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

sdata.client = {};

sdata.client.me = function() {
	var person = null;
	function _get(callback, failcallback){
		_getWithFail(callback,function(httpstatus) {
					if ( httpstatus != 401 ) {
						failcallback(httpstatus);	
	        		}			
		});
	};
	function _getWithFail(callback,failcallback) {
		if ( person == null ) {
			sdata.Ajax.request( { 
				url : "/sdata/me",
				sendToLoginOnFail : "false",
				onSuccess :  function (response) {
					person = eval('(' + response + ')');
					callback(person);
				},
				onFail : function(httpstatus) {
					failcallback(httpstatus);
	        	}
	    	});
		} else {
			callback(person);
		}
	};
	return {
		get : _get,
		getWithFail : _getWithFail
	};
	
}();


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
		sdata.client.me.getWithFail(
			/** 
			 * Sucess callback
			 * @param {Object} person
			 */
			function(person) {
				// we have a person object, work out the prefered locale
				var localeKey = person.items.userLocale.language+"_"+person.items.userLocale.country;
				if ( !preferences[localeKey] ) {
					// not loaded, get the target URL
					var targetUrl = bundleLocations[defaultLocale];
					var defaultTargetUrl = targetUrl;
					if ( bundleLocations[localeKey] ) {
						targetUrl = bundleLocations[localeKey];
					}
					// load the target URL
					_loadBundle(callback,failcallback,localeKey,targetUrl,defaultTargetUrl);				
				} else {
					var bundle = preferences[localeKey];
					callback(bundle);
				}
				
			}, 
			/**
			 * The failure callback
			 * @param {Object} httpstatus
			 */
			function(httpstatus) {
			    // we have no personal information, 
			    // get the default Locale
				var localeKey = defaultLocale;
				if ( !preferences[defaultLocale] ) {
					var targetUrl = bundleLocations[defaultLocale];
					_loadBundle(callback,failcallback,localeKey,targetUrl,targetUrl);
				} else {
					var bundle = preferences[localeKey];
					callback(bundle);
				}				
		   });
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
	
	/**
		 * Process the string
		 * @param {String} toprocess The string to process
		 * @param {function} callback the callback that gets the processed string
		 * @param {Array} bundleLocations an associative array of locations
		 * @param {String} defaultLocale the default Locale
		 */
	function _process(toprocess,callback,bundleLocations,defaultLocale) {	
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
	
// Import the widget definitions
sdata.lib.Load.requireOnce('/dev/widgets.js');
sdata.events.Listener.onLoad(function() { sdata.widgets.WidgetLoader.insertWidgets(null); });
