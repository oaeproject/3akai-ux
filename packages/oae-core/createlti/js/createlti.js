/*!
 * Copyright 2017 Apereo Foundation (AF) Licensed under the
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

define(['jquery', 'oae.core'], function($, oae) {

    return function(uid) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that keeps track of the current group
        var group = null;

        /**
         * Reset the widget to its original state when the modal dialog is closed
         */
        var setUpReset = function() {
            $('#createlti-modal').on('hidden.bs.modal', function() {
                // Reset the form
                var $form = $('#createlti-form', $rootel);
                $form[0].reset();
                oae.api.util.validation().clear($form);
            });
        };

        /**
         * Create the lti tool. When the lti tool has been created successfully, the user will be redirected
         * to the created tool
         */
        var createLtiTool = function() {
            // Disable the form
            $('#createlti-form *', $rootel).prop('disabled', true);

            // Create the lti
            var url = $('#createlti-url', $rootel).val();
            var secret = $('#createlti-secret', $rootel).val();
            var key = $('#createlti-key', $rootel).val();
            var displayName = $('#createlti-name', $rootel).val();
            var description = $('#createlti-description', $rootel).val();

            oae.api.lti.createLtiTool(group.id, url, secret, key, displayName, description, function(err, data) {
                if (!err) {
                    window.location = data.profilePath;
                } else {
                    // Re-enable the form
                    $('#createlti-form *', $rootel).prop('disabled', false);

                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__LTI_TOOL_NOT_CREATED__', 'createlti'),
                        oae.api.i18n.translate('__MSG__LTI_TOOL_COULD_NOT_BE_CREATED__', 'createlti'),
                        'error');
                }
            });
        };

        /**
         * Initialize the create lti form and validation
         */
        var setUpValidation = function() {
            oae.api.util.validation().validate($('#createlti-form', $rootel), {
                'submitHandler': createLtiTool
            });
        };

        /**
         * Initialize the create lti modal dialog
         */
        var setUpCreateLtiToolModal = function() {
            $(document).on('click', '.oae-trigger-createlti', function() {
                // Request the context profile information
                $(document).trigger('oae.context.get', 'aboutgroup');
            });

            // Receive the context's profile information
            $(document).on('oae.context.send.aboutgroup', function(ev, groupProfile) {
                // Cache the group details
                group = groupProfile;

                $('#createlti-modal', $rootel).modal({
                    'backdrop': 'static'
                });
            });

            // Render the form elements
            oae.api.util.template().render($('#createlti-template', $rootel), {}, $('.modal-body', $rootel));

            $('#createlti-modal', $rootel).on('shown.bs.modal', function () {
                // Set focus to the lti name field
                $('#createlti-name', $rootel).focus();
            });
        };

        setUpReset();
        setUpValidation();
        setUpCreateLtiToolModal();
    };
});
