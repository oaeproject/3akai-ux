/*
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

    /**
     * @todo When the 3akai-ux UI is brought in we should use the templating functions in the 3akai-ux API.
     *
     * Trimpath Template Renderer: Renders the template with the given JSON object, inserts it into a certain HTML
     * element if required, and returns the rendered HTML string
     * @param {String|Object} templateElement The name of the template HTML ID or a jQuery selection object.
     * @param {Object} templateData JSON object containing the template data
     * @param {Object} outputElement (Optional) jQuery element in which the template needs to be rendered
     */
    var renderTemplate = function(templateElement, templateData, outputElement) {
        var templateName;

        if (templateElement instanceof jQuery && templateElement[0]) {
            templateName = templateElement[0].id;
        } else {
            templateName = templateElement.replace('#', '');
            templateElement = $('#' + templateName);
        }

        var renderedTemplate = "";
        var templateNode = templateElement.get(0);
        if (templateNode) {
            var firstNode = templateNode.firstChild;
            var template = null;
            // Check whether the template is wrapped in <!-- -->
            if (firstNode && (firstNode.nodeType === 8 || firstNode.nodeType === 4)) {
                template = firstNode.data.toString();
            } else {
                template = templateNode.innerHTML.toString();
            }
            // Parse the template through TrimPath and add the parsed template to the template cache
            try {
                renderedTemplate = TrimPath.parseTemplate(template, templateName);
            } catch (e) {
                console.log('TemplateRenderer: parsing failed: ' + e);
            }
        } else {
            console.log('TemplateRenderer: The template "' + templateName + '" could not be found');
        }

        // Run the template and feed it the given JSON object
        var render = '';
        try {
            render = renderedTemplate.process(templateData, {'throwExceptions': true});
        } catch (err) {
            console.log('TemplateRenderer: rendering of Template \'' + templateName + '\' failed: ' + err);
        }

        // Check it there was an output element defined
        // If so, put the rendered template in there
        if (outputElement) {
            outputElement.html(render);
        }

        return render;
    };

    /**
     * Shows a message to logged in users when they are not authorized to view a page
     */
    var showUnauthorized = function() {
        renderTemplate('admin_unauthorized_template', null, $('#admin_unauthorized_container'));
    };

    /**
     * Shows an error to the user
     * usage:
     * showError({
     *     'title': 'Operation failed',
     *     'message' (required): 'The tenant could not be deleted.'
     * });
     * @param {Object}   data                        Data object used to render the warning. Missing optional elements will not be rendered. All available elements are shown above in 'usage'
     * @param {Object}   $outputElement (optional)   Element to render the warning in. By default the container renders on top of the page in absolute position.
     */
    var showError = function(data, $outputElement) {
        if (!$outputElement) {
            $outputElement = $('#admin_error_container');
        }
        renderTemplate('admin_error_template', {
            'error': data
        }, $outputElement);
    };

    /**
     * Shows a warning to the user
     * usage:
     * showWarning({
     *     'title': 'Are you sure?',
     *     'message' (required): 'Are you sure you want to delete this tenant?'
     * });
     * @param {Object}   data                        Data object used to render the warning. Missing optional elements will not be rendered. All available elements are shown above in 'usage'
     * @param {Object}   $outputElement (optional)   Element to render the warning in. By default the container renders on top of the page in absolute position.
     */
    var showWarning = function(data, $outputElement) {
        if (!$outputElement) {
            $outputElement = $('#admin_warning_container');
        }
        renderTemplate('admin_warning_template', {
            'warning': data
        }, $outputElement);
    };

    /**
     * Shows a success message to the user
     * usage:
     * showSuccess({
     *     'title': 'Tenant deleted.',
     *     'message' (required): 'The tenant was successfully deleted',
     *     'sticky': true
     * });
     * @param {Object}   data                        Data object used to render the success message. Missing optional elements will not be rendered. All available elements are shown above in 'usage'
     * @param {Object}   $outputElement (optional)   Element to render the success message in. By default the container renders on top of the page in absolute position.
     */
    var showSuccess = function(data, $outputElement) {
        if (!$outputElement) {
            $outputElement = $('#admin_success_container');
        }
        renderTemplate('admin_success_template', {
            'success': data
        }, $outputElement);
        if (!data.sticky) {
            window.setTimeout( function(){
                $outputElement.fadeOut('slow', function() {
                    $outputElement.html('');
                    $outputElement.show();
                });
            }, 2500);
        }
    };

    /**
     * Shows a confirmation dialog to the user using predefined data
     * usage
     * showConfirmationModal({
     *     'id' (required): 'deletetenant_modal',
     *     'title' (required): 'Delete tenant Cambridge University',
     *     'message' (required): 'You cannot undo this operation. Are you sure you want to delete this tenant?',
     *     'cancel': 'Cancel',
     *     'confirm' (required): 'Yes, delete tenant',
     *     'confirmclass': (optional): 'danger' (for possible values see http://twitter.github.com/bootstrap/base-css.html#buttons)
     *     'confirmed' (required): function() {
     *         // Add handling for confirmation
     *         // Hide the dialog when done (optionally show a success message)
     *         $('#deletetenant_modal').modal('hide');
     *     }
     * });
     * @param {Object} data Data object used to render the modal dialog. All required elements are shown above in 'usage' and should be provided
     */
    var showConfirmationModal = function(data) {
        var $outputElement = $('#admin_confirmation_container');
        renderTemplate('admin_confirmation_template', {
            'modal': data
        }, $outputElement);
        $('#' + data.id).modal();
        $('#' + data.id + '_confirm', $('#' + data.id)).click(data.confirmed);
    };

    /**
     * Native sort on tenant port
     * @param {Object} data Data returned from the tenant service
     */
    var sortTenantsOnPort = function(data) {
        data.sort(function(a, b){
            return a.port > b.port;
        });
        return data;
    };

    /**
     * Toggles containers to show or hide
     */
    var toggleContainer = function() {
        $(this).next().toggle(400);
    };

    /**
     * Native sort on module title
     * @param {Object} data Data returned from the module service
     */
    var sortModulesOnTitle = function(data) {
        data.sort(function(a, b){
            return a > b;
        });
        return data;
    };

    /**
     * When logged out, the UI presents tabs with available log in strategies.
     * This function switches the view to another strategy when a tab is clicked.
     */
    var switchLoginStrategy = function() {
        var tab = $(this).attr('data-strategy');

        $('.admin_login_tab').removeClass('active');
        $(this).addClass('active');

        $('.admin_login_container').hide();
        $('#' + tab).show();
    };


    /* The following log in and log out functions will be moving to the 3akai API */

    /**
     * Logs the current user out of the admin ui
     */
    var doLogOut = function() {
        $.ajax({
            url: '/api/auth/logout',
            type: 'POST',
            success: function(data) {
                document.location.reload(true);
            }, error: function(err) {
                console.log(err.statusText);
            }
        });
    };

    /**
     * Submits the login form to log a user into the admin ui
     */
    var doLogin = function() {
        if ($(this).hasClass('external_login')) {
            $.ajax({
                url: $(this).attr('action'),
                type: 'GET'
            });
        } else {
            $.ajax({
                url: '/api/auth/login',
                type: 'POST',
                data: {
                    'username': $('#admin_login_form_name').val(),
                    'password': $('#admin_login_form_password').val()
                },
                success: function(data) {
                    document.location.reload(true);
                }, error: function(err) {
                    console.log(err.statusText);
                }
            });
        }
        return false;
    };

    /**
     * Initializes jEditable on fields throughout the UI
     * This initialization will also take care of the form submit to /api/tenant
     */
    var enableInlineEdit = function() {
        $('.jeditable_field').editable(function(value) {
                $.ajax({
                    url: '/api/tenant',
                    type: 'POST',
                    data: {
                        'port': $(this).attr('id'),
                        'name': value
                    }
                });
                return(value);
            }, {
                indicator: 'Saving...',
                tooltip: 'Click to edit name',
                id: 'port',
                name: 'name',
                callback: function(value, settings) {
                    $(this).text(value);
                }
        });
    };

    /**
     * Renders the login view according to the available login strategies
     * @param {Object} strategies the available login strategies
     */
    var showLogin = function(adminContext, configuration) {
        renderTemplate('admin_login_template', {
            'strategies': configuration['oae-authentication'],
            'context': adminContext
        }, $('#admin_login_container'));
    };

    /**
     * Switches the view when a left hand navigation link is clicked or when the page loads.
     * Defaults to the Tenant configuration page when no or an invalid hash is provided.
     * @param {String}    hash    hash as returned by `window.location.hash`
     */
    var switchView = function(hash) {
        hash = hash || '#configurationtenants';
        hash = hash.replace('#', '');
        $('#admin_views > div').hide();
        $('#admin_lhnav_container li').removeClass('active');
        $('#admin_lhnav_container li#' + hash).addClass('active');

        switch (hash) {
            case 'configurationtenants':
                $('#admin_views > #admin_tenants_container').show();
                return;
            case 'configurationmodules':
                $('#admin_views > #admin_modules_container').show();
                return;
        }

        // Default when incorrect page is specified
        switchView('#configurationtenants');
    };
