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


/*global $, jQuery, Config, fluid, TrimPath, Widgets, window, document */


/*
 * Namespace that will be used for all of the utility functions related
 * to the mechanism of loading widgets into the document
 */
var sdata = {};
/*
 * Namespace that will be used for all of the widgets that are being loaded
 * into the document. Every widget will have an object called sakai.widgetid
 */
var sakai = sakai || {};


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

        // Sometimes jQuery comes back with a parse-error, although the request
        // was completely successful. In order to prevent the error method to be called
        // in this case, we need this if clause.
        if (requestStatus === 200) {
            if (s.success) {
                s.success(xhr.responseText);
            }
        }
        else {
            // if the sendToLoginOnFail hasn't been set, we assume that we want to redirect when
            // a 403 comes back
            s.sendToLoginOnFail = s.sendToLoginOnFail || true;
            if (requestStatus === 403 && s.sendToLoginOnFail) {

                var decideLoggedIn = function(response, exists){
                    var originalURL = document.location;
                    originalURL = $.URLEncode(originalURL.pathname + originalURL.search + originalURL.hash);
                    var redirecturl = sakai.config.URL.GATEWAY_URL + "?url=" + originalURL;
                    if (exists) {
                        var me = $.evalJSON(response);
                        if (me.preferences && (me.preferences.uuid === "anonymous" || !me.preferences.uuid)) {
                            //document.location = redirecturl;
                        }
                    }
                };

                $.ajax({
                    url: sakai.config.URL.ME_SERVICE,
                    cache: false,
                    success: function(data){
                        decideLoggedIn(data, true);
                    }
                });

            }

        // Handle HTTP conflicts thrown back by K2 (409) (for example when somebody tries to write to the same node at the very same time)
        // We do this by re-sending the original request with the data transparently, behind the curtains, until it succeeds.
        // This still does not eliminate a possibility of another conflict, but greatly reduces
        // the chance and works in the background until the request is successful (ie jQuery will try to re-send the initial request until the response is not 409
        // WARNING: This does not solve the locking/overwriting problem entirely, it merely takes care of high volume request related issues. Users
        // should be notified in advance by the UI when somebody else is editing a piece of content, and should actively try reduce the possibility of
        // overwriting.
        if (requestStatus === 409) {
            // Retry initial post
            $.ajax(s);
        }

        // Call original error handler, but not in the case of 409 as we want that to be transparent for users
        if ((s.error) && (requestStatus !== 409)) {
          s.error(xhr, status, e);
        }

        if (s.global) {
          jQuery.event.trigger("ajaxError", [xhr, status, e]);
        }
          }

    };

})(jQuery);


//////////////////////////////
// Widget loading mechanism //
//////////////////////////////

sdata.widgets = {};

/*
 * Will be used for detecting widget declerations inside the page and load those
 * widgets into the page
 */
sdata.widgets.WidgetLoader = {

    loaded : [],
    widgets : [],

    /**
     * Function that can be called by the container. This will looks for widget declarations
     * within the specified container and will load the widgets in the requested mode (view - settings)
     * @param {Object} id
     *  Id of the HTML container in which we want to look for widget declarations
     * @param {Object} showSettings
     *  true  : render the settings mode of the widget
     *  false : render the view mode of the widget
     */
    insertWidgets : function(id, showSettings, context){
        var obj = sdata.widgets.WidgetLoader.loadWidgets(id, showSettings, context);
        sdata.widgets.WidgetLoader.loaded.push(obj);
    },

    loadWidgets : function(id, showSettings, context){

        // Configuration variables
        var widgetNameSpace = "sakai";
        var widgetSelector = ".widget_inline";

        // Help variables
        var widgets = {}, settings = false;

        /**
         * Inform the widget that is is loaded and execute the main JavaScript function
         * If the widget name is "createsite", then the function sakai.createsite will be executed.
         * @param {String} widgetname The name of the widget
         */
        var informOnLoad = function(widgetname){

            var doDelete;

            // Check if the name of the widget is inside the widgets object.
            if (widgets[widgetname] && widgets[widgetname].length > 0){

                // Run through all the widgets with a specific name
                for (var i = 0, j = widgets[widgetname].length; i<j; i++){
                    widgets[widgetname][i].done++;
                    if (widgets[widgetname][i].done === widgets[widgetname][i].todo){

                         // Save the placement in the widgets variable
                        sdata.widgets.WidgetLoader.widgets[widgets[widgetname][i].uid] = {
                            "placement": widgets[widgetname][i].placement + widgets[widgetname][i].uid + "/" + widgetname,
                            "name" : widgetname
                        };

                        // Run the widget's main JS function
                        var initfunction = window[widgetNameSpace][widgetname];
                        initfunction(widgets[widgetname][i].uid, settings);

                        // Send out a "loaded" event for this widget
                        $(window).trigger(widgetname + "_loaded", [widgets[widgetname][i].uid]);

                        doDelete = true;
                    }
                }

                // Remove the widget from the widgets object (clean up)
                if (doDelete){
                    delete widgets[widgetname];
                }
            }
        };

        /**
         * Locate a tag and remove it from the content
         * @param {String} content The complete content of a file (e.g. <div>...)
         * @param {String} tagName The name of the tag you want to remove (link/script)
         * @param {String} URLIdentifier The part that identifies the URL (href/src)
         */
        var locateTagAndRemove = function(content, tagName, URLIdentifier){
            var returnObject = {
                URL : [],
                content : content
            };
            var regexp = new RegExp('<'+tagName+'.*?'+URLIdentifier+'\\s?=\\s?["|'+'\''+']([^"]*)["|'+'\''+'].*/.*?>', "gi");
            var regexp_match_result = regexp.exec(content);
            while (regexp_match_result !== null) {
                returnObject.URL[returnObject.URL.length] = regexp_match_result[1]; // value of URLIdentifier attrib
                returnObject.content = returnObject.content.replace(regexp_match_result[0],""); // whole tag
                regexp_match_result = regexp.exec(content);
            }
            return returnObject;
        };

        var sethtmlover = function(content,widgets,widgetname){

            var CSSTags = locateTagAndRemove(content, "link", "href");
            content = CSSTags.content;

            for (var i = 0, j = CSSTags.URL.length; i<j; i++) {
                $.Load.requireCSS(CSSTags.URL[i]);
            }

            var JSTags = locateTagAndRemove(content, "script", "src");
            content = JSTags.content;

            for (var widget = 0, k = widgets[widgetname].length; widget < k; widget++){
                var container = $("<div>");
                container.html(content);
                $("#" + widgets[widgetname][widget].uid).append(container);

                widgets[widgetname][widget].todo = JSTags.URL.length;
                widgets[widgetname][widget].done = 0;
            }

            for (var JSURL = 0, l = JSTags.URL.length; JSURL < l; JSURL++){
                $.Load.requireJS(JSTags.URL[JSURL]);
            }

        };

        /**
         * Load the files that the widget needs (HTML/CSS and JavaScript)
         * @param {Object} widgets
         * @param {Object} batchWidgets A list of all the widgets that need to load
         */
        var loadWidgetFiles = function(widgets, batchWidgets){
            var urls = [];

            for(var k in batchWidgets){
                if(batchWidgets.hasOwnProperty(k)){
                    var item = {
                        "url" : k,
                        "method" : "GET"
                    };
                    urls[urls.length] = item;
                }
            }

            if(urls.length > 0){
                $.ajax({
                    url: sakai.config.URL.BATCH,
                    traditional: true,
                    data: {
                        requests: $.toJSON(urls)
                    },
                    success: function(data){
                        for (var i = 0, j = data.length; i<j; i++) {
                            var jsonpath = data[i].url;
                            var widgetname = batchWidgets[jsonpath];

                            // Do i18n on widget content
                            var translated_content = sakai.api.i18n.Widgets.process(widgetname, data[i].body);

                            sethtmlover(translated_content, widgets, widgetname);
                        }
                    }
                });
            }
        };

        /**
         * Insert the widgets into the page
         * @param {String} containerId The id of the container element
         * @param {Boolean} showSettings Show the settings for the widget
         * @param {String} context The context of the widget (e.g. siteid)
         */
        var insertWidgets = function(containerId, showSettings, context){

            // Use document.getElementById() to avoid jQuery selector escaping issues with '/'
            var el = containerId ? document.getElementById(containerId) : $(document.body);

            // Array of jQuery objects that contains all the elements in the with the widget selector class.
            var divarray = $(widgetSelector, el);

            // Check if the showSettings variable is set, if not set the settings variable to false
            settings = showSettings || false;

            // Array that will contain all the URLs + names of the widgets that need to be fetched with batch get
            var batchWidgets = [];

            // Run over all the elements and load them
            for (var i = 0, j = divarray.length; i < j; i++){
                var id = divarray[i].id;
                var split = id.split("_");
                var widgetname = split[1];

                // Set the id for the container of the widget
                var widgetid;
                if (split[2]){
                    widgetid = split[2];
                } else if(widgetname) {
                    widgetid = widgetname + "container";
                }

                // Check if the widget is an iframe or a gwt widget
                if (Widgets.widgets[widgetname] && (Widgets.widgets[widgetname].gwt || Widgets.widgets[widgetname].iframe)){

                    var gwt = Widgets.widgets[widgetname].gwt ? true : false;

                    // Get the information about the widget in the widgets.js file
                    var portlet = Widgets.widgets[widgetname];

                    // Check if the scrolling property has been set to true
                    var scrolling = portlet.scrolling ? "auto" : "no";

                    var src;
                    if(gwt){
                        src = portlet.url + "?placement=" + portlet.placement + "&tuid=" + portlet.uid + "&showSettings=" + settings + "&sid=" + Math.random();
                    }else {
                        src = portlet.url;
                    }

                    // Construct the HTML for the iframe
                    var html = '<div id="widget_content_'+ widgetname + '">' +
                                   '<iframe src="'+ src +'" ' +
                                   'frameborder="0" ' +
                                   'height="'+ portlet.height +'px" ' +
                                   'width="100%" ' +
                                   'scrolling="' + scrolling + '"' +
                                   '></iframe></div>';

                    if(gwt){
                        $("#" + portlet.uid).append(html);
                    }else{
                        // Add the HTML for to the iframe widget container
                        $("#" + widgetid + "_container").html(html).addClass("fl-widget-content").parent().append('<div class="fl-widget-no-options fl-fix"><div class="widget-no-options-inner"><!-- --></div></div>');
                    }
                }

                // The widget isn't a gwt or iframe widget
                else if (Widgets.widgets[widgetname]){

                    // Set the placement for the widget
                    var placement = "";
                    if (split[3] !== undefined){
                        var length = split[0].length + 1 + widgetname.length + 1 + widgetid.length + 1;
                        placement = id.substring(length);
                    } else if (context){
                        placement = context;
                    }

                    // Check if the widget exists
                    if (!widgets[widgetname]){
                        widgets[widgetname] = [];
                    }

                    // Set the initial properties for the widget
                    var index = widgets[widgetname].length;
                    widgets[widgetname][index] = {
                        uid : widgetid,
                        placement : placement,
                        id : id
                    };
                    var floating = "inline_class_widget_nofloat";

                    // Check if the browser supports cssFloat (other browsers) or styleFloat (IE)
                    var styleFloat = jQuery.support.cssFloat ? "cssFloat" : "styleFloat";
                    if (divarray[i].style[styleFloat]) {
                        floating = divarray[i].style[styleFloat] === "left" ? "inline_class_widget_leftfloat" : "inline_class_widget_rightfloat";
                    }
                    widgets[widgetname][index].floating = floating;
                }
            }

            for (i in widgets){
                if (widgets.hasOwnProperty(i)) {
                    for (var ii = 0, jj = widgets[i].length; ii<jj; ii++) {

                        // Replace all the widgets with id "widget_" to widgets with new id's
                        // and add set the appropriate float class
                        $(document.getElementById(widgets[i][ii].id)).replaceWith($('<div id="'+widgets[i][ii].uid+'" class="' + widgets[i][ii].floating + '"></div>'));
                    }

                    var url = Widgets.widgets[i].url;
                    batchWidgets[url] = i; //i is the widgetname
                }
            }

            // Load the HTML files for the widgets
            loadWidgetFiles(widgets, batchWidgets);

        };

        insertWidgets(id, showSettings, context);

        return {
            "informOnLoad" : informOnLoad
        };
    },

    informOnLoad : function(widgetname){
        for (var i = 0, j = sdata.widgets.WidgetLoader.loaded.length; i<j; i++){
            sdata.widgets.WidgetLoader.loaded[i].informOnLoad(widgetname);
        }
    }

};


/////////////////////////////////
// Container Utility functions //
/////////////////////////////////

/*
 * This will expose 2 funcions that can be called by widgets to inform
 * the container that the widget has finished doing things in its settings
 * mode. The container can then do whatever it needs to do according to the
 * context it's in (f.e.: if in the personal dashboard environment, the container
 * will want to render the view mode of that widget, in a site page edit context
 * the container will want to insert the widget into the WYSIWYG editor).
 *
 * This will also allow the container to register 2 functions related to widget
 * settings mode. First of all, the container can register a finish function,
 * which will be executed when a widget notifies the container that it has
 * successfully finished its settings mode. It can also register a cancel
 * function, which will be executed when a widget notifies the container that
 * its settings mode has been cancelled.
 */
sdata.container = {

    toCallOnFinish : false,
    toCallOnCancel : false,

    /**
     * The container can use this to register a function to be executed when a widget notifies the container
     * that its settings mode has been successfully completed.
     * @param {Object} callback
     *  Function that needs to be executed when a widget notifies the container
     *  that its settings mode has been successfully completed.
     */
    registerFinishFunction : function(callback){
        if (callback){
            sdata.container.toCallOnFinish = callback;
        }
    },

    /**
     * The container can use this to register a function to be executed when a widget notifies the container
     * that its settings mode has been cancelled.
     * @param {Object} callback
     *  Function that needs to be executed when a widget notifies the container
     *  that its settings mode has been cancelled.
     */
    registerCancelFunction : function(callback){
        if (callback){
            sdata.container.toCallOnCancel = callback;
        }
    },

    /**
     * Function that can be called by a widget to notify the container that it
     * has successfully completed its settings mode
     * @param {Object} tuid
     *  Unique id (= id of the container this widget is in) of the widget
     * @param {Object} widgetname
     *     Name of the widget as registered in the widget config file(e.g. sites, myprofile, video, ...)
     */
    informFinish : function(tuid, widgetname){
        if (sdata.container.toCallOnFinish){
            sdata.container.toCallOnFinish(tuid, widgetname);
        }
    },

    /**
     * Function that can be called by a widget to notify the container that its
     * settings mode has been cancelled
     * @param {Object} tuid
     *  Unique id (= id of the container this widget is in) of the widget
     * @param {Object} widgetname
     *     Name of the widget as registered in the widget config file(e.g. sites, myprofile, video, ...)
     */
    informCancel : function(tuid, widgetname){
        if (sdata.container.toCallOnCancel){
            sdata.container.toCallOnCancel(tuid, widgetname);
        }
    },

    readyToLoad : false,
    toLoad : [],

    registerForLoad : function(id){
        sdata.container.toLoad[sdata.container.toLoad.length] = id;
        if (sdata.container.readyToLoad){
            sdata.container.performLoad();
        }
    },

    performLoad : function(){
        for (var i = 0, j = sdata.container.toLoad.length; i<j; i++){
            var fct = eval(sdata.container.toLoad[i]);
            try {
                fct();
            } catch (err){
                fluid.log(err);
            }
        }
        sdata.toLoad = [];
    },

    setReadyToLoad : function(set){
        sdata.container.readyToLoad = set;
        if (set){
            sdata.container.performLoad();
        }
    }

};


////////////////////////////////
// Files management functions //
////////////////////////////////

sdata.files = {

    /**
     * Gets all the files and folders under a certain path.
     * @param {String} path The absolute path where we should look for sakai/file, sakai/link and sakai/folder.
     * @param {Object} callback The callback function that should be excecuted when the data is retrieved.
     *         When succesfull data will hold the response of the server.
     *         When the request failed it will hold the status.
     *                 function myCallbackFunction(data, success){
     *                    if (success) {
     *                        //files retrieved successfull
     *                        //Do something with data.
     *                    } else {
     *                        //Error retrieving files.
     *                        //Do something with the status.
     *                    }
     *                }
     */
    getFiles : function(path, callback) {
         $.ajax({
            url: path + ".files.json",
            cache: false,
            success: function(data){
                var json = $.evalJSON(data);
                // Sort the files and folders.
                // Folders come first then files.
                // These are both sorted in a natural way.
                // so z1 > z2 > z30 > z100 > z200 and not
                // z1 > z100 > z2 > z200 > z3
                json.sort(function alphanumCase(a, b){
                    var aType = a["sling:resourceType"];
                    var bType = b["sling:resourceType"];
                    if (aType === "sakai/folder" && bType !== "sakai/folder") {
                        return -1;
                    }
                    else {
                        if (aType !== "sakai/folder" && bType === "sakai/folder") {
                            return 1;
                        }
                        else {
                            sakai.api.Util.Sorting.naturalSort(a.name, b.name);
                        }
                    }
                });
                callback(json, true);
            },
            error: function(xhr, textStatus, thrownError) {
          callback(xhr.status, false);
            }
        });
    },

    /**
     * Gets info about a certain file.
     * @param {String} path The absolute path for the file. Note this only works for nodes of type sakai/file.
     * @param {Object} callback The callback function that should be excecuted when the data is retrieved.
     *         When succesfull data will hold the response of the server.
     *         When the request failed it will hold the status.
     *                 function myCallbackFunction(data, success){
     *                    if (success) {
     *                        //Info retrieved successfull
     *                        //Do something with data.
     *                    } else {
     *                        //Error retrieving info
     *                        //Do something with the status.
     *                    }
     *                }
     */
    getFileInfo : function(path, callback) {
        $.ajax({
            url: path + ".info.json",
            cache: false,
            success: function(data){
                var json = $.evalJSON(data);
                callback(json, true);
            },
            error: function(xhr, textStatus, thrownError) {
        callback(xhr.status, false);
            }
        });
    },
    /**
     * Determines the type of a file by looking at the filename
     * @param {Object} item
     */
    getFileType : function(filename) {
        try {
            var array = filename.split(".");
            var extention = array[array.length - 1].toLowerCase();
            if (extention == "php" || extention === "html" || extention === "xml" || extention === "css" || extention === "js"){
                return "Web document";
            } else if (extention === "doc" || extention === "docx" || extention === "rtf"){
                return "Word file";
            } else if (extention === "exe"){
                return "Program";
            } else if (extention === "mov" || extention === "avi" || extention === "mp4"){
                return "Movie";
            } else if (extention === "fla" || extention === "as" || extention === "flv"){
                return "Flash";
            } else if (extention === "mp3" || extention === "wav" || extention === "midi" || extention === "asf"){
                return "Audio";
            } else if (extention === "pdf"){
                return "PDF file";
            } else if (extention === "png" || extention === "gif" || extention === "jpeg" || extention === "jpg" || extention === "tiff" || extention === "bmp"){
                return "Picture";
            } else if (extention === "ppt" || extention === "pptx" || extention === "pps" || extention === "ppsx"){
                return "Powerpoint";
            } else if (extention === "txt"){
                return "Text file";
            } else if (extention === "xls" || extention === "xlsx"){
                return "Excel";
            } else if (extention === "zip" || extention === "rar"){
                return "Archive";
            } else {
                return "Other";
            }
        } catch (err){
            return "Other";
        }

    }
};

///////////////////////
// Utility functions //
///////////////////////


/*
 * There is no specific logging function within Sakai, but using console.debug will
 * only work in Firefox, and if written poorly, will brake the code in IE, ... If we
 * do want to use logging, we will reuse the logging function available in the Fluid
 * Infusion framework. In order to use this, you need to uncomment the fluid.setLogging(true)
 * line. After this has been done, all calls to
 *    fluid.log(message);
 * will be logged in the most appropriate console
 * NOTE: always disable debugging for production systems, as logging calls are quite
 * expensive.
 */
//fluid.setLogging(false);
fluid.setLogging(true);


/*
 * In order to check whether an array contains an element, use the following function:
 *  $.inArray(valueToMatch, theArray)
 */


/*
 * In order to decode or encode a URL use the following functions:
 * $.URLDecode(string) : URL Decodes the given string
 * $.URLEncode(string) : URL Encodes the given string
 */
$.extend({URLEncode:function(c){var o='';var x=0;c=c.toString();var r=/(^[a-zA-Z0-9_.]*)/;
  while(x<c.length){var m=r.exec(c.substr(x));
    if(m!=null && m.length>1 && m[1]!=''){o+=m[1];x+=m[1].length;
    }else{if(c[x]==' ')o+='+';else{var d=c.charCodeAt(x);var h=d.toString(16);
    o+='%'+(h.length<2?'0':'')+h.toUpperCase();}x++;}}return o;},
URLDecode:function(s){var o=s;var binVal,t;var r=/(%[^%]{2})/;
  while((m=r.exec(o))!=null && m.length>1 && m[1]!=''){b=parseInt(m[1].substr(1),16);
  t=String.fromCharCode(b);o=o.replace(m[1],t);}return o;}
});




/*
 * Function that will take in a string that possibly contains HTML tags and will strip out all
 * of the HTML tags and return a string that doesn't contain any HTML tags anymore.
 */
jQuery.fn.stripTags = function() {
    return this.replaceWith( this.html().replace(/<\/?[^>]+>/gi,''));
};


/*
 * jQuery plugin that will load JavaScript and CSS files into the document at runtime.
 */
(function($){

    $.Load = {};

    /**
     * Generic function that will insert an HTML tag into the head of the document. This
     * will be used to both insert CSS and JS files
     * @param {Object} tagname
     *  Name of the tag we want to insert. This is supposed to be "link" or "script".
     * @param {Object} attributes
     *  A JSON object that contains all of the attributes we want to attach to the tag we're
     *  inserting. The keys in this object are the attribute names, the values in the object
     *  are the attribute values
     */
    var insertTag = function(tagname, attributes){
        var tag = document.createElement(tagname);
        var head = document.getElementsByTagName('head').item(0);
        for (var a in attributes){
            tag[a] = attributes[a];
        }
        head.appendChild(tag);
    };

    /**
     * Load a JavaScript file into the document
     * @param {String} URL of the JavaScript file relative to the parent dom.
     */
    $.Load.requireJS = function(url) {
        insertTag("script", {"src" : url, "type" : "text/javascript", "language" : "JavaScript"});
    };

    /**
     * Load a CSS file into the document
     * @param {String} URL of the CSS file relative to the parent dom.
     */
    $.Load.requireCSS = function(url) {
        insertTag("link", {"href" : url, "type" : "text/css", "rel" : "stylesheet"});
    };

})(jQuery);
