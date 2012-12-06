/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'jquery', 'underscore', 'oae/api/oae.api.i18n', 'vendor/js/trimpath'], function(exports, $, _, i18nAPI) {

    /**
     * Request a number of static files at once through a static batch request
     * 
     * @param  {String[]}       urls                Array of URLs that should be retrieved
     * @param  {Function}       callback            Standard callback function
     * @param  {Object}         callback.err        Error object containing error code and message
     * @param  {String[]}       callback.response   Array containing the content of the static files, preserving the order of the original array. An element will be null when the static file could not be found.
     */
    var staticBatch = exports.staticBatch = function(urls, callback) {};
    
    /**
     * Generate a random ID. This ID generator does not guarantee global uniqueness.
     * The generated id will have the following format: `oae-<random number>-<random number>`
     * 
     * @return {String}         Generated random ID
     */
    var generateId = exports.generateId = function() {
        return 'oae-' + Math.round(Math.random() * 10000000) + '-' + Math.round(Math.random() * 10000000);
    };
    
    /**
     * Change the browser title for a particular page. The browser's title has the following structure
     * 
     * Sakai OAE - Sakai Doc 1 [- Page 1]
     * 
     * Where the first part will be fixed.
     * 
     * @param  {String|String[]}     title       The new page title or an array of strings representing the fragments of the page title
     * @throws {Error}                           Error thrown when no page title has been provided
     */
    var setBrowserTitle = exports.setBrowserTitle = function(title) {
        if (!title) {
            throw new Error('No valid page title has been provided');
        }

        // Convert to an array if a string has been provided
        if (_.isString(title)) {
            title = [title];
        }
        // Render the page title with the following format
        //   `Sakai OAE - Fragment 1 - Fragment 2`
        title.splice(0, 0, '__MSG__TITLE_PREFIX__');
        document.title = i18nAPI.translate(title.join(' - '));
    };
    
    ////////////////////////////////
    // TRIMPATH TEMPLATE RENDERER //
    ////////////////////////////////
    
    // TODO: We want to switch Trimpath out for a better maintained HTML templating engine at some point
    
    /*!
     * Variable that will cache all of the parsed Trimpath templates. This avoids the same
     * template being parsed over and over again
     */
    var templateCache = []
    
    /**
     * Functionality that allows you to create HTML Templates, using a JSON object. That template 
     * will then be rendered and all of the values from  the JSON object can be used to insert values 
     * into the rendered HTML. More information and examples can be found over here:
     *
     * http://code.google.com/p/trimpath/wiki/JavaScriptTemplates
     *
     * Template should be defined like this:
     *  <div><!--
     *   // Template here
     *  --></div>
     *
     * IMPORTANT: There should be no line breaks in between the div and the <!-- declarations,
     * because that line break will be recognized as a node and the template won't show up, as
     * it's expecting the comments tag as the first one.
     *
     * This is done because otherwise a template wouldn't validate in an HTML validator and
     * to make sure that the template isn't visible in the page.
     * 
     * @param  {Element|String}     $template       jQuery element representing the HTML element that contains the template or jQuery selector for the template container.
     * @param  {Object}             [data]          JSON object representing the values used for ifs, fors and value insertions.
     * @param  {Element|String}     [$output]       jQuery element representing the HTML element in which the template output should be put, or jQuery selector for the output container.
     * @param  {Boolean}            [sanitize]      Whether or not to sanitize the rendered HTML (in order to prevent XSS attacks). By default, sanitization will be done.
     * @return {String}                             The rendered HTML
     * @throws {Error}                              Error thrown when no template or template data has been provided
     */
    var renderTemplate = exports.renderTemplate = function($template, data, $output, sanitize) {
        // Parameter validation
        if (!$template) {
            throw new Error('No valid template has been provided');
        } else if (!data) {
            throw new Error('No template data has been provided');
        }
        
        // Make sure that the provided template is a jQuery object
        if (_.isString($template)) {
            $template = $('#' + $template);
        }
        if ($template.length === 0) {
            throw new Error('The provided template could not be found');
        }

        var templateId = $template.attr('id');
        if (!templateCache[templateId]) {
            // We extract the content from the templates, which is wrapped in <!-- -->
            var templateContent = $template[0].firstChild.data.toString();

            // Parse the template through TrimPath and add the 
            // parsed template to the template cache
            try {
                templateCache[templateId] = TrimPath.parseTemplate(templateContent, templateId);
            } catch (err) {
                throw new Error('Parsing of template "' + templateId + '" failed: ' + err);
            }
        }

        // Render the template
        var renderedHTML = null;
        try {
            renderedHTML = templateCache[templateId].process(data, {'throwExceptions': true});
        } catch (err) {
            throw new Error('Rendering of template "' + templateId + '" failed: ' + err);
        }

        // TODO: Sanitize HTML

        // If an output element has been provided, we can just render the renderer HTML,
        // otherwise we pass it back to the call function
        if ($output) {
            // Make sure that the provided output is a jQuery object
            $output = $($output);
            $output.html(renderedHTML);

            // TODO: Initialize draggable
            // TODO: Initialize droppable

        } else {
            return renderedHTML;
        }
    };
    
    /**
     * Show a notification message (either information or error) on the screen
     * 
     * @param  {String}     title           The notification title
     * @param  {String}     [description]   The notification description that will be shown underneath the title
     * @param  {String}     [type]          The notification type. This can be either 'info' or 'error'. If the type is not provided, this will default to 'info'
     */
    var showNotification = exports.showNotification = function(title, description, type) {};
    
    /**
     * Register an element that should be hidden when a user clicks outside of it. This could for example be used for dropdowns, etc. Clicking
     * the element itself or any of its children will not cause the element to be hidden
     *
     * @param {String|Element}  $elementToHide      jQuery element or jQuery selector for that element representing the element that should be hidden when clicking outside of it., jquery object, dom element, or array thereof containing the element to be hidden, clicking this element or its children won't cause it to hide
     * @param {String|Element}  $ignoreElements     jQuery element or jQuery selector for that element representing the elements outside of the main element that should not cause a hide when clicked
     * @param {Function}        callback            Standard callback function executed when the element has been hidden
     */
    var hideOnClickOut = exports.hideOnClickOut = function($elementToHide, $ignoreElements, callback) {};
    
    /**
     * All functionality related to setting up, showing and closing modal dialogs. This uses the jQuery jqModal plugin behind the scenes.
     * 
     * @param  {Element|String}     $container       jQuery element representing the element that should become a modal dialog or jQuery selector for that element
     * @param  {Object}             [options]        JSON object containing options to pass to the jqmodal plugin as defined on http://dev.iceburg.net/jquery/jqModal/
     */
    var modal = exports.modal = function($container, options) {
        
        var that = {};
        
        /**
         * Open a jqModal dialog that has already been set up
         * 
         * @param  {Element|String}     $container       jQuery element representing the modal dialog that should be opened. If the dialog has not been set up first, this will not work.
         */
        that.open = function() {};
        
        /**
         * Close a jqModal dialog that has been set up
         * 
         * @param  {Element|String}     $container       jQuery element representing the modal dialog that should be closed.
         */
        that.close = function($container) {};
    
        return that;
    };
    
    /**
     * All functionality related to validating forms
     */
    var validation = exports.validation = function() {
        
        /**
         * Validate a form
         * 
         * @param  {Element|String}     $form       jQuery form element or jQuery selector for that form which we want to validate
         * @param  {Object}             [options]   JSON object containing options to pass to the to the jquery validate plugin, as defined on http://docs.jquery.com/Plugins/Validation/validate#options
         */
        exports.validation.validate = function($form, options) {}; 
        
        /**
         * Clear the validation on a form. This will remove all visible validation styles.
         * 
         * @param  {Element|String}     $form       jQuery form element or jQuery selector for that form for which we want to clear the validation
         */
        exports.validation.clear = function($form) {};
    
    };
    
    /**
     * Truncate a string so it fits inside of the space it has available. Behind the scenes, this uses the jQuery threedots plugin and '...' will be used 
     * when a string needs to be truncated, otherwise the original string will remain unchanged. 
     * 
     * @param  {String}             text        String that needs truncating
     * @param  {Number}             width       The desired maximum width of the text
     * @param  {Object}             options     JSON object containing options to pass to the threedots plugin, as defined in http://tpgblog.com/2009/12/21/threedots-the-jquery-ellipsis-plugin/
     * @param  {String|String[]}    [classes]   CSS class or array of CSS classes to take into account when calculating.
     * @return {String}                         The truncated string
     */
    var threeDots = exports.threeDots = function(text, width, options, classes) {};
    
    /**
     * All functionality related to showing and hiding a processing animation, which can be shown when the UI needs to undertake
     * an action that can take a while, like uploading files, etc.
     */
    var progressIndicator = exports.progressIndicator = function() {
        
        /**
         * Show a progress indicator. This will show in a modal dialog and will take over the entire screen. Other screen elements
         * will not be accessible until the progress indicator has been hidden
         * 
         * @param  {String}     title           The title to show in the progress indicator overlay
         * @param  {String}     description     The description to show in the progress indicator overlay
         */
        exports.progressIndicator.show = function(title, description) {};
    
        /**
         * Hide the progress indicator, if it is showing. If it is not showing, nothing will happen
         */
        exports.progressIndicator.hide = function() {};
    
    };
    
    /**
     * Using MathJax behind the scenes, find all mathematical function (LaTeX) declarations and render them
     * appropriately. Mathemetical are defined by wrapping them in $$.
     * 
     * Example: $$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$
     * 
     * @param  {Element|String}     [$element]        jQuery element or jQuery selector for that element in which we should look for Mathematical formulas and render them. If this is not provided, the body element will be used.
     */
    var renderMath = exports.renderMath = function($element) {};
    
    /**
     * All functionality related to handling user input and making sure that it displays properly, without opening the door
     * to XSS attacks
     */
    var security = exports.security = function() {
        
        /**
         * Sanitizes HTML content to prevent XSS attacks. All user-generated content should be run through
         * this function before putting it into the DOM
         * 
         * @param  {String}     input       The HTML string that should be sanitized
         * @return {String}                 The sanitized HTML string
         */
        exports.security.saneHTML = function(input) {};
        
        /**
         * An extension to encodeURIComponent that does not encode i18n characters when using UTF-8.  The javascript global 
         * encodeURIComponent works on the ASCII character set, meaning it encodes all the reserved characters for URI components, 
         * and then all characters above Char Code 127. This uses the regular encodeURIComponent function for ASCII characters, 
         * and passes through all higher char codes. All of this is needed to make sure that UTF-8 elements in URLs are properly
         * shown instead of decoded
         * 
         * @param  {String}     input       URL or part of URL to be encoded.
         * @return {String}                 The encoded URL or URL part
         */
        exports.security.safeURL = function(input) {};
        
        /**
         * Encodes the HTML characters inside a string so that the HTML characters (e.g. <, >, ...)
         * are treated as text and not as HTML entities
         * 
         * @param  {String}     input       The string to HTML escape
         * @return {String}                 The escaped string
         */
        exports.security.escapeHTML = function(input) {};
        
        /**
         * Unescapes HTML entities in a string
         * 
         * @param  {String}     input       The HTML escaped string to unescape
         * @return {String}                 The unescaped string
         */
        exports.security.unescapeHTML = function(input) {};
    
    };
    
    /**
     * All functionality related to redirecting users to error pages, etc.
     */
    var redirect = exports.redirect = function() {
      
        /**
         * Redirect the currently logged in user to the landing/login page. This can be used when an anonymous user tries to access
         * a page that requires login.
         */
        exports.redirect.redirectToLogin = function() {};  
        
        /**
         * Redirect the currently logged in user to the 403 page. This can be used when the currently logged user does not have
         * permission to see a certain page.
         */
        exports.redirect.redirectTo403 = function() {};
        
        /**
         * Redirect the currently logged in user to the 404 page. This can be used when the user requests a page that cannot
         * be found.
         */
        exports.redirect.redirectTo404 = function() {};
        
    };
    
    /**
     * All functionality related to dragging and dropping items
     */
    var dragAndDrop = exports.dragAndDrop = function() {
        
        /**
         * Make all elements with the s3d-draggable-container CSS class inside of the provided container draggable, using
         * jQuery UI behind the scenes.
         * 
         * @param  {Element|String}     [$container]      jQuery element or jQuery selector for the element which will be used as the container to locate draggable items. If this is not provided, the body element will be used.
         * @param  {Object}             [options]         JSON object containing options to pass into jQuery UI, as defined on http://api.jqueryui.com/draggable/
         */
        exports.dragAndDrop.setupDraggable = function($container, options) {};
        
        /**
         * Make all elements with the s3d-droppable-container CSS class inside of the provided container droppable (accept draggable items), using
         * jQuery UI behind the scenes.
         * 
         * @param  {Element|String}     [$container]      jQuery element or jQuery selector for the element which will be used as the container to locate draggable items. If this is not provided, the body element will be used.
         * @param  {Object}             [options]         JSON object containing options to pass into jQuery UI, as defined on http://api.jqueryui.com/droppable/
         */
        exports.dragAndDrop.setupDroppable = function($container, options) {};
        
    };
    
    /**
     * Function that can be called once a specific page has finished checking for access by the content user, to avoid flickering when
     * the user doesn't have access. This function will then show the page and set the page title.
     */
    var showPage = exports.showPage = function() {};

});