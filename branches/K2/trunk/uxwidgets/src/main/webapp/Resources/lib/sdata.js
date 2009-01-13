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
 
/**
 * @static
 * @class Ajax Loader
 */  
sdata.Ajax =  {
	
			
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
			responseType : options.responseType || "text"			
		};
		/**
		 * is the response Ok
		 * @private
		 */
		function httpOk(response) {
			try {
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
		    return data;
		};
		
		var sdata_xmlHttp = new XMLHttpRequest();
		sdata_xmlHttp.open(opt.httpMethod, opt.url, true);
		//sdata_xmlHttp.setRequestHeader("x-ajax-client", "SData Client 1.0");
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
			 	   opt.onSuccess(getResponseData(sdata_xmlHttp, opt.responseType));
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
					//outputData = out.join(boundary) + "--";

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

};
sdata.widgets.Loader.prototype.init = function(divName,loadurl) {
	this.div = divName;
	this.url = loadurl;	
	this.id =  Math.random();	
};

sdata.widgets.Loader.prototype.load = function() {
	var thisobj = this;
	sdata.Ajax.request({
		url : this.url,
		onSuccess : function(response) {
			sdata.widgets.WidgetLoader.sethtmlover(thisobj.div,response);                            
		}
	});	    				
};

/**
 * @static 
 * @class The Main Widget Loader
 * @name sdata.widgets.WidgetLoader
 */
sdata.widgets.WidgetLoader =  {
	/**
	 * Insert inline widgets into divs in the template
	 */
	insertWidgets : function(){

		var divarray = document.getElementsByTagName("div");
		for (var i = 0; i < divarray.length; i++){
			try {
				if (divarray[i].className == "widget_inline"){
	    			var portlet = Widgets.widgets[divarray[i].id.substring(7)];
	    			if ( portlet.loadurl !== null ) {
	    				var divName = new String(portlet.divid);
	    				var loader = new sdata.widgets.Loader();
	    				loader.init(divarray[i].id,portlet.url);
	    				loader.load();	    			
	    			}
	    		}
			} catch (err){}
		}

	},	


	/**
	 * Load Widget HTML
	 * @param div the target div
	 * @param the content of the widget as HTML
	 */
	sethtmlover : function (div,content){
   
   		var anotherone = true;
		var scripttags = new Array();

		while (anotherone === true){
			
			var startscript = content.indexOf("<link");
   			var eindscript = content.indexOf("<\/link>");

			if (startscript !== -1 && eindscript !== -1){
   			
   				var linktag = content.substring(startscript, eindscript);
   				linktag = linktag.substring(linktag.indexOf("href=") + 6);
   				linktag = linktag.substring(0, linktag.indexOf("\""));
				
				if (linktag !== "/flat/resources/css/ext-all.css"){
   			
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
				if (linktag !== "lib/widgetdev.js" && linktag !== "lib/trimpath.js" && linktag !== "lib/json.js" && linktag !== "lib/ajaxform.js" && linktag !== "lib/sdata.js" && linktag !== "/flat/resources/javascript/ext-base.js" && linktag !== "/flat/resources/javascript/ext-all.js"){
					scripttags[scripttags.length] = oScript;
				}

				var tussencontent = content;
				content = tussencontent.substring(0, startscript);
				content += tussencontent.substring(eindscript + 9);
   			
   			} else {

				anotherone = false;

			}

		}

  		document.getElementById(div).innerHTML=content;

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
	get : function(prefname, callback){ 
		var url= "/sdata/p/widgets/" + prefname;
		url = url +"?sid="+Math.random();
		sdata.Ajax.request( {
			url : url,
			onSuccess : function(data) {
				callback(data,true);
			},
			onFail : function(status) {
				callback(status,false);
			}
		});

	},

	/**
	 * Save a preference to a name
	 * @param {string} prefname the preference name
	 * @param prefcontent the content to be saved
	 * @param {function} callback, the call back to call when the save is complete
	 */
	save : function(prefname, prefcontent, callback){
		var cb = callback || function() {}; 
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
			contentType : "multipart/form-data"
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
	 * @return The rendered template
	 * @type String
	 */
	render : function(templateName,contextObject)  {
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
			return sdata.html.Template.templateCache[templateName].process(contextObject);
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

	
// Import the widget definitions
sdata.lib.Load.requireOnce('/flat/widgets.js');
sdata.lib.Load.requireOnce('/flat/resources/javascript/portalLayout.js');
sdata.events.Listener.onLoad(function() { sdata.widgets.WidgetLoader.insertWidgets(); });
