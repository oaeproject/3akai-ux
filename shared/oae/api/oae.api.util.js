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

define(['exports', 'require', 'jquery', 'underscore', 'jquery.validate', 'trimpath'], function(exports, require, $, _) {

    /**
     * Initialize all utility functionality.
     * 
     * @param  {Function}   callback            Standard callback function
     * @api private
     */
    var init = exports.init = function(callback) {
        // Set up custom validators
        validation().init();
        // Load the OAE TrimPath Template macros
        template().init(callback);
    };

    /**
     * Request a number of static files at once through a static batch request
     * 
     * @param  {String[]}       paths               Array of paths that should be retrieved
     * @param  {Function}       callback            Standard callback function
     * @param  {Object}         callback.err        Error object containing error code and message
     * @param  {Object}         callback.response   JSON Object where the keys are the paths to the requested files and values are the content of those static files. An element will be null when the static file could not be found.
     */
    var staticBatch = exports.staticBatch = function(paths, callback) {
        if (!paths || paths.length === 0) {
            throw new Error('At least one path should be provided to the static batch');
        }

        $.ajax({
            'url': '/api/ui/staticbatch',
            'data': {'files': paths},
            'success': function(data) {
                callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                callback({'code': jqXHR.status, 'msg': jqXHR.statusText});
            }
        });
    };

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
        document.title = require('oae.api.i18n').translate(title.join(' - '));
    };

    ////////////////////////////////
    // TRIMPATH TEMPLATE RENDERER //
    ////////////////////////////////

    // Variable that will cache all of the parsed Trimpath templates. 
    // This avoids the same template being parsed over and over again
    var templateCache = [];
    // Variable that will be used to cache the OAE Trimpath macros for
    // common HTML structures across different pages. This is currently
    // only being used for rendering list view items
    var globalMacros = [];

    /*
     * All functionality related to rendering client-side Trimpath templates
     */
    var template = exports.template = function() {

        // Custom Trimpath modifiers, used for security related escaping purposes
        var trimpathModifiers = {
            'encodeForHTML': function(str) {
                return security().encodeForHTML(str);
            },
            'encodeForHTMLAttribute': function(str) {
                return security().encodeForHTMLAttribute(str);
            },
            'encodeForURL': function(str) {
                return security().encodeForURL(str);
            }
        };

        /**
         * Initialize the template utility functions by fetching and caching 
         * a global macro that can be used for rendering list view items. 
         *
         * @param  {Function}       callback        Standard callback function
         * @api private
         */
        var init = function(callback) {
            // Load the lists macros through the RequireJS Text plugin
            require(['text!/ui/macros/list.html'], function(listMacro) {
                // Cache the macro
                globalMacros.push(listMacro);
                callback();
            });
        };

        /**
         * Functionality that allows you to create HTML Templates, using a JSON object. That template 
         * will then be rendered and all of the values from the JSON object can be used to insert values 
         * into the rendered HTML. More information and examples can be found over here:
         *
         * http://code.google.com/p/trimpath/wiki/JavaScriptTemplates
         *
         * Template should be defined like this:
         *  <div><!--
         *   // Template here
         *  --></div>
         *
         * NOTE: The OAE core APIs will automatically be passed into each template render, so they can be
         * called inside of each template without having to explicitly pass it in. There are also two standard
         * TrimPath modifiers that will be available:
         * 
         * - `${value|encodeForHTML}`: Should be used for all user input rendered as text
         * - `${value|encodeForURL}`: Should be used for all user input used as part of a URL
         * 
         * There are also 2 globally available macros that can be used inside of all TrimPath templates:
         *
         * 1) Thumbnail
         *
         *   `${renderThumbnail(entityData, [addVisibilityIcon], [large])}`
         *
         * - `entityData` is a standard object representing a user, group or content item or a search result for a user, group
         *    or content item as returned by Hilary. Alternatively, a string representing the resourceType or resourceSubType 
         *    (i.e., 'user', 'group', 'content', 'file', 'link', 'collabdoc') can be passed in for an empty/anonymous 
         *    entity thumbnail.
         * - `addVisibilityIcon` (optional) will determine whether or not the visibility icon should be shown. By default, 
         *    the visibility icon will be shown. However, users will not never show a visibility icon.
         * - `large` (optional) determines whether or not a large default thumbnail icon should used. By default, a small icon will be used.
         *
         * 2) List item
         *
         *   `${listItem(entityData, [pagingKey], [metadata], [showCheckbox])}`
         * 
         * - `entityData` is an object representing a user, group or content item or a search result for a user, group
         *    or content item
         * - `metadata` (optional) is a line of metadata information that should be displayed underneath the entity name
         * - `pagingKey` (optional) is the key that should be used for paging through the infinite scroll plugin
         * - `showCheckbox` (optional) will determine whether ot not the checkbox should be shown. By default, the checkbox will be shown to all logged in users
         *
         *
         * IMPORTANT: There should be no line breaks in between the div and the <!-- declarations,
         * because that line break will be recognized as a node and the template won't show up, as
         * it's expecting the comments tag as the first one. This is done because otherwise a template 
         * wouldn't validate in an HTML validator and to make sure that the template isn't visible in the page.
         * 
         * @param  {Element|String}     $template       jQuery element representing the HTML element that contains the template or jQuery selector for the template container.
         * @param  {Object}             [data]          JSON object representing the values used for ifs, fors and value insertions.
         * @param  {Element|String}     [$output]       jQuery element representing the HTML element in which the template output should be put, or jQuery selector for the output container.
         * @return {String}                             The rendered HTML
         * @throws {Error}                              Error thrown when no template has been provided
         */
        var render = function($template, data, $output) {
            // Parameter validation
            if (!$template) {
                throw new Error('No valid template has been provided');
            }

            // Add all of the OAE API functions onto the data object
            data = data || {};
            data['oae'] = require('oae.core');
            // Make underscore available
            data['_'] = require('underscore');

            // Ensure jQuery is available. Since there is a version of jQuery in the global scope, ensure use of
            // either jQuery or $ do not pick up the global-scope on inadvertently.
            data['jQuery'] = require('jquery');
            data['$'] = require('jquery');

            // Add the Trimpath modifiers onto the data object.
            data['_MODIFIERS'] = trimpathModifiers;

            // Make sure that the provided template is a jQuery object
            $template = $($template);
            if ($template.length === 0) {
                throw new Error('The provided template could not be found');
            }

            var templateId = $template.attr('id');
            if (!templateCache[templateId]) {
                // We extract the content from the templates, which is wrapped in <!-- -->
                var templateContent = $template[0].firstChild.data.toString();
                // Prepend the global macros to this template. This is done to make sure that
                // the macros have access to all of the variables in scope of the template
                templateContent = globalMacros.join('') + templateContent;

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

            // If an output element has been provided, we can just render the renderer HTML,
            // otherwise we pass it back to the call function
            if ($output) {
                // Make sure that the provided output is a jQuery object
                $output = $($output);
                $output.html(renderedHTML);
            } else {
                return renderedHTML;
            }
        };

        return {
            'init': init,
            'render': render
        }
    };

    /**
     * Show a Growl-like notification message. A notification can have a title and a message, and will also have
     * a close button for closing the notification. Notifications can be used as a confirmation message, error message, etc.
     *
     * This function is mostly just a wrapper around jQuery.bootstrap.notify.js and supports all of the options documented
     * at http://nijikokun.github.com/bootstrap-notify/.
     * 
     * @param  {String}     [title]       The notification title.
     * @param  {String}     message       The notification message that will be shown underneath the title.
     * @param  {String}     [type]        The notification type. The supported types are `success`, `error` and `info`, as defined in http://twitter.github.com/bootstrap/components.html#alerts. By default, the `success` type will be used.
     * @throws {Error}                    Error thrown when no message has been provided
     */
    var notification = exports.notification = function(title, message, type) {
        if (!message) {
            throw new Error('A valid notification message should be provided');
        }

        // Check if the notifications container has already been created.
        // If the container has not been created yet, we create it and add
        // it to the DOM.
        var $notificationContainer = $('#oae-notification-container');
        if ($notificationContainer.length === 0) {
            $notificationContainer = $('<div>').attr('id', 'oae-notification-container').addClass('notifications top-center');
            $('body').append($notificationContainer);
        }

        // We make sure the notification message is protected against XSS attacks
        message = security().encodeForHTML(message);
        // If a title has been provided, we wrap it in an h4 and prepend it to the message
        if (title) {
            message = '<h4>' + security().encodeForHTML(title) + '</h4>' + message;
        }

        // Show the actual notification
        $notificationContainer.notify({
            'type': type,
            'message': {'html': message},
            'transition': 'slideDown'
        }).show();
    };

    /*!
     * All functionality related to validating forms
     */
    var validation = exports.validation = function() {

        /**
         * Initialize the validation utility functions by adding some custom validators
         * to jquery.validate
         *
         * @api private
         */
        var init = function() {
            // Don't allow spaces in the field
            $.validator.addMethod('nospaces', function(value, element) {
                return this.optional(element) || (value.indexOf(' ') === -1);
            }, require('oae.api.i18n').translate('__MSG__NO_SPACES_ARE_ALLOWED__'));

            // Prepends http if no protocol has been provided
            $.validator.addMethod('prependhttp', function(value, element) {
                if ($.trim(value) !== '' && value.substring(0,7) !== 'http://' && value.substring(0,6) !== 'ftp://' && value.substring(0,8) !== 'https://') {
                    $(element).val('http://' + value);
                }
                return true;
            });
        };

        /**
         * Validate a form using the jquery.validate plugin. This will automatically style the error messages, as well as positioning
         * them appropriately and giving all of the required aria roles for accessibility. This function is mostly just a wrapper around
         * jquery.validate, and supports all of the options supported by jquery.validate (see http://bassistance.de/jquery-plugins/jquery-plugin-validation/)
         * 
         * In order for forms to have the appropriate validation styles, each label and control should be wrapped in an element with a `control-group` class.
         * The label should have a `control-label` class. All input fields should be accompanied by a label, mostly for accessibility purposes. 
         * More information on creating forms (including horizontal forms) can be found at http://twitter.github.com/bootstrap/base-css.html#forms
         * 
         * Validation messages will by default be displayed underneath the input field. If a custom position for the validation needs to provided,
         * a placeholder element with the class `help` should be created inside of the `control-group` element.
         * 
         * Metadata can be added directly onto the HTML fields to tell jquery.validate which validation rules to use. These should be added as a class onto
         * the input field. The available ones are:
         * 
         * - `required`: Makes the element always required.
         * - `email`: Makes the element require a valid email.
         * - `number`: Makes the element require a decimal number.
         * - `url`: Makes the element require a valid url.
         * - `date`: Makes the element require a date.
         * - `dateISO`: Makes the element require a ISO date.
         * - `creditcard`: Makes the element require a creditcard number.
         * 
         * Example:
         * 
         * ```
         * <form id='form_id' role='main'>
         *      <div class='control-group'>
         *          <label for='firstName' class='control-label'>__MSG__FIRSTNAME__</label>
         *          <input type='text' maxlength='255' id='firstName' name='firstName' class='required' placeholder='Hiroyuki'/>
         *      </div>
         *      <div class='control-group'>
         *          <label for='lastName' class='control-label'>__MSG__LASTNAME__</label>
         *          <span class="help"></span>
         *          <input type='text' maxlength='255' id='lastName' name='lastName' class='required' placeholder='Sakai'/>
         *      </div>
         * </div>
         * ```
         * 
         * All other validation configuration should be passed into the options object when calling `oae.api.util.validation().validate($form, options)`.
         * 
         * Sakai OAE defines to additional validation methods:
         * 
         * - `nospaces`: Makes the element require no spaces.
         * - `prependhttp`: Prepends http:// to a URL field if no protocal has been specified.
         * 
         * @param  {Element|String}     $form                           jQuery form element or jQuery selector for that form which we want to validate
         * @param  {Object}             [options]                       JSON object containing options to pass to the to the jquery validate plugin, as defined on http://docs.jquery.com/Plugins/Validation/validate#options
         * @param  {Object}             [options.methods]               Extension to the jquery validate options, allowing to specify custom validators. The keys should be the validator identifiers. The value should be an object with a method key containing the validator function and a text key containing the validation message.
         */
        var validate = function($form, options) {
            if (!$form) {
                throw new Error('A valid form should be provided');
            }
            // Make sure the form is a jQuery element
            $form = $($form);

            options = options || {};

            // We need to first handle the invalid and submit callback inside of this function, in order to set/remove all of the necessary 
            // styles and aria attributes. Therefore, we cache these callback so they can be  called after those functions have finished
            var invalidCallback = null;
            if (options.invalidHandler && $.isFunction(options.invalidHandler)) {
                invalidCallback = options.invalidHandler;
            }
            var submitCallback = null;
            if (options.submitHandler && $.isFunction(options.submitHandler)) {
                submitCallback = options.submitHandler;
            }

            // Register the custom validation methods
            if (options.methods) {
                $.each(options.methods, function(key, value) {
                    $.validator.addMethod(key, value.method, value.text);
                });
            }

            // We register the submit handler. This will be called when the overall form
            // validation has succeeded
            options.submitHandler = function($thisForm, validator) {
                // We clear all the old validation styles
                clear($form);
                // Call the cached invalid handler callback
                if (submitCallback) {
                    submitCallback($thisForm, validator);
                }
                return false;
            };

            // We register the invalid handler. This will be called once when the overall
            // form validation has failed
            options.invalidHandler = function($thisForm, validator) {
                // We clear all the old validation styles
                clear($form);
                // Call the cached invalid handler callback
                if (invalidCallback) {
                    invalidCallback($thisForm, validator);
                }
            };

            // Function that will be called when an invalid form field should be marked
            // as invalid. In that case, we add an `error` class to the parent `control-group`
            // element
            options.highlight = function($element) {
                $($element).parents('.control-group').addClass('error');
            };

            // Function that will be called when a form field should be marked no longer
            // needs to be marked as invalid. In that case, we remove the `error` class from 
            // the parent `control-group` element
            options.unhighlight = function($element) {
                $($element).parents('.control-group').removeClass('error');
            };

            // We register the error placement handler. This will be called for each field that
            // fails validation and will be used to customize the placement of the validation messages
            options.errorPlacement = options.errorPlacement || function($error, $element) {
                // Set the id on the validation message and set the aria-invalid and aria-describedby attributes
                $error.attr('id', $element.attr('name') + '-error');
                $element.attr('aria-invalid', 'true');
                $element.attr('aria-describedby', $element.attr('name') + '-error');
                // Set a class on the error message so it can be easily deleted again
                $error.addClass('oae-error');
                // Check if an error message placehold has been provided. If not, we default
                // to a `help-block` display and insert it after the input field
                var $helpPlaceholder = $('.help', $element.parents('.control-group'));
                if ($helpPlaceholder.length === 0) {
                    $error.addClass('help-block');
                    $error.insertAfter($element)
                } else {
                    $helpPlaceholder.append($error);
                }
            };

            // Set up the form with the provided options in jquery.validate
            $form.validate(options);
        }; 

        /**
         * Clear the validation on a form. This will remove all visible validation styles, as well as the aria roles.
         * 
         * @param  {Element|String}     $form       jQuery form element or jQuery selector for that form for which we want to clear the validation
         * @throws {Error}                          Error thrown when no form has been provided
         */
        var clear = function($form) {
            if (!$form) {
                throw new Error('A valid form should be provided');
            }
            // Make sure the form is a jQuery element
            $form = $($form);
            // The Bootstrap `error` class will be set on the element that has the `control-group` class.
            // When clearing validation, we remove this `error` class. We also remove the actual error
            // messages from the dom
            $form.find('.oae-error').remove();
            $form.find('.error').removeClass('error');
            // When a field is invalid, the aria-invalid attribute on the field will be set to true, and
            // the aria-describedby attribute will be set to point to the validation message. When clearing
            // validation, we remove both of these
            $form.find('*[aria-invalid]').removeAttr('aria-invalid');
            $form.find('*[aria-describedby]').removeAttr('aria-describedby');
        };

        return {
            'init': init,
            'validate': validate,
            'clear': clear
        }
    };

    ////////////////////
    // MATH RENDERING //
    ////////////////////

    /**
     * Using MathJax behind the scenes, find all mathematical function (LaTeX) declarations and render them
     * appropriately. Mathemetical are defined by wrapping them in $$.
     * 
     * Example: $$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$
     * 
     * @param  {Element|String}     [$element]        jQuery element or jQuery selector for that element in which we should look for Mathematical formulas and render them. If this is not provided, the body element will be used.
     */
    var renderMath = exports.renderMath = function($element) {};

    //////////////
    // SECURITY //
    //////////////

    /**
     * All functionality related to handling user input and making sure that it displays properly, without opening the door
     * to XSS attacks. This is a wrapper around the jquery.encode.js library that was developed by OWASP. Documentation on
     * the usage of this plugin can be found at https://github.com/chrisisbeef/jquery-encoder.
     * 
     * All of the different security functions are also available as TrimPath Template modifiers that can be used in the
     * following manner: `${variable|<securityModifier>}`
     */
    var security = exports.security = function() {

        /**
         * Sanitizes user input in a manner that makes it safe for the input to be placed
         * inside of an HTML tag.
         * 
         * @param  {String}     [input]         The user input string that should be sanitized. If this is not provided, an empty string will be returned.
         * @return {String}                     The sanitized user input, ready to be put inside of an HTML tag.
         */
        var encodeForHTML = function(input) {
            if (!input) {
                return '';
            } else {
                return $.encoder.encodeForHTML(input);
            }
        };

        /**
         * Sanitizes user input in a manner that it makes safe for the input to be placed
         * inside of an HTML attribute.
         * 
         * @param  {String}     [input]         The user input string that should be sanitized. If this is not provided, an empty string will be returned.
         * @param  {String}     [attribute]     The name of the HTML attribute to encode for.
         * @return {String}                     The sanitized user input, ready to be put inside of an HTML attribute.
         */
        var encodeForHTMLAttribute = function(input, attribute) {
            if (!input) {
                return '';
            } else {
                // If no attribute name is provided, we provide a dummy attribute
                // name as this is required by the jQuery plugin
                attribute = attribute || 'tmp';
                return $.encoder.encodeForHTMLAttribute(attribute, input, true);
            }
        };

        /**
         * Sanitizes user input in a manner that it makes safe for the input to be used
         * as a URL fragment
         * 
         * @param  {String}     [input]         The user input string that should be sanitized. If this is not provided, an empty string will be returned.
         * @return {String}                     The sanitized user input, ready to be used as a URL fragment.
         */
        var encodeForURL = function(input) {
            if (!input) {
                return '';
            } else {
                return $.encoder.encodeForURL(input);
            }
        };

        return {
            'encodeForHTML': encodeForHTML,
            'encodeForHTMLAttribute': encodeForHTMLAttribute,
            'encodeForURL': encodeForURL
        };
    };

    ///////////////
    // REDIRECTS //
    ///////////////

    /**
     * All functionality related to redirecting users to error pages, etc.
     */
    var redirect = exports.redirect = function() {

        /**
         * Redirect the currently logged in user to the landing/login page. This can be used when an anonymous user tries to access
         * a page that requires login.
         */
        var login = function() {
            window.location = '/';
        };

        /**
         * Redirect the current user to the 401 page. This can be used when the current user does not have
         * permission to see a certain page.
         */
        var accessdenied = function() {
            window.location = '/accessdenied';
        };

        /**
         * Redirect the current user to the 404 page. This can be used when the user requests a page or entity
         * that cannot be found.
         */
        var notfound = function() {
            window.location = '/notfound';
        };

        /**
         * Redirect the current user to the 502 page. This can be used when the user requests a page on a tenant
         * that is currently not available.
         */
        var unavailable = function() {
            window.location = '/unavailable';
        };

        /**
         * Redirect the current user to the 503 page. This can be used when the user requests a page on a tenant
         * that is currently undergoing maintenance.
         */
        var maintenance = function() {
            window.location = '/maintenance';
        };

        return {
            'login': login,
            'accessdenied': accessdenied,
            'notfound': notfound,
            'unavailable': unavailable,
            'maintenance': maintenance
        };
    };

    /**
     * All functionality related to dragging and dropping items
     */
    var dragAndDrop = exports.dragAndDrop = function() {

        /**
         * Make all elements with the oae-draggable-container CSS class inside of the provided container draggable, using
         * jQuery UI behind the scenes.
         * 
         * @param  {Element|String}     [$container]      jQuery element or jQuery selector for the element which will be used as the container to locate draggable items. If this is not provided, the body element will be used.
         * @param  {Object}             [options]         JSON object containing options to pass into jQuery UI, as defined on http://api.jqueryui.com/draggable/
         */
        exports.dragAndDrop.setupDraggable = function($container, options) {};

        /**
         * Make all elements with the oae-droppable-container CSS class inside of the provided container droppable (accept draggable items), using
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
    var showPage = exports.showPage = function() {
        $('body').show();
    };

});
