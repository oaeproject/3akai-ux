/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['exports', 'require', 'jquery', 'underscore', 'oae.api.config', 'jquery.validate', 'trimpath', 'jquery.autosuggest'], function(exports, require, $, _, configAPI) {

    /**
     * Initialize all utility functionality.
     *
     * @param  {Function}   callback            Standard callback function
     * @api private
     */
    var init = exports.init = function(callback) {
        // Set up custom validators
        validation().init();
        // Set up the custom autosuggest listeners
        autoSuggest().init();
        // Set up Google Analytics
        googleAnalytics();
        // Load the OAE TrimPath Template macros
        template().init(callback);
    };

    /**
     * Request a number of static files at once through a static batch request
     *
     * @param  {String[]}       paths               Array of paths that should be retrieved
     * @param  {Function}       callback            Standard callback function
     * @param  {Object}         callback.err        Error object containing error code and message
     * @param  {Object}         callback.response   JSON Object where the keys are the paths to the requested files and values are the content of those static files. An element will be null when the static file could not be found
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
                callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
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
     * Add a cache busting parameter to a URL
     *
     * @param  {String}     url     The URL to add the cache busting parameter to
     * @return {String}             The URL with a cache busting parameter added
     */
    var addCacheBust = exports.addCacheBust = function(url) {
        var $url = $.url(url);
        // If there are no params we'll get {:''}
        // https://github.com/allmarkedup/purl/pull/56
        if (_.isEmpty($url.param()) || $url.param()[''] === '') {
            return url + '?oaeCacheBust=' + generateId();
        }
        return url + '&oaeCacheBust=' + generateId();
    };

    /**
     * Determine whether or not HTML content consists of solely non-textual elements such as white-spaces,
     * line-breaks, empty elements, etc...
     *
     * @param  {String}     html    The HTML content to test for the existence of textual elements
     * @return {Boolean}            `true` if the HTML content is blank, `false` otherwise
     */
    var isBlank = exports.isBlank = function(html) {
        var txt = $('<div>').html(html).text();
        return $.trim(txt) ? false : true;
    };

    /**
     * Change the browser title for a particular page. The browser's title has the following structure
     *
     * Open Academic Environment - Document 1 [- Page 1]
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
        //   `Open Academic Environment - Fragment 1 - Fragment 2`
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
            'encodeForHTMLWithLinks': function(str) {
                return security().encodeForHTMLWithLinks(str);
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
            // Load the activity summary and lists macros through the RequireJS Text plugin
            require(['text!/shared/oae/macros/activity.html', 'text!/shared/oae/macros/list.html'], function(listMacro, activityMacro) {
                // Translate and cache the macros. We require the i18n API here to avoid creating
                // a cyclic dependency
                var i18nAPI = require('oae.api.i18n');
                globalMacros.push(i18nAPI.translate(activityMacro));
                globalMacros.push(i18nAPI.translate(listMacro));
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
         * There are also 3 globally available macros that can be used inside of all TrimPath templates:
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
         *   `${listItem(entityData, [metadata], [showCheckbox])}`
         *
         * - `entityData` is an object representing a user, group or content item or a search result for a user, group
         *    or content item
         * - `metadata` (optional) is a line of metadata information that should be displayed underneath the entity name
         * - `showCheckbox` (optional) will determine whether ot not the checkbox should be shown. By default, the checkbox will be shown to all logged in users
         *
         * 3) Activity summary
         *
         *   `${renderActivitySummary(activity)}`
         *
         * - `activity` is a standard activity object, as specified by the activitystrea.ms specification (@see http://activitystrea.ms/),
         *    for which to generate the activity summary
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
                } catch (parseErr) {
                    throw new Error('Parsing of template "' + templateId + '" failed: ' + parseErr);
                }
            }

            // Render the template
            var renderedHTML = null;
            try {
                // Render the template
                renderedHTML = templateCache[templateId].process(data, {'throwExceptions': true});
                // Filter out comments from the rendered template
                renderedHTML = renderedHTML.replace(/<!--(?:.|\n)*?-->/gm, '');
            } catch (renderErr) {
                throw new Error('Rendering of template "' + templateId + '" failed: ' + renderErr);
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
        };
    };


    ///////////////////
    // NOTIFICATIONS //
    ///////////////////

    // Variable used to track which notifications have already been shown. For example, a notification could be shown for a
    // push notification that indicated that a new comment has been made on a piece of content. However, when the current user
    // is a manager of that piece of content, a top navigation push notification will also be received. This avoids a notification
    // being shown for both
    var notificationIds = [];

    /**
     * Show a Growl-like notification message. A notification can have a title and a message, and will also have
     * a close button for closing the notification. Notifications can be used as a confirmation message, error message, etc.
     *
     * This function is mostly just a wrapper around jQuery.bootstrap.notify.js and supports all of the options documented
     * at https://github.com/goodybag/bootstrap-notify.
     *
     * @param  {String}     [title]       The notification title
     * @param  {String}     message       The notification message that will be shown underneath the title. The message should be sanitized by the caller to allow for HTML inside of the notification
     * @param  {String}     [type]        The notification type. The supported types are `success`, `error` and `info`, as defined in http://twitter.github.com/bootstrap/components.html#alerts. By default, the `success` type will be used
     * @param  {String}     [id]          Unique identifier for the notification, in case a notification can be triggered twice due to some reason. If a second notification with the same id is triggered it will be ignored
     * @throws {Error}                    Error thrown when no message has been provided
     */
    var notification = exports.notification = function(title, message, type, id) {
        if (!message) {
            throw new Error('A valid notification message should be provided');
        }

        if (id) {
            if (_.contains(notificationIds, id)) {
                // A notification with this ID has been triggered already, do not trigger another one
                return;
            }

            notificationIds.push(id);
        }

        // Check if the notifications container has already been created.
        // If the container has not been created yet, we create it and add
        // it to the DOM.
        var $notificationContainer = $('#oae-notification-container');
        if ($notificationContainer.length === 0) {
            $notificationContainer = $('<div>').attr('id', 'oae-notification-container').addClass('notifications top-center');
            $('body').append($notificationContainer);
        }

        // If a title has been provided, we wrap it in an h4 and prepend it to the message
        if (title) {
            message = '<h4>' + security().encodeForHTML(title) + '</h4>' + message;
        }

        // Show the actual notification
        $notificationContainer.notify({
            'fadeOut': {
                'enabled': true,
                'delay': 5000
            },
            'type': type,
            'message': {'html': message},
            'transition': 'slideDown'
        }).show();
    };

    /**
     *  Set up Google Analytics tracking, if it has been enabled for the current tenant
     */
    var googleAnalytics = function() {
        // Check if Google Analytics is enabled for the current tenant
        if (configAPI.getValue('oae-google-analytics', 'google-analytics', 'enabled')) {
            // Google Analytics tracking code
            // @see https://developers.google.com/analytics/devguides/
            (function(i,s,o,g,r,a,m) {i['GoogleAnalyticsObject']=r;i[r]=i[r]||function() {
            (i[r].q=i[r].q||[]).push(arguments);};i[r].l=1*new Date();a=s.createElement(o);
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            // Retrieve the Google Analytics application ID
            var id = configAPI.getValue('oae-google-analytics', 'google-analytics', 'id');

            // Add the OAE identifiers to the Google Analytics object
            ga('create', id, window.location.hostname);
            ga('send', 'pageview');
        }
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
            // Don't allow the field to have more than 1000 characters
            $.validator.addMethod('maxlength-short', function(value, element) {
                return $.trim(value.length) <= 1000;
            });

            // Don't allow the field to have more than 10000 characters
            $.validator.addMethod('maxlength-medium', function(value, element) {
                return $.trim(value.length) <= 10000;
            });

            // Don't allow the field to have more than 100000 characters
            $.validator.addMethod('maxlength-long', function(value, element) {
                return $.trim(value.length) <= 100000;
            });

            // Don't allow spaces in the field
            $.validator.addMethod('nospaces', function(value, element) {
                return this.optional(element) || (value.indexOf(' ') === -1);
            });

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
         * OAE defines the additional validation methods:
         *
         * - `nospaces`: Makes the element require no spaces.
         * - `prependhttp`: Prepends http:// to a URL field if no protocal has been specified.
         *
         * @param  {Element|String}     $form                           jQuery form element or jQuery selector for that form which we want to validate
         * @param  {Object}             [options]                       JSON object containing options to pass to the to the jquery validate plugin, as defined on http://docs.jquery.com/Plugins/Validation/validate#options
         * @param  {Object}             [options.methods]               Extension to the jquery validate options, allowing to specify custom validators. The keys should be the validator identifiers. The value should be an object with a method key containing the validator function and a text key containing the validation message
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
            // as invalid. In that case, we add an `has-error` class to the parent `form-group`
            // element
            options.highlight = function($element) {
                $($element).parents('.form-group').addClass('has-error');
            };

            // Function that will be called when a form field should be marked no longer
            // needs to be marked as invalid. In that case, we remove the `has-error` class from
            // the parent `form-group` element
            options.unhighlight = function($element) {
                $($element).parents('.form-group').removeClass('has-error');
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
                var $helpPlaceholder = $('.help', $element.parents('.form-group'));
                if ($helpPlaceholder.length === 0) {
                    $error.addClass('help-block');
                    $error.insertAfter($element);
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
        };
    };


    ///////////////
    // CLICKOVER //
    ///////////////

    /**
     * Initiate a new clickover dialog. This function is basically a wrapper around the BootstrapX clickover component
     * (https://github.com/lecar-red/bootstrapx-clickover), which in itself is an extension to the Bootstrap popover component.
     * It allows for a popover to be shown in context to the element that triggered it. The main additional benefit to using the
     * BootstrapX clickover component is that it will automatically be closed when clicking outside of the clickover or when hitting
     * the `Esc` button, unless configured otherwise.
     *
     * The clickover will be opened straight away and will be shown below the trigger by default, unless configured otherwise.
     *
     * The following options could be useful for widget clickovers:
     *
     * - options.onShown:  Function that will be executed when the clickover is shown. The argument that will be passed into the callback
     *                     is the root element of the current popover. This function can be useful to initiate things like autosuggests or
     *                     refresh the cached widget $rootel for event bindings.
     * - options.onHidden: Function that will be executed when the clickover is hidden. This function can be useful to kill components in
     *                     the clickover, like infinite scrolls.
     *
     * @param  {Element|String}     $element      jQuery element or jQuery selector for that element that represents the element that triggers the clickover. The clickover will be positioned relative to this element
     * @param  {Element|String}     $content      jQuery element or jQuery selector for the element that should be used as the content of the clickover
     * @param  {Object}             [options]     JSON Object containing options to pass to the BootstrapX clickover component. It supports all of the standard options documented at http://twitter.github.com/bootstrap/javascript.html#popovers and http://www.leecarmichael.com/bootstrapx-clickover/examples.html#
     * @return {Element}                          The root element of the generated clickover
     */
    var clickover = exports.clickover = function($trigger, $content, options) {
        if (!$trigger) {
            throw new Error('A valid trigger element should be provided');
        } else if (!$content) {
            throw new Error('A valid content element should be provided');
        }

        // Make sure the trigger and the content elements are jQuery elements
        $trigger = $($trigger);
        $content = $($content);

        // Merge the default options with the provided options, giving priority
        // to the provided options
        options = options || {};
        var defaultOptions = {
            'global_close': true,
            'html': true,
            'placement': 'bottom',
            'title': ''
        };
        options = $.extend(defaultOptions, options);

        // Cache the `onShown` callback if it has been provided, so the clickover's
        // root element can be passed into the `onShown` callback.
        if (options.onShown) {
            var showCallback = options.onShown;
            options.onShown = function() {
                showCallback(this.$tip);
            };
        }

        // Set the HTML of the content element as the content of the clickover
        options.content = $content.html();

        // Initiate the clickover
        $trigger.clickover(options);

        // Show the clickover
        $trigger.trigger('click');
        // Remove the `popover-title` element that is automatically generated by Bootstrap. When empty,
        // this will cause an accessibility issue. As this is an h3 element, it can also cause the header
        // flow to be incorrect
        $('.popover-title').remove();
    };


    /////////////////
    // AUTOSUGGEST //
    /////////////////

    // Variable that will cache the autosuggest TrimPath templates. The template will only be loaded
    // the first time it is required
    var $autosuggestTemplates = null;

    /**
     * All functionality related to the autosuggest component
     */
    var autoSuggest = exports.autoSuggest = function() {

        /*!
         * Default options that will be used to supplement the provided options.
         * A list of the available options can be found at https://github.com/wuyuntao/jquery-autosuggest
         */
        var defaultOptions = {
            'canGenerateNewSelections': false,
            'minChars': 2,
            'retrieveLimit': 10,
            'url': '/api/search/general',
            'scroll': 117,
            'searchObjProps': 'id, displayName',
            'selectedItemProp': 'displayName',
            'selectedValuesProp': 'id'
        };

        /**
         * Initialize the autosuggest functionality by binding a custom listeners
         * that will be responsible for marking the autosuggest container as if it
         * were a focused input field.
         *
         * @api private
         */
        var init = function() {
            $(document).on('focus', 'ul.as-selections input', function() {
                $(this).parents('ul.as-selections').addClass('as-selections-focus');
            });
            $(document).on('focusout', 'ul.as-selections input', function() {
                $(this).parents('ul.as-selections').removeClass('as-selections-focus');
            });
        };

        /**
         * The HTML that is generated for rendering ghost items and selected items can be found in the
         * `autosuggest.html` templates files. When the first autosuggest is initialised on a page, these
         * templates will be loaded and cached for further usage. If the templates have already been loaded,
         * nothing happens
         *
         * @param  {Function}           callback            Standard callback function
         * @api private
         */
        var getAutosuggestTemplates = function(callback) {
            if (!$autosuggestTemplates) {
                // Load the autosuggest templates through the RequireJS Text plugin
                require(['text!/shared/oae/macros/autosuggest.html'], function(autosuggestTemplates) {
                    // Translate the template. We require the i18n API here to avoid creating a cyclic dependency
                    autosuggestTemplates = require('oae.api.i18n').translate(autosuggestTemplates);
                    $autosuggestTemplates = $('<div>').append(autosuggestTemplates);
                    callback();
                });
            } else {
                callback();
            }
        };

        /**
         * Set up a new autosuggest field. This function is a wrapper around the jQuery AutoSuggest Plugin
         * (https://github.com/wuyuntao/jquery-autosuggest). It allows for a standard input field to be converted
         * into an autosuggest field that can be used to suggest people, groups, content, etc. pulled from one of the
         * back-end feeds.
         *
         * By default, the autosuggest field will show users and groups. This can be overriden through the resouceTypes array
         * that can be passed into the initialization function.
         *
         * This wrapper function will also automatically take care of XSS escaping, as that is something the autoSuggest plugin
         * doesn't deal with itself.
         *
         * The following additions to the standard autosuggest plugin are available:
         *
         *  - Fixed items:         This allows for making items that will be used to pre-fill the autosuggest component to be undeleteable from the
         *                         selection list. In order to make a pre-fill item fixed, the `fixed` property on the preFill item should be set to `true`
         *  - Ghost items:         This allows for adding suggested ghost items to the beginning of the autosuggest component. These can be toggled by
         *                         clicking on them. In order to add a ghost item, the same data format as the `preFill` array can be used. If a ghost item
         *                         should be selected to start off with, the `selected` property on the ghost item should be set to `true`
         *
         * @param  {Element|String}     $element                        jQuery element or jQuery selector for that element that represents the element on which the autosuggest should be initialized
         * @param  {Object}             [options]                       JSON Object containing options to pass to the autosuggest component. It supports all of the standard options documented at https://github.com/wuyuntao/jquery-autosuggest
         * @param  {Object[]}           [options.preFill]               Items that should be pre-filled into the autosuggest field upon initialization
         * @param  {Boolean}            [options.preFill[i].fixed]      Whether or not the pre-filled item should be undeleteable from the selection list
         * @param  {Object[]}           [options.ghost]                 Ghost items that should be added to the autosuggest field upon initialization. This has the same format as `options.preFill`
         * @param  {Boolean}            [options.ghost[i].selected]     Whether or not the ghost item should be selected by default
         * @param  {String}             [options.url]                   URL for the REST endpoint that should be used to fetch the suggested results
         * @param  {Function}           [options.selectionChanged]      Function that will be executed when the selection in the autosuggest field has changed
         * @param  {String[]}           [resourceTypes]                 Array of resourceTypes that should be used for the search. By default, `user` and `group` will be used
         * @param  {Function}           [callback]                      Standard callback function
         * @throws {Error}                                              Error thrown when no source element has been provided
         */
        var setup = function($element, options, resourceTypes, callback) {
            if (!$element) {
                throw new Error('A valid input element should be provided.');
            }

            // Load the autosuggest templates in case they haven't been loaded yet
            getAutosuggestTemplates(function() {

                $element = $($element);

                // We require the i18n API here to avoid creating a cyclic dependency
                var i18nAPI = require('oae.api.i18n');
                // The `startText` is the text that will be shown as the placeholder in the autosuggest field.
                // If no `startText` has been provided, we fall back to the placeholder on the input element. If that
                // hasn't been provided either, we fall back to a default string
                if (!options.startText) {
                    var placeholder = $element.attr('placeholder');
                    options.startText = placeholder ? placeholder : i18nAPI.translate('__MSG__ENTER_NAME_HERE__');
                }
                // The `emptyText` is the text that will be shown when no suggested items could be found.
                // If no `emptyText` has been provided, we fall back to a default string
                if (!options.emptyText) {
                    options.emptyText = i18nAPI.translate('__MSG__NO_RESULTS_FOUND__');
                }

                // Merge the supplied options with the default options. Default options will be overriden
                // by supplied options
                options = _.extend({}, defaultOptions, options);

                // Add the resourceTypes onto the additional querystring parameter that needs to be added to the request.
                // We need to do this as querystring-formatted string as the Autosuggest component is not able to deal with objects.
                if (!resourceTypes) {
                    resourceTypes = ['user', 'group'];
                }
                options.extraParams = options.extraParams || '';
                $.each(resourceTypes, function(index, resourceType) {
                    options.extraParams += '&resourceTypes=' + resourceType;
                });
                // Add the parameter that specifies whether or not results from other tenants need to be included as well
                options.extraParams += '&includeExternal=' + (!configAPI.getValue('oae-tenants', 'tenantprivacy', 'tenantprivate'));

                // By default, the autosuggest component will only show results in the suggested items that actually match the query
                // on one of the fields specified in the `searchObjProps` parameter. However, as we rely on the REST endpoint to do
                // the appropriate filtering and ordering, we undo this behavior by adding a `query` property onto each result that will
                // contain the current search query, causing all results to match and display.
                options.searchObjProps += ',query';

                // XSS escape the preFill items
                if (options.preFill) {
                    $.each(options.preFill, function(index, preFillItem) {
                        preFillItem[options.selectedItemProp] = security().encodeForHTML(preFillItem[options.selectedItemProp]);
                    });
                }

                // XSS escape the ghost items
                if (options.ghosts) {
                    $.each(options.ghosts, function(index, ghostItem) {
                        ghostItem[options.selectedItemProp] = security().encodeForHTML(ghostItem[options.selectedItemProp]);
                    });
                }

                // XSS escape the incoming data from the REST endpoints. We also add the current query
                // onto each result object to make sure that the matching succeeds and all items are
                // shown in the suggested list. If a `retrieveComplete` function has already been provided,
                // we cache it so it can be executed after this
                var retrieveComplete = null;
                if (options.retrieveComplete) {
                    retrieveComplete = options.retrieveComplete;
                }
                options.retrieveComplete = function(data) {
                    // Get the query from the request URL on the Ajax object, as that is the only provided clue
                    // for finding out the search query
                    var query = $.url(this.url).param('q');
                    $.each(data.results, function(index, result) {
                        result.displayName = security().encodeForHTML(result.displayName);
                        result.query = query;
                    });
                    if (retrieveComplete) {
                        return retrieveComplete(data);
                    } else {
                        return data.results;
                    }
                };

                // If no custom suggest list item formatting function is provided, we use the standard formatting
                // function that will render the thumbnail image, displayName and some metadata for each suggested item
                if (!options.formatList) {
                    options.formatList = function(data, elem) {
                        return elem.html(template().render($('#autosuggest-suggested-template', $autosuggestTemplates), {'data': data}));
                    };
                }

                // Function that will be called when an item is attempted to be removed from the autosuggest
                // field. We only remove the element when the element is not fixed and not a ghost. If a
                // `selectionRemoved` function has already been provided, we cache it so it can be executed
                // after this. If the item is fixed, we don't execute the cached `selectionRemoved` function
                var selectionRemoved = null;
                if (options.selectionRemoved) {
                    selectionRemoved = options.selectionRemoved;
                }
                options.selectionRemoved = function(elem) {
                    var isFixed = false;
                    // Check if the removed element was one of the fixed elements in the preFill objects
                    var originalData = $(elem).data('originalData');
                    if (options.preFill) {
                        isFixed = _.some(options.preFill, function(preFilledItem) {
                            return preFilledItem.id === originalData.id && preFilledItem.fixed === true;
                        });
                    }
                    // Check if the removed element was one of the ghost elements in the ghosts objects
                    if (!isFixed && options.ghosts) {
                        isFixed = _.some(options.ghosts, function(ghostItem) {
                            return ghostItem.id === originalData.id;
                        });
                    }

                    // If the item is fixed, we don't do anything
                    if (!isFixed) {
                        if (selectionRemoved) {
                            selectionRemoved(elem);
                        } else {
                            elem.remove();
                        }
                        // Trigger the custom selection changed function
                        if (options.selectionChanged) {
                            options.selectionChanged();
                        }
                    }
                };

                // Function that will be called when an item is added to the autosuggest field. We add the
                // thumbnail picure to the element. If a `selectionAdded` function has already been provided,
                // we cache it so it can be executed after this.
                var selectionAdded = null;
                if (options.selectionAdded) {
                    selectionAdded = options.selectionAdded;
                }
                options.selectionAdded = function(elem) {
                    var $elem = $(elem);
                    // Make sure that the item cannot overflow
                    $elem.addClass('oae-threedots');

                    var originalData = $elem.data('originalData');
                    if (originalData.resourceType) {
                        // Prepend a thumbnail to the item to add to the list
                        var $thumbnail = $('<div>').addClass('oae-thumbnail icon-oae-' + originalData.resourceType);
                        if (originalData.thumbnailUrl) {
                            $thumbnail.append($('<div>')
                                .css('background-image', 'url("' + originalData.thumbnailUrl + '")')
                                .attr('role', 'img')
                                .attr('aria-label', security().encodeForHTMLAttribute(originalData.displayName))
                            );
                        }
                        $elem.prepend($thumbnail);
                    }

                    if (selectionAdded) {
                        selectionAdded(elem);
                    }
                    // Trigger the custom selection changed function
                    if (options.selectionChanged) {
                        options.selectionChanged();
                    }
                };

                // Initialize the autoSuggest field
                var $autoSuggest = $element.autoSuggest(options.url, options);
                var $list = $autoSuggest.parents('ul.as-selections');

                // Remove the delete (x) button from the fixed fields
                if (options.preFill) {
                    $.each(options.preFill, function(index, preFillItem) {
                        if (preFillItem.fixed) {
                            $('li[data-value="' + preFillItem[options.selectedValuesProp] + '"]').addClass('as-fixed-item');
                        }
                    });
                }

                // Add the ghost fields
                if (options.ghosts) {
                    $.each(options.ghosts, function(index, ghostItem) {
                        // Create the list item. An `as-ghost-selected` class will be added to selected ghosts
                        $list.prepend(template().render($('#autosuggest-selected-template', $autosuggestTemplates), {
                            'index': index,
                            'ghostItem': ghostItem,
                            'options': options
                        }));
                        var $li = $('li', $list).first();
                        // Add the original ghost object onto the item
                        $li.data('originalData', ghostItem);

                        // Select/deselect the ghost item when it is clicked
                        $li.on('click', function() {
                            $(this).toggleClass('as-ghost-selected');
                            // Trigger the custom selection changed function
                            if (options.selectionChanged) {
                                options.selectionChanged();
                            }
                        });
                    });
                }

                // Add a label to the autosuggest input field for accessibility
                $('.as-input', $list).before('<label class="oae-aural-text" for="' + $('.as-input', $list).attr('id') + '">' + options.startText + '</label>');

                // Trigger the callback function
                if (_.isFunction(callback)) {
                    callback();
                }
            });
        };

        /**
         * Set the focus on the autosuggest field. This will end up setting the focus on the input field that is used
         * by the autosuggest component to enter the next item in the list
         *
         * @param  {Element|String}     $element             jQuery element or jQuery selector for the container in which the auto suggest was initialized. Note that this will *not* be the same element as the one used to setup the auto suggest.
         * @throws {Error}                                   Error thrown when no source element has been provided
         */
        var focus = function($element) {
            if (!$element) {
                throw new Error('A valid input element should be provided');
            }

            $element = $($element);
            $('.as-selections input.as-input', $element).focus();
        };

        /**
         * Retrieve the selected items in an autosuggest field
         *
         * @param  {Element|String}     $element                            jQuery element or jQuery selector for the container in which the auto suggest was initialized. Note that this will *not* be the same element as the one used to setup the auto suggest
         * @return {Object[]}           selectedItems                       Array of objects representing the selected autosuggest items
         * @return {String}             selectedItems[i].id                 Resource id of the selected item
         * @return {String}             selectedItems[i].displayName        Display name of the selected item
         * @return {String}             selectedItems[i].resourceType       Resource type of the selected item (e.g. user, group, content)
         * @return {String}             [selectedItems[i].thumbnailUrl]     Thumbnail URL for the selected item
         * @return {String}             selectedItems[i].visibility         Visibility for the selected item (i.e. private, loggedin, public)
         * @throws {Error}                                                  Error thrown when no source element has been provided
         */
        var getSelection = function($element) {
            if (!$element) {
                throw new Error('An valid input element should be provided.');
            }

            $element = $($element);

            var selectedItems = [];

            // We cannot use the input.as-values field as that only gives us the IDs and we also need the other basic profile information
            $.each($element.find('.as-selections > li'), function(index, selection) {
                var $selection = $(selection);
                var id = $selection.attr('data-value');
                var selectionData = $selection.data().originalData;
                var isGhostItem = $selection.hasClass('as-ghost-item');
                // jQuery autosuggest will always prepare an empty item for the next item that needs to be
                // added to the list. Therefore, it is possible that an item in the list is empty
                if (id && selectionData) {
                    // In case this is a ghost item, we can only add it when it has been selected.
                    if (!isGhostItem || (isGhostItem && $selection.hasClass('as-ghost-selected'))) {
                        selectedItems.push({
                            'id': id,
                            'displayName': selectionData.displayName,
                            'resourceType': selectionData.resourceType,
                            'thumbnailUrl': selectionData.thumbnailUrl,
                            'visibility': selectionData.visibility
                        });
                    }
                }
            });
            return selectedItems;
        };

        return {
            'init': init,
            'setup': setup,
            'focus': focus,
            'getSelection': getSelection
        };
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
         * @param  {String}     [input]         The user input string that should be sanitized. If this is not provided, an empty string will be returned
         * @return {String}                     The sanitized user input, ready to be put inside of an HTML tag
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
         * @param  {String}     [input]         The user input string that should be sanitized. If this is not provided, an empty string will be returned
         * @param  {String}     [attribute]     The name of the HTML attribute to encode for
         * @return {String}                     The sanitized user input, ready to be put inside of an HTML attribute
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
         * Sanitizes user input in a manner that makes it safe for the input to be placed inside of an HTML tag.
         * This sanitizer will also recognise URLs inside of the provided input and will convert these into links.
         *
         * @param  {String}     [input]         The user input string that should be sanitized. If this is not provided, an empty string will be returned
         * @return {String}                     The sanitized user input, ready to be put inside of an HTML tag with all URLs converted to links
         */
        var encodeForHTMLWithLinks = function(input) {
            if (!input) {
                return '';
            } else {

                // First sanitize the user's input
                input = encodeForHTML(input);

                // URLs starting with http://, https://, or ftp://
                var URLPattern1 = /(\b(https?|ftp):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/gim;
                input = input.replace(URLPattern1, '<a href="$1" target="_blank" title="$1">$1</a>');

                // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
                var URLPattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
                input = input.replace(URLPattern2, '$1<a href="http://$2" target="_blank" title="$2">$2</a>');

                return input;
            }
        };

        /**
         * Sanitizes user input in a manner that it makes safe for the input to be used
         * as a URL fragment
         *
         * @param  {String}     [input]         The user input string that should be sanitized. If this is not provided, an empty string will be returned
         * @return {String}                     The sanitized user input, ready to be used as a URL fragment
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
            'encodeForHTMLWithLinks': encodeForHTMLWithLinks,
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
         * Redirect the currently user to the me page.
         */
        var me = function() {
            window.location = '/me';
        };

        /**
         * Redirect the current user to the 401 page. This can be used when the current user does not have
         * permission to see a certain page. We encode the current URL into the querystring to make sure that
         * the user can be redirected here when signing in.
         */
        var accessdenied = function() {
            window.location = '/accessdenied?url=' + $.url().attr('path');
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
         * that is currently not available
         */
        var unavailable = function() {
            window.location = '/unavailable';
        };

        /**
         * Redirect the current user to the 503 page. This can be used when the user requests a page on a tenant
         * that is currently undergoing maintenance
         */
        var maintenance = function() {
            window.location = '/maintenance';
        };

        return {
            'login': login,
            'me': me,
            'accessdenied': accessdenied,
            'notfound': notfound,
            'unavailable': unavailable,
            'maintenance': maintenance
        };
    };

    /**
     * Function that can be called once a specific page has finished checking for access by the content user, to avoid flickering when
     * the user doesn't have access. This function will then show the page and set the page title
     */
    var showPage = exports.showPage = function() {
        $('body').show();
    };


    ////////////////
    // RESPONSIVE //
    ////////////////

    /**
     * Check if the current browser is a browser on a mobile handheld device
     *
     * @return {Boolean}   `true` when using a mobile browser, `false` when using a desktop browser
     */
    var isHandheldDevice = exports.isHandheldDevice = function() {
        var isHandheld = false;

        _.each([navigator.userAgent || navigator.vendor || window.opera], function(a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                isHandheld = true;
            }
        });

        return isHandheld;
    };

    ///////////////////
    // Accessibility //
    ///////////////////

    var fakeButtonSpaceKeypressHandler = function(e) {
        // Intercept space key presses and trigger click events (as real buttons would)
        if (e.which === " ".charCodeAt(0)) {
            $(e.target).click();
        }
    };

    /**
     * Enables the use of 'fake' button elements under the specified element.
     *
     * Fake button elements are elements tagged with class oae-fake-btn and
     * with role='button'. For example:
     *
     *     <span role='button' class='oae-fake-btn btn btn-link' tabindex='0'>Button Text</span>.
     *
     * Calling this function on an ancestor of a 'fake' button is required to
     * handle user interactions as they would be with a real <button> element.
     *
     * Specifically, this implementation handles space key presses on fake
     * buttons and triggers clicks on the fake button.
     *
     * @param {Element|String} An Element/jQuery collection/jQuery selector string. Fake buttons will be enabled under the element(s) specified.
     */
    var enableFakeButtonsUnder = exports.enableFakeButtonsUnder = function($elem) {
        $($elem).on("keypress", ".oae-fake-btn[role=button]", fakeButtonSpaceKeypressHandler);
    };

});
