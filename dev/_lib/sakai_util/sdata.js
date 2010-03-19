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


//////////////////////////////
// Global utility functions //
//////////////////////////////

/*
 *
 */


if(!Array.indexOf) {
    Array.prototype.indexOf = function(obj){
        for(var i = 0, j = this.length; i<j; i++){
            if(this[i] === obj){
                return i;
            }
        }
        return -1;
    };
}

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
                    var redirecturl = Config.URL.GATEWAY_URL + "?url=" + originalURL;
                    if (exists) {
                        var me = $.evalJSON(response);
                        if (me.preferences && (me.preferences.uuid === "anonymous" || !me.preferences.uuid)) {
                            //document.location = redirecturl;
                        }
                    }
                };

                $.ajax({
                    url: Config.URL.ME_SERVICE,
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


///////////////////////////////
// Form serialization plugin //
///////////////////////////////

(function($){

    $.FormBinder = {};

    /**
     * This function will look for input fields, selects and textareas and will get all of the values
     * out and store them in a JSON object. The keys for this object are the names (name attribute) of
     * the form fields. This function is useful as it saves you to do a .val() on every form field.
     * Form fields without a name attribute will be ignored.
     * The object that's returned will looks like this:
     *   {
     *     inputBoxName : "Value 1",
     *     radioButtonGroup : "value2",
     *     checkBoxGroup : ["option1","option2"],
     *     selectElement : ["UK"],
     *     textAreaName : "This is some random text"
     *   }
     * @param {Object} form
     *  This is a jQuery element that represents the container (form, div, ...) in which we want
     *  to serialize all of the filled out values.
     */
    $.FormBinder.serialize = function(form){

        var finalFields = {};
        var fields = $("input, textarea, select", form);

        for (var i = 0; i < fields.length; i++){

            var el = fields[i];
            var name = el.name;
            var nodeName = el.nodeName.toLowerCase();
            var type = el.type.toLowerCase() || "";

            if (name){
                if (nodeName === "input" || nodeName === "textarea") {
                    // Text fields and textareas
                    if (nodeName === "textarea" || (type === "text" || type === "password")) {
                        finalFields[name] = el.value;
                    // Checkboxes
                    } else if (type === "checkbox") {
                        finalFields[name] = finalFields[name] || [];
                        if (el.checked) {
                            finalFields[name][finalFields[name].length] = el.value;
                        }
                    // Radiobuttons
                    } else if (type === "radio" && el.checked) {
                        finalFields[el.name] = el.value;
                    }
                // Select dropdowns
                } else if (nodeName === "select"){
                    // An array as they have possibly mutliple selected items
                    finalFields[name] = [];
                    for (var ii = 0; ii < el.options.length; ii++) {
                        if (el.options[ii].selected) {
                            finalFields[name] = el.options[ii].value;
                        }
                    }
                }
            }
        }

        return finalFields;
    };

    /**
     * This function will find all of the form elements in a given container and will
     * reset all of their values. If it's an input textbox or a textarea, the value will
     * become an empty string. If it's a radio button or a checkbox, all will be unchecked.
     * If it's a select dropdown, then the first element will be selected
     * @param {Object} form
     *  JQuery element that represents the container in which we are
     *  resetting the form fields
     */
    var resetCurrentValues = function(form){
        var fields = $("input, textarea, select", form);
        for (var i = 0; i < fields.length; i++){
            var el = fields[i];
            var nodeName = el.nodeName.toLowerCase();
            var type = el.type.toLowerCase() || "";
            if ((nodeName === "input" && (type === "text" || type === "password")) || nodeName === "textarea"){
                el.value = "";
            } else if (nodeName === "input"){
                el.checked = false;
            } else if (nodeName === "select"){
                el.selectedIndex = 0;
            }
        }
    };

    /**
     * Function that will take in a JSON object and a container and will try to attempt to fill out
     * all form fields according to what's in the JSON object. A useful usecase for this would be to
     * have a user fill out a form, and store the serialization of it directly on the server. When the
     * user then comes back, we can get this value from the server and give that value to this function.
     * This will create the same form state as when it was saved by the user.
     * @param {Object} form
     *  JQuery element that represents the container in which we are
     *  filling out our values
     * @param {Object} json
     *  a JSON object that contains the names of the fields we want to populate (name attribute)
     *  as keys and the actual value (text for input text fields and textareas, and values for
     *  checkboxes, radio buttons and select dropdowns)
     *   {
     *     inputBoxName : "Value 1",
     *     radioButtonGroup : "value2",
     *     checkBoxGroup : ["option1","option2"],
     *     selectElement : ["UK"],
     *     textAreaName : "This is some random text"
     *   }
     */
    $.FormBinder.deserialize = function(form, json){

        resetCurrentValues(form);

        for (var name in json) {
            if (json[name]){
                var els = $('[name=' + name + ']', form);
                for (var i = 0; i < els.length; i++){
                    var el = els[i];
                    var nodeName = el.nodeName.toLowerCase();
                    var type = el.type.toLowerCase() || "";
                    if (nodeName === "textarea" || (nodeName === "input" && (type === "text" || type === "password"))){
                        el.value = json[name];
                    } else if (nodeName === "input" && type === "radio"){
                        if (el.value === json[name]){
                            el.checked = true;
                        }
                    } else if (nodeName === "input" && type === "checkbox"){
                        for (var ii = 0; ii < json[name].length; ii++){
                            if (el.value === json[name][ii]){
                                el.checked = true;
                            }
                        }
                    } else if (nodeName === "select"){
                        for (var select = 0; select < json[name].length; select++){
                            for (var iii = 0; iii < el.options.length; iii++) {
                                if (el.options[iii].value === json[name][select]) {
                                    el.options[iii].selected = true;
                                }
                            }
                        }
                    }
                }
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
                        var initfunction = window[widgetNameSpace][widgetname];
                        initfunction(widgets[widgetname][i].uid, widgets[widgetname][i].placement, settings);
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
                    urls[urls.length] = k;
                }
            }

            if(urls.length > 0){
                $.ajax({
                    url: Config.URL.BATCH_GET,
                    data: {
                        resources: urls
                    },
                    success: function(data){
                        var json = $.evalJSON(data);
                        for (var i = 0, j = json.length; i<j; i++) {
                                var jsonpath = json[i].path;
                                var widgetname = batchWidgets[jsonpath];

                                // Do i18n on widget content
                                var translated_content = $.i18n_widget(widgetname, json[i].data);

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



//////////////////////////////
// Widget Utility Functions //
//////////////////////////////

/**
 * <pre>
 *    In your widget you can use the following functions to save/get widget preferences
 *
 *        * Save a preference with feedback:    var response = WidgetPreference.save(preferencename:String, preferencontent:String, myCallbackFunction);
 *
 *            This will warn the function myCallbackFunction, which should look like this:
 *
 *                function myCallbackFunction(success){
 *                    if (success) {
 *                        //Preference saved successfull
 *                        //Do something ...
 *                    } else {
 *                        //Error saving preference
 *                        //Do something ...
 *                    }
 *                }
 *
 *        * Save a preference without feedback:    var response = WidgetPreference.quicksave(preferencename:String, preferencontent:String);
 *
 *            This will not warn you when saving the preference was successfull or unsuccessfull
 *
 *        * Get the content of a preference:    var response = WidgetPreference.get(preferencename:String, myCallbackFunction);
 *
 *            This will warn the function myCallbackFunction, which should look like this:
 *
 *                function myCallbackFunction(response, exists){
 *                    if (exists) {
 *                        //Preference exists
 *                        //Do something with response ...
 *                    } else {
 *                        //Preference does not exists
 *                        //Do something ...
 *                    }
 *                }
 *     </pre>
 */
sdata.widgets.WidgetPreference =  {
    /**
     * Get a preference from personal storage
     * @param {string} prefname the preference name
     * @param {function} callback the function to call on sucess
     *
     */
    get : function(prefname, callback, requireslogin){
        var url= Config.URL.SDATA_FETCH_PRIVATE_URL.replace(/__USERID__/, sakai.data.me.user.userid) + "/widgets/" + prefname;
        var args = (requireslogin === false ? false : true);
        $.ajax ( {
            url : url,
            cache : false,
            success : function(data) {
                callback(data,true);
            },
            error: function(xhr, textStatus, thrownError) {
                callback(xhr.status,false);
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
    save : function(url, prefname, prefcontent, callback, requireslogin, contentType, resourceType){

        var cb = callback || function() {};
        var args = (requireslogin === false ? false : true);
        var ct = contentType || "text/plain";
        var rt = resourceType || "";

        var boundaryString = "bound"+Math.floor(Math.random() * 9999999999999);
        var boundary = '--' + boundaryString;

        var outputData = boundary + '\r\n' +
                     'Content-Disposition: form-data; name="' + prefname + '"; filename="' + prefname + '"; \r\n'+
                     'Content-Type: '+ ct + '\r\n' +
                     '\r\n'+
                     prefcontent +
                     '\r\n'+
                     boundary + "--";

        $.ajax({
            url :url,
            type : "POST",
            contentType : "multipart/form-data; boundary=" + boundaryString,
            success : function(data) {
                // Set Sling resourceType on node if set by caller (so that search servlet finds it) - TO DO this should eventually be in a batch POST
                // jcr:mixinTypes required to get around 500 thrown by Sling

                if (rt !== "") {
                  $.ajax({
                    url: url+"/"+prefname,
                    type: "POST",
                    data: {
                      "jcr:mixinTypes": "sakai:propertiesmix",
                      "sling:resourceType": rt,
                      "_charset_":"utf-8"
                    },
                    success: function() {
                      cb(data,true);
                    },
                    error: function() {

                    }
                  });
                } else {
                  cb(data,true);
                }

            },
            error: function(xhr, textStatus, thrownError) {
                cb(xhr.status,false);
            },
            data : outputData,
            sendToLoginOnFail: args
        });

     }
};


/////////////////////////////////////
// jQuery TrimPath Template Plugin //
/////////////////////////////////////

/*
 * Functionality that allows you to create HTML Templates and give that template
 * a JSON object. That template will then be rendered and all of the values from
 * the JSON object can be used to insert values into the rendered HTML. More information
 * and examples can be found over here:
 *
 * http://code.google.com/p/trimpath/wiki/JavaScriptTemplates
 *
 * Template should be defined like this:
 *  <div><!--
 *   // Template here
 *  --></div>
 *
 *  IMPORTANT: There should be no line breaks in between the div and the <!-- declarations,
 *  because that line break will be recognized as a node and the template won't show up, as
 *  it's expecting the comments tag as the first one.
 *
 *  We do this because otherwise a template wouldn't validate in an HTML validator and
 *  also so that our template isn't visible in our page.
 */
(function($){

    $.Template = {};

    /**
     * A cache that will keep a copy of every template we have parsed so far. Like this,
     * we avoid having to parse the same template over and over again.
     */
    var templateCache = [];

    /**
     * Renders the template with the given JSON object, inserts it into a certain HTML
     * element if required, and returns the rendered HTML string
     * @param {string|object} templateInstance
     *  the name of the template HTML ID or a jQuery selection object.
     * @param {object} contextObject
     *  The JSON object containing the data to be rendered
     * @param {object} [optional] output
     *  The jQuery element in which the template needs to be rendered
     * @return The rendered HTML string
     */
    $.Template.render = function(templateInstance, contextObject, output) {

        var templateName;

        // The template name and the context object should be defined
        if(!templateInstance || !contextObject){
            throw "$.Template.render: the template name or the contextObject is not defined";
        }

        if(templateInstance instanceof jQuery && templateInstance[0]){
            templateName = templateInstance[0].id;
        }
        else if (typeof templateInstance === "string"){
            templateName = templateInstance.replace("#", "");
            templateInstance = $("#" + templateName);
        }
        else {
            throw "$.Template.render: The templateInstance is not in a valid format or the template couldn't be found.";
        }

        if (!templateCache[templateName]) {
            if (templateInstance.get(0)) {
                var templateNode = templateInstance.get(0);
                var firstNode = templateNode.firstChild;
                var template = null;
                // Check whether the template is wrapped in <!-- -->
                if (firstNode && (firstNode.nodeType === 8 || firstNode.nodeType === 4)) {
                    template = firstNode.data.toString();
                }
                else {
                    template = templateNode.innerHTML.toString();
                }
                // Parse the template through TrimPath and add the parsed template to the template cache
                templateCache[templateName] = TrimPath.parseTemplate(template, templateName);

            }
            else {
                throw "$.Template.render: The template '" + templateName + "' could not be found";
            }
        }

        // Run the template and feed it the given JSON object
        var render = templateCache[templateName].process(contextObject);


        // Check it there was an output element defined
        // If so, put the rendered template in there
        if (output) {
            output.html(render);
        }

        return render;

    };

})(jQuery);


////////////////////////
// jQuery i18n plugin //
////////////////////////

(function($){

    /**
     *
     * @param {Object} toprocess
     *  HTML string in which we want to replace messages. These will have the following
     *  format: __MSG__KEY__
     * @param {Object} localbundle
     *  JSON object where the keys are the keys we expect in the HTML and the values are the translated strings
     * @param {Object} defaultbundle
     *  JSON object where the keys are the keys we expect in the HTML and the values are the translated strings
     *  in the default language
     */
    $.i18n = function(toprocess, localbundle, defaultbundle) {
        var expression = new RegExp("__MSG__(.*?)__", "gm");
        var processed = "";
        var lastend = 0;
        while(expression.test(toprocess)) {
            var replace = RegExp.lastMatch;
            var lastParen = RegExp.lastParen;
            var toreplace = $.i18n.getValueForKey(lastParen);
            processed += toprocess.substring(lastend,expression.lastIndex-replace.length) + toreplace;
            lastend = expression.lastIndex;
        }
        processed += toprocess.substring(lastend);
        return processed;
    };

    $.i18n.getValueForKey = function(key){
        try {
            if (sdata.i18n.localBundle[key]){
                return sdata.i18n.localBundle[key];
            } else {
                throw "Not in local file";
            }
        } catch (notInLocalFile){
            try {
                if (sdata.i18n.defaultBundle[key]){
                    return sdata.i18n.defaultBundle[key];
                } else {
                    throw "Not in default file";
                }
            } catch (notInDefaultFile){
                //fluid.log("i18n key " + key + " was not found in any bundle");
            }
        }
    };

})(jQuery);


/////////////////////////////////////
// jQuery i18n plugin for widgets  //
/////////////////////////////////////

(function($){

    /*
    * Loads up language bundle for the widget, and exchanges messages found in content.
    * If no language bundle found, it attempts to load the default language bundle for the widget, and use that for i18n
    * @param widget_id {String} The ID of the widget
    * @param content {String} The content html of the widget which contains the messages
    * @returns {String} The translated content html
    */

    $.i18n_widget = function(widgetname, widget_html_content) {

        var translated_content = "";
        var current_locale_string = false;
        if (typeof sakai.data.me.user.locale === "object") {
          current_locale_string = sakai.data.me.user.locale.language + "_" + sakai.data.me.user.locale.country;
        }

        // If there is no i18n defined in Widgets, run standard i18n on content
        if (typeof Widgets.widgets[widgetname].i18n !== "object") {
          translated_content = $.i18n(widget_html_content, sdata.i18n.localBundle, sdata.i18n.defaultBundle)
          return translated_content;
        }

        // Load default language bundle for the widget if exists
        if (Widgets.widgets[widgetname]["i18n"]["default"]) {

          $.ajax({
              url: Widgets.widgets[widgetname]["i18n"]["default"],
              async: false,
              success: function(messages_raw) {

                  sdata.i18n.widgets[widgetname] = sdata.i18n.widgets[widgetname] || {};
                  sdata.i18n.widgets[widgetname]["default"] = $.evalJSON(messages_raw);

              },
              error: function(xhr, textStatus, thrownError) {
                  //alert("Could not load default language bundle for widget: " + widgetname);
              }
          });

        }

        // Load current language bundle for the widget if exists
        if (Widgets.widgets[widgetname]["i18n"][current_locale_string]) {

            $.ajax({
                url: Widgets.widgets[widgetname]["i18n"][current_locale_string],
                async: false,
                success: function(messages_raw) {

                    sdata.i18n.widgets[widgetname] = sdata.i18n.widgets[widgetname] || {};
                    sdata.i18n.widgets[widgetname][current_locale_string] = $.evalJSON(messages_raw);
                },
                error: function(xhr, textStatus, thrownError) {
                    //alert("Could not load default language bundle " + current_locale_string + "for widget: " + widgetname);
                }
            });
        }

        // Translate widget name and description
        if ((typeof sdata.i18n.widgets[widgetname][current_locale_string] === "object") && (typeof sdata.i18n.widgets[widgetname][current_locale_string]["name"] === "string")) {
            Widgets.widgets[widgetname]["name"] = sdata.i18n.widgets[widgetname][current_locale_string]["name"];
        }
        if ((typeof sdata.i18n.widgets[widgetname][current_locale_string] === "String") && (typeof sdata.i18n.widgets[widgetname][current_locale_string]["description"] === "string")) {
            Widgets.widgets[widgetname]["name"] = sdata.i18n.widgets[widgetname][current_locale_string]["description"];
        }


        // Change messages
        var expression = new RegExp("__MSG__(.*?)__", "gm");
        var lastend = 0;
        while(expression.test(widget_html_content)) {
            var replace = RegExp.lastMatch;
            var lastParen = RegExp.lastParen;
            var toreplace = $.i18n.widgets_getValueForKey(widgetname, current_locale_string, lastParen);
            translated_content += widget_html_content.substring(lastend,expression.lastIndex-replace.length) + toreplace;
            lastend = expression.lastIndex;
        }
        translated_content += widget_html_content.substring(lastend);

        return translated_content;
    };

    // Get a message key value in priority order: local widget language file -> widget default language file -> system local bundle -> system default bundle
    $.i18n.widgets_getValueForKey = function(widgetname, locale, key){

        if ((typeof sdata.i18n.widgets[widgetname][locale] === "object") && (typeof sdata.i18n.widgets[widgetname][locale][key] === "string")){

            return sdata.i18n.widgets[widgetname][locale][key];

        } else if ((typeof sdata.i18n.widgets[widgetname]["default"][key] === "string") && (typeof sdata.i18n.widgets[widgetname]["default"] === "object")) {

            return sdata.i18n.widgets[widgetname]["default"][key];

        } else if (sdata.i18n.localBundle[key]) {

            return sdata.i18n.localBundle[key];

        } else if (sdata.i18n.defaultBundle[key]) {

            return sdata.i18n.defaultBundle[key];

        }
    };

})(jQuery);



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
                            return 1
                        }
                        else {
                            sakai.sorting.human(a.name, b.name);
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

/* alphanum.js (C) Brian Huisman
 * Based on the Alphanum Algorithm by David Koelle
 * The Alphanum Algorithm is discussed at http://www.DaveKoelle.com
 *
 * Distributed under same license as original
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

sakai.sorting = {};
sakai.sorting.human = function(a, b){
    function chunkify(t){
        var tz = [];
        var x = 0, y = -1, n = 0, i, j;

        while (i = (j = t.charAt(x++)).charCodeAt(0)) {
            var m = (i === 46 || (i >= 48 && i <= 57));
            if (m !== n) {
                tz[++y] = "";
                n = m;
            }
            tz[y] += j;
        }
        return tz;
    }

    var aa = chunkify(a.toLowerCase());
    var bb = chunkify(b.toLowerCase());

    for (var x = 0; aa[x] && bb[x]; x++) {
        if (aa[x] !== bb[x]) {
            var c = Number(aa[x]), d = Number(bb[x]);
            if (c === aa[x] && d === bb[x]) {
                return c - d;
            } else {
                return (aa[x] > bb[x]) ? 1 : -1;
            }
        }
    }

    return aa.length - bb.length;
};


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

/*
 * Parse a JCR date to a JavaScript date object
 */
(function($){

    /**
     * Add leading zeros to a number
     * If you pass 10 as the number and 4 as the count, you get 0010
     * @param {Integer} num The number where you want to add zeros to
     * @param {Integer} count The total length of the string after it is zero padded
     * @return {String} A string with the leading zeros
     */
    $.leadingZero = function(num, count) {
        var numZeropad = num + '';
        while (numZeropad.length < count) {
            numZeropad = "0" + numZeropad;
        }
        return numZeropad;
    }

    /**
     * Parse a JCR date (2009-10-12T10:25:19) to a JavaScript date object
     * @param {String} The JCR date that needs to be converted to a JavaScript date object
     * @return {Date} JavaScript date
     */
    $.ParseJCRDate = function(date) {

        // Check with a regular expression if it is a valid JCR date
        var regex = new RegExp('^(19|20)[0-9][0-9][-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])[T](20|21|22|23|[0-1]?[0-9]):[0-5]?[0-9]:[0-5]?[0-9]$', 'gi');
        var isValid = regex.test(date);
        if(isValid){
            var respondDate = new Date();

            // Split the date and time into 2 different pieces
            var splitDateTime = date.split("T");
            var splitDate = splitDateTime[0].split("-");
            var splitTime = splitDateTime[1].split(":");

            // Set the day/month and year
            respondDate.setFullYear(parseInt(splitDate[0], 10));
            respondDate.setMonth(parseInt(splitDate[1], 10) - 1);
            respondDate.setDate(parseInt(splitDate[2], 10));

            // Set the hours/minutes/seconds and milliseconds
            // Since the milliseconds aren't supplied, we always set it to 0
            respondDate.setHours(parseInt(splitTime[0], 10), parseInt(splitTime[1], 10), parseInt(splitTime[2], 10), 0);

            return respondDate;
        }else{

            // Log a message if there is a bad date format
            fluid.log("Bad JCR date format: " + date);
            return null;
        }
    };

    /**
     * Parse a JavaScript date object to a JCR date string (2009-10-12T10:25:19)
     * @param {Object} date JavaScript date object
     * @return {String} a JCR date string
     */
    $.ToJCRDate = function(date){

        // Check if the date that was passed to this function is actually a JavaScript date
        try{

            // Reutn the JCR date as a string
            return "" + date.getFullYear() + "-" + $.leadingZero((date.getMonth()+1), 2) + "-" + $.leadingZero(date.getDate(), 2) + "T"
            +  $.leadingZero(date.getHours(), 2) + ":" +  $.leadingZero(date.getMinutes(), 2) + ":" +  $.leadingZero(date.getSeconds(), 2);

        } catch(ex) {

            // Log a message if there is a bad JavaScript date format
            fluid.log("Bad JavaScript date format: " + date);
            return null;
        }
    };

})(jQuery);
