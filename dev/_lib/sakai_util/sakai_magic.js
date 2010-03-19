/**
 *
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
 *
 */

/*global $, jQuery, fluid, TrimPath */

/**
 * @name sakai
 * @namespace
 * Main sakai namespace
 */
var sakai = {};

/**
 * @name sakai.api
 *
 * @namespace
 * Main API Namespace
 *
 * @class api
 *
 * @description
 * Convenience functions to aid Sakai 3 front-end development.
 * This class is the basis of all Sakai 3 front-end development. This should
 * be included on all pages, along with the sakai_api.js which is an extension
 * of this class, providing higher level functions.
 *
 * @requires
 * jQuery-1.3.2, Fluid, Trimpath
 *
 * @version 0.0.1
 *
 */
sakai.api = {

    /** API Major version number */
    API_VERSION_MAJOR: 0,

    /** API minor version number */
    API_VERSION_MINOR: 0,

    /** API build number  */
    API_VERSION_BUILD: 1

};



(function(){



/**
 * @class Communication
 *
 * @description
 * Communication related convenience functions. This should only hold
 * functions which are used across multiple pages, and does not constitute
 * functionality related to a single area/pag
 *
 * @namespace
 * Communication related convenience functions
 */
sakai.api.Communication = sakai.api.Communication || {};


/**
 * Sends a message to a user
 *
 * @param userID {String} The user ID of the recipient
 *
 * @param message {String} The text of the message
 *
 * @returns true or false depending on whether the sending was successful or not
 * @type Boolean
 */
sakai.api.Communication.sendMessageToUser = function(userID, message) {

};

/**
 * Sends a message to all members of a group
 *
 * @param groupID {String} The user ID of the recipient
 *
 * @param message {String} The text of the message
 *
 * @returns true or false depending on whether the sending was successful or not
 * @type Boolean
 */
sakai.api.Communication.sendMessageToGroup = function(groupID, message) {

};

/**
 * Invites a user to become a contact of the logged in user
 *
 * @param groupID {String} The user ID of the recipient
 *
 * @param message {String} The text of the message
 *
 * @returns true or false depending on whether the sending was successful or not
 * @type Boolean
 */
sakai.api.Communication.inviteUser = function(userID) {

};





/**
 * @class Documents
 *
 * @description
 * Document related functionality, file management.This should only hold f
 * unctions which are used across multiple pages, and does not constitute
 * functionality related to a single area/page
 *
 * @namespace
 * Document and file management
 */
sakai.api.Documents = sakai.api.Documents || {};







/**
 * @class Groups
 *
 * @description
 * Group related convenience functions. This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Group related convenience functions
 */
sakai.api.Groups = sakai.api.Groups || {};


/**
 * Adds logged in user to a specified group
 *
 * @param groupID {String} The ID of the group we would like the user to become
 * a member of
 * @param callback {Function} Callback function executed at the end of the
 * operation
 * @returns true or false
 * @type Boolean
 */
sakai.api.Groups.addToGroup = function(groupID, callback) {

};


/**
 * Removes logged in user from a specified group
 *
 * @param groupID {String} The ID of the group we would like the user to be
 * removed from
 * @param callback {Function} Callback function executed at the end of the
 * operation
 *
 * @returns true or false
 * @type Boolean
 */
sakai.api.Groups.removeFromGroup = function(groupID, callback) {

};

/**
 * Returns all the users who are member of a certain group
 *
 * @param groupID {String} The ID of the group we would like to get the members
 * of
 * @param callback {Function} Callback function executed at the end of the
 * operation, containing the member user's data
 *
 * @returns true or false
 * @type Boolean
 */
sakai.api.Groups.getMembers = function(groupID, callback) {

};






/**
 * @class i18n
 *
 * @description
 * Internationalisation related functions for general page content, widget
 * content and UI elements This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Internationalisation
 */
sakai.api.i18n = sakai.api.i18n || {};

/**
 * Start general i18n process
 */
sakai.api.i18n.init = function() {

};

/**
 * Page UI and content related i18n process
 */
sakai.api.i18n.i18nGeneral = function() {

};

/**
 * Widget related i18n process
 */
sakai.api.i18n.i18nWidgets = function() {

};






/**
 * @class l10n
 *
 * @description
 * Localisation related functions for general page content, widget
 * content and UI elements This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Internationalisation
 */
sakai.api.l10n = sakai.api.l10n || {};

/**
 * Start the general l10n process
 */
sakai.api.l10n.init = function() {

};

/**
 * Get the current logged in user's locale
 *
 * @returns The user's locale string in XXX format
 * @type String
 */
sakai.api.l10n.getUserLocale = function() {

};

/**
 * Get a site's locale
 *
 * @returns The site's locale string in XXX format
 * @type String
 */
sakai.api.l10n.getSiteLocale = function() {

};








/**
 * @class Security
 *
 * @description
 * Security and authorisation related related convenience functions
 * This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Security and authorisation related functionality
 */
sakai.api.Security = sakai.api.Security || {};

/** Description - TO DO */
sakai.api.Security.setPermissions = function(target, type, permissions_object) {

};

/** Description - TO DO */
sakai.api.Security.getPermissions = function(target, type, permissions_object) {

};






/**
 * @class Server
 *
 * @description
 * Server communication and batch processing. This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Server related convenience functions and communication
 */
sakai.api.Server = sakai.api.Server || {};

/** Description - TO DO */
sakai.api.Server.batchGet = function() {

};

/** Description - TO DO */
sakai.api.Server.batchPost = function() {

};

/**
 * Saves structured preference data to a specified URL
 *
 * @param pref_url {String} The path to the preference where it needs to be
 * saved
 * @param pref_data {Object} A JSON object of the preference content
 * (max 200 child object of each object)
 * @param callback {Function} A callback function which is executed at the
 * end of the operation
 *
 * @returns {Void}
 */
sakai.api.Server.savePreference = function() {

};

/**
 * Loads structured preference data from a specified URL
 *
 * @param pref_url {String} The path to the preference which needs to be loaded
 * @param callback {Function} A callback function which is executed at the end
 * of the operation
 *
 * @returns {Void}
 */
sakai.api.Server.loadPreference = function() {

};

/**
 * Loads in a CSS file at runtime from a given URL
 *
 * @param url {String} The URL pointing to the required CSS file
 *
 * @returns true or false
 * @type Boolean
 */
sakai.api.Server.requireCSS = function(url) {

};

/**
 * Loads in a JS file at runtime from a given URL
 *
 * @param url {String} The URL pointing to the required JS file
 *
 * @returns true or false
 * @type Boolean
 */
sakai.api.Server.requireJS = function(url) {

};







/**
 * @class Site
 *
 * @description
 * Site related common functionality,
 * This should only hold functions
 * which are used across multiple pages, and does not constitute functionality
 * related to a single area/page
 *
 * @namespace
 * Site related convenience functions
 */
sakai.api.Site = sakai.api.Site || {};


/** Description - TO DO */
sakai.api.Site.updateSettings = function(siteID, settings) {


};

/** Description - TO DO */
sakai.api.Site.addSiteMember = function(userID, siteID, role) {


};

/** Description - TO DO */
sakai.api.Site.removeSiteMember = function(userID, siteID) {


};

/** Description - TO DO */
sakai.api.Site.loadSkin = function(siteID, skinID) {


};






/**
 * @class User
 *
 * @description
 * Advanced user related functionality, especially common actions
 * that originate from a logged in user. This should only hold functions which
 * are used across multiple pages, and does not constitute functionality related
 * to a single area/page
 *
 * @namespace
 * Advanced user related functionality, especially common actions
 * that originate from a logged in user.
 */
sakai.api.User = sakai.api.User || {};








/**
 * @class Util
 *
 * @description
 * General utility functions which implement commonly used low level operations
 * and unifies practices across codebase.
 *
 * @namespace
 * General utility functions
 */
sakai.api.Util = sakai.api.Util || {};


/**
 * URL encodes a given string
 *
 * @param s {String} The string we would like to URL encode
 *
 * @returns Returns the URL encoded string
 * @type String
 */
sakai.api.Util.URLEncode = function(s) {


};

/**
 * URL decodes a given URL encoded string
 *
 * @param s {String} The string we would like to decode
 *
 * @returns Returns the decoded string
 * @type String
 */
sakai.api.Util.URLDecode = function(s) {


};

/**
 * Strip all HTML tags from a given string
 *
 * @param s {String} The string we would like to strip all tags from
 *
 * @returns Returns the input string without tags
 * @type String
 */
sakai.api.Util.stripTags = function(s) {


};


/**
 * @class Sorting
 *
 * @description
 * Sorting algorithms
 *
 * @namespace
 * Sorting functions
 */
sakai.api.Util.Sorting = {

    /**
    * Natural Order sorting algorithm, for sorting file lists etc..
    * @param {Array} unsorted array
    *
    * @returns The sorted array
    * @type Array
    */
   naturalOrder: function(inputArray) {

   }


};








/**
 * @class Widgets
 *
 * @description Widget related convenience functions. This should only hold
 * functions which are used across multiple pages, and does not constitute
 * functionality related to a single area/page
 *
 * @namespace
 * Widget related convenience functions
 */
sakai.api.Widgets = sakai.api.Widgets || {};


/**
 * @class Container
 *
 * @description
 * Widget container functions which assist embedding the widgets into a page
 *
 * @namespace
 * Widget container functions
 *
 */
sakai.api.Widgets.Container = {

    /**
    * Initialises the widget container
    *
    */
    init: function() {

    }
};


/**
 * Loads an instance of a widget
 *
 * @param widgetID {String} The ID of a Widget which needs to be loaded
 * @param callback {Function} The callback function which is called when the
 * loading is complete.
 *
 * @returns true if successful, false if there was an error
 * @type Boolean
 */
sakai.api.Widgets.loadWidget = function(widgetID, callback) {

};

/**
 * Renders an instance of a widget
 *
 * @param widgetID {String} The ID of a Widget which needs to be rendered
 * @returns true if successful, false if there was an error
 * @type Boolean
 */
sakai.api.Widgets.renderWidget = function(widgetID) {

};


})();












/**
 * @name $
 * @namespace
 * jQuery Plugins and overrides for Sakai.
 */


(function($){

    /**
    * Override default jQuery error behavior
    * @function
    * @param s {String} s description
    * @param xhr {Object} xhr object
    * @param status {String} Status message
    * @param e {Object} Thrown error
    */
    $.handleError = function (s, xhr, status, e) {

    };

})(jQuery);



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

    /**
     * A cache that will keep a copy of every template we have parsed so far. Like this,
     * we avoid having to parse the same template over and over again.
     */
    var templateCache = [];

    /**
    * Trimpath Template Renderer: Renders the template with the given JSON object, inserts it into a certain HTML
    * element if required, and returns the rendered HTML string
    * @function
    * @param templateElement {String|Object} templateElement The name of the template HTML ID or a jQuery selection object.
    * @param templateData {Object} JSON object containing the template data
    * @param outputElement {Object} (Optional) jQuery element in which the template needs to be rendered
    */
    $.TemplateRenderer = function (templateElement, templateData, outputElement) {

        var templateName;

        // The template name and the context object should be defined
        if(!templateElement || !templateData){
            throw "$.TemplateRenderer: the template name or the templateData is not defined";
        }

        if(templateElement instanceof jQuery && templateElement[0]){
            templateName = templateElement[0].id;
        }
        else if (typeof templateElement === "string"){
            templateName = templateElement.replace("#", "");
            templateElement = $("#" + templateName);
        }
        else {
            throw "$.TemplateRenderer: The templateElement is not in a valid format or the template couldn't be found.";
        }

        if (!templateCache[templateName]) {
            var templateNode = templateElement.get(0);
            if (templateNode) {
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
                throw "$.TemplateRenderer: The template '" + templateName + "' could not be found";
            }
        }

        // Run the template and feed it the given JSON object
        var render = templateCache[templateName].process(templateData);

        // Check it there was an output element defined
        // If so, put the rendered template in there
        if (outputElement) {
            outputElement.html(render);
        }

        return render;

    };

})(jQuery);



/**
 * @name Array
 * @namespace
 * Array extensions for Sakai
 */
if(Array.hasOwnProperty("indexOf") === false){

    /**
    * Finds the first occurrence of an element in an array and returns its
    * position. This only kicks in when the native .indexOf method is not
    * available in the browser.
    *
    * @param obj {Object/String/Integer} The element we are looking for
    * @param start {Integer} Where the search starts within the array
    *
    * @returns Returns the position of the first matched element
    * @type Integer
    */
    Array.prototype.indexOf = function(obj,start){

        for(var i=(start||0),j=this.length; i<j; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;

    };
}




/**
 * Entry point for functions which needs to automatically start on each page
 * load.
 *
 * @returns {Void}
 */
sakai.api.autoStart = function() {

    // Start Widget container functions
    sakai.api.Widgets.Container.init();

    // Start i18n
    sakai.api.i18n.init();

    // Start l10n
    sakai.api.l10n.init();

};
sakai.api.autoStart();