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
        callback();
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

    // Variable that will cache all of the parsed Trimpath templates. This avoids the same
    // template being parsed over and over again
    var templateCache = [];
    // Trimpath modifiers
    var trimpathModifiers = {
        'safeUserInput': function(str) {
            return security().safeUserInput(str);
        },
        'safeURL': function(str) {
            return security().safeURL(str);
        }
    }
    
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
     * NOTE: The OAE core APIs will automatically be passed into each template render, so they can be
     * called inside of each template without having to explicitly pass it in. There are also two standard
     * TrimPath modifiers that will be available:
     * 
     * - `${value|safeUserInput}`: Should be used for all user input rendered as text
     * - `${value|safeURL}`: Should be used for all user input used as part of a URL
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
     * @throws {Error}                              Error thrown when no template has been provided
     */
    var renderTemplate = exports.renderTemplate = function($template, data, $output, sanitize) {
        // Parameter validation
        if (!$template) {
            throw new Error('No valid template has been provided');
        }

        // Add all of the OAE API functions onto the data object
        data = data || {};
        data['oae'] = require('oae.core');
        // Make underscore available
        data['_'] = require('underscore');
        // Ensure jQuery is available
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

            // TODO: Initialize draggable
            // TODO: Initialize droppable

        } else {
            return renderedHTML;
        }
    };

    /**
     * Show a notification message (either information or error) on the screen
     * 
     * @param  {String}     [title]         The notification title
     * @param  {String}     text            The notification description that will be shown underneath the title
     * @param  {String}     [type]          The notification type. This can be either 'info' or 'error'. If the type is not provided, this will default to 'info'
     * @throws {Error}                      Error thrown when no title has been provided
     */
    var showNotification = exports.showNotification = function(title, text, type) {
        if (!text) {
            throw new Error('A valid body should be provided');
        }

        var notification = {
            'title': title,
            'text': text,
            'image': '/ui/img/notifications_info_icon.png',
            'time': 5000
        }
        // Set a different icon and longer timeout for error notifications 
        if (type === 'error') {
            notification['image'] = '/ui/img/notifications_exclamation_icon.png';
            notification['time'] = 10000;
        }

        // Show the notification on the screen
        $.gritter.add(notification);
    };
    
    /**
     * Register an element that should be hidden when a user clicks outside of it. This could for example be used for dropdowns, etc. Clicking
     * the element itself or any of its children will not cause the element to be hidden
     *
     * @param {String|Element}  $elementToHide      jQuery element or jQuery selector for that element representing the element that should be hidden when clicking outside of it., jquery object, dom element, or array thereof containing the element to be hidden, clicking this element or its children won't cause it to hide
     * @param {String|Element}  $ignoreElements     jQuery element or jQuery selector for that element representing the elements outside of the main element that should not cause a hide when clicked
     * @param {Function}        callback            Standard callback function executed when the element has been hidden
     */
    var hideOnClickOut = exports.hideOnClickOut = function(elementToHide, ignoreElements, callback) {
        $(document).on('click', function(e) {
            var $clicked = $(e.target);
            if (!$.isArray(elementToHide)) {
                elementToHide = [elementToHide];
            }
            $.each(elementToHide, function(index, el) {
                if (el instanceof $) {
                    $el = el;
                } else {
                    $el = $(el);
                }
                if ($el.is(':visible') && ! ($.contains($el.get(0), $clicked.get(0)) || $clicked.is(ignoreElements) || $(ignoreElements).has($clicked.get(0)).length)) {
                    if ($.isFunction(callback)) {
                        callback();
                    } else {
                        $el.hide();
                    }
                }
            });
        });
    };

    /**
     * All functionality related to setting up, showing and closing modal dialogs. This uses the jQuery jqModal plugin behind the scenes. By default,
     * the dialog will be initialized as a modal dialog, unless `modal: false` is passed into the options object. When using jqModal as a modal
     * dialog, keyboard accessibility will be automatically set up as well.
     * 
     * This is an example as to how a modal dialog can be initialized and used.
     * 
     * ```
     * var modal = oae.api.util.modal($('#modal_dialog_id'), options);
     * modal.open();
     * modal.close();
     * ```
     * 
     * @param  {Element|String}     $container       jQuery element representing the element that should become a modal dialog or jQuery selector for that element
     * @param  {Object}             [options]        JSON object containing options to pass to the jqmodal plugin as defined on http://dev.iceburg.net/jquery/jqModal/
     * @throws {Error}                               Error thrown when an invalid container element has been passed in
     */
    var modal = exports.modal = function($container, options) {
        // Parameter validation
        if (!$container) {
            throw new Error('A valid modal dialog container should be provided');
        }

        //Default values
        options = options || {};
        options.modal = options.modal === false ? false : true;
        options.overlay = options.modal ? 20 : 0;
        options.toTop = options.modal ? true : false;

        // Initialize the overlay
        $container = $($container);
        $container.jqm(options);

        /**
         * Open a jqModal dialog.
         */
        var open = function() {
            if (options.modal) {
                // If the overlay is a modal dialog, we position it at the current
                // scroll location, and bind the escape button to close the overlay
                $container.css('top', $(document).scrollTop() + 50 + 'px');
                // Set keyboard accessibility on the modal dialog
                setDialogKeyboardAccessibility();
            }           

            // Show the dialog
            $container.jqmShow();
            // Focus on the first heading in the dialog
            $container.find(':header:visible:first').attr('tabindex', '0').focus();
        };

        /**
         * Set up keyboard accessibility for modal dialogs. When the ESC button is pressed, the dialog will
         * be closed and focus will be returned to the element that had focus before the modal dialog appeared.
         * It will also make sure that a user can't tab outside of the modal dialog
         */
        var setDialogKeyboardAccessibility = function() {
            // Cache the element that has keyboard focus
            var $origFocus = $(':focus');
            $container.off('keydown').on('keydown', function(ev) {
                // We close the modal dialog when the escape button is pressed and return focus to the
                // previously selected element
                if ($container.is(':visible') && $container.has(':focus').length && ev.which === $.ui.keyCode.ESCAPE) {
                    close();
                    $origFocus.focus();
                // If the tab button is pressed, we make sure that focus doesn't leave the modal dialog
                } else if ($container.is(':visible') && ev.which === $.ui.keyCode.TAB) {
                    var $tabbable = $(':tabbable', $container);
                    var focusedIndex = $tabbable.index($(':focus'));
                    // If we shift-tab from the first element, we move to the last tabbable element in the dialog
                    if (ev.shiftKey && $tabbable.length && (focusedIndex === 0)) {
                        $tabbable.last().focus();
                        return false;
                    // If we tab from the last element, we move to the first tabbable element in the dialog
                    } else if (!ev.shiftKey && $tabbable.length && (focusedIndex === $tabbable.length - 1)) {
                        $tabbable.first().focus();
                        return false;
                    }
                }
            });
        };

        /**
         * Close a jqModal dialog.
         */
        var close = function() {
            $container.jqmHide();
        };

        return {
            'open': open,
            'close': close
        };
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
         * In order for forms to have all of the Sakai OAE stylings, the form fields should be wrapped in a div which has the oae-form-field-wrapper class.
         * All input fields should be accompanied by a label, mostly for accessibility purposes. These labels can either be next to the field, in which case
         * they should have the `oae-input-label` class, or they can be above the field, in which case they should have the `oae-input-label-above` class.
         * 
         * The validation messages will be automatically positioned, and will be based on the input element's offsetParent (http://api.jquery.com/offsetParent/)
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
         *      <div class='oae-form-field-wrapper'>
         *          <label for='firstName' class='firstName oae-input-label'>__MSG__FIRSTNAME__</label>
         *          <input type='text' maxlength='255' id='firstName' name='firstName' class='required' placeholder='Hiroyuki'/>
         *          <label for='lastName' class='lastName oae-input-label'>__MSG__LASTNAME__</label>
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
         * @param  {Boolean}            [options.insertAfterLabel]      Extension to the jquery validate options, allowing to specify whether or not the error message should be created after the input field label or before it. This will default to false.
         * @param  {Object}             [options.methods]               Extension to the jquery validate options, allowing to specify custom validators. The keys should be the validator identifiers. The value should be an object with a method key containing the validator function and a text key containing the validation message.
         */
        var validate = function($form, options) {
            if (!$form) {
                throw new Error('A valid form should be provided');
            }
            // Make sure the form is a jQuery element
            $form = $($form);

            options = options || {};

            // By default, we disable validation when a field is clicked, when a key is pressed
            // and when a field loses focus
            options.onclick = options.onclick === true ? true : false;
            options.onkeyup = options.onkeyup === true ? true : false;
            options.onfocusout = options.onfocusout === true ? true : false;

            // We set the element that should be used to create the error message to be a span
            options.errorElement = 'span';
            // We set the error class that should be added to the error message and the form field.
            // This is based on whether or not the error element will be inserted after or before the form field's label
            options.errorClass = options.insertAfterLabel ? 'oae-error-after' : 'oae-error';

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

            // We register the error placement handler. This will be called for each field that
            // fails validation and will be used to customize the placement of the validation messages
            options.errorPlacement = options.errorPlacement || function($error, $element) {
                // We position the validation message so it has the same placement and width as the input field
                $error.css({
                    'width': $element.width(),
                    'margin-left': $element.position().left
                });
                // Set the id on the validation message and set the aria-invalid and aria-describedby attributes
                $error.attr('id', $element.attr('name') + '_error');
                $element.attr('aria-invalid', 'true');
                $element.attr('aria-describedby', $element.attr('name') + '_error');
                // Get the label for the current form field
                var $fieldLabel = $form.find('label[for="' + $element.attr('id') + '"]');
                options.insertAfterLabel ? $error.insertAfter($fieldLabel) : $error.insertBefore($fieldLabel);
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
            // The oae-error or oae-error-after class will be set on both the validation message and
            // the form field that failed validation. When clearing validation, we remove the validation
            // messages, and remove the error class from the input field
            $form.find('span.oae-error, span.oae-error-after').remove();
            $form.find('.oae-error').removeClass('oae-error');
            $form.find('.oae-error-after').removeClass('oae-error-after');
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

    ////////////////////////
    // PROGRESS INDICATOR //
    ////////////////////////

    var progressIndicatorModal = null;

    /**
     * All functionality related to showing and hiding a processing animation, which can be shown when the UI needs to undertake
     * an action that can take a while, like uploading files, etc.
     * 
     * @param  {String}     title           The title to show in the progress indicator overlay
     * @param  {String}     description     The description to show in the progress indicator overlay
     */
    var progressIndicator = exports.progressIndicator = function(title, description) {
        
        // We create the progress indicator and it to the document if it doesn't exist yet
        if (!progressIndicatorModal) {
            var progressIndicatorHTML = '<div id="oae_progressindicator" class="oae-dialog oae-dialog-container oae-hidden">';
                progressIndicatorHTML += '<h1 id="oae_progressindicator_title" class="oae-dialog-header"></h1>';
                progressIndicatorHTML += '<p id="oae_progressindicator_body"></p>';
                progressIndicatorHTML += '<div class="oae-inset-shadow-container"><img src="/ui/img/progress_bar.gif"/></div></div>';
            $('body').prepend($(progressIndicatorHTML));
            progressIndicatorModal = modal($('#oae_progressindicator'), {
                // Make sure the progress indicator is displayed above everything else
                'zIndex': 50000,
            });
        }
        
        /**
         * Show a progress indicator. This will show in a modal dialog and will take over the entire screen. Other screen elements
         * will not be accessible until the progress indicator has been hidden
         */
        var show = function() {
            // Set the title and the description
            $('#oae_progressindicator_title').text(title);
            $('#oae_progressindicator_body').text(description);
            // Show the overlay
            progressIndicatorModal.open();
        };
    
        /**
         * Hide the progress indicator, if it is showing. If it is not showing, nothing will happen
         */
        var hide = function() {
            progressIndicatorModal.close();
        };

        return {
            'show': show,
            'hide': hide
        }    
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
         * Sanitizes user input to prevent XSS attacks. All user-generated content should be run through
         * this function before putting it into the DOM
         * 
         * @param  {String}     [input]     The user input string that should be sanitized. If this is not provided, an empty string will be returned.
         * @return {String}                 The sanitized user input
         */
        var safeUserInput = function(input) {
            if (!input) {
                return '';
            } else {
                return $('<div/>').text(input).html();
            }
        };
        
        /**
         * An extension to encodeURIComponent that does not encode non-ASCII UTF-8 characters. The javascript global  encodeURIComponent 
         * works on the ASCII character set, meaning it encodes all the reserved characters for URI components, and then all characters 
         * above Char Code 127. This uses the regular encodeURIComponent function for ASCII characters, and passes through all higher 
         * char codes. All of this is needed to make sure that UTF-8 elements in URLs are properly shown instead of decoded
         * 
         * @param  {String}     input       URL or part of URL to be encoded.
         * @return {String}                 The encoded URL or URL part
         */
        var safeURL = function(input) {
            if (!input) {
                return '';
            } else {
                var safeURL = '';
                for (var i = 0; i < input.length; i++) {
                    if (input.charCodeAt(i) < 127) {
                        safeURL += encodeURIComponent(input[i]);
                    } else {
                        safeURL += input[i];
                    }
                }
                return safeURL;
            }
        };

        return {
            'safeUserInput': safeUserInput,
            'safeURL': safeURL
        };
    
    };
    
    /**
     * All functionality related to redirecting users to error pages, etc.
     */
    var redirect = exports.redirect = function() {
      
        /**
         * Redirect the currently logged in user to the landing/login page. This can be used when an anonymous user tries to access
         * a page that requires login.
         */
        var redirectToLogin = function() {
            document.location = '/';
        };  
        
        /**
         * Redirect the currently logged in user to the 403 page. This can be used when the currently logged user does not have
         * permission to see a certain page.
         */
        var redirectTo403 = function() {
            document.location = '/403'
        };
        
        /**
         * Redirect the currently logged in user to the 404 page. This can be used when the user requests a page that cannot
         * be found.
         */
        var redirectTo404 = function() {
            document.location = '/404'
        };
        
        return {
            'redirectToLogin': redirectToLogin,
            'redirectTo403': redirectTo403,
            'redirectTo404': redirectTo404
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
