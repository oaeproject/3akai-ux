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

define(['jquery', 'oae.core'], function ($, oae) {

    return function (uid) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that keeps track of the people and groups to share this discussion with
        var members = [];
        var managers = [];

        // Variable that keeps track of the selected visibility for the discussion to create
        var visibility = null;

        // Generate a widget ID for the new instance of the `setpermissions` widget. This widget ID
        // will be used in the event communication between this widget and the `setpermissions` widget.
        var setPermissionsId = oae.api.util.generateId();

        // Variable that keeps track of the current context
        var contextData = null;

        /**
         * Reset the widget to its original state when the modal dialog is closed
         */
        var setUpReset = function() {
            $('#creatediscussion-modal', $rootel).on('hidden.bs.modal', function() {
                // Reset the form
                var $form = $('#creatediscussion-form', $rootel);
                $form[0].reset();
                oae.api.util.validation().clear($form);
                showOverview();

                // Unbind the setpermissions handler
                $(document).off('oae.setpermissions.changed.' + setPermissionsId);
            });
        };

        /**
         * Initialize the create collabdoc form and validation
         */
        var setUpCreateDiscussion = function() {
            var validateOpts = {
                'submitHandler': createDiscussion
            };
            oae.api.util.validation().validate($('#creatediscussion-form', $rootel), validateOpts);
        };

        /**
         * Show the permissions widget to allow for updates in visiblity and members
         */
        var showPermissions = function() {
            // Hide all containers
            $('.modal-body > div:visible', $rootel).hide();
            $('#creatediscussion-form > .modal-footer', $rootel).hide();
            // Show the permissions container
            $('#creatediscussion-permissions-container', $rootel).show();
        };

        /**
         * Show the main panel of the widget
         */
        var showOverview = function() {
            // Hide all containers
            $('.modal-body > div:visible', $rootel).hide();
            // Show the overview container
            $('#creatediscussion-form > .modal-footer', $rootel).show();
            $('#creatediscussion-overview-container', $rootel).show();
        };

        /**
         * Load the `setpermissions` widget into this widget. That widget will take care of permission
         * management (visibility + sharing) of the discussion
         */
        var setUpSetPermissions = function() {
            // Remove the previous `setpermissions` widget
            var $setPermissionsContainer = $('#creatediscussion-permissions-container', $rootel);
            $setPermissionsContainer.html('');

            // When the current context is the current user, the configured default tenant visibility for discussions
            // will be used as the default visibility. Otherwise, the visibility of the current context will be
            // used as the default visibility
            if (contextData.id === oae.data.me.id) {
                visibility = oae.api.config.getValue('oae-discussions', 'visibility', 'discussion');
            } else {
                visibility = contextData.visibility;
            }

            // Event that will be triggered when permission changes have been made in the `setpermissions` widget
            $(document).on('oae.setpermissions.changed.' + setPermissionsId, function(ev, data) {
                // Update visibility for discussion
                visibility = data.visibility || visibility;

                // Update members of the document
                if (data.members) {
                    managers = [];
                    members = [];
                    
                    _.each(data.members, function(role, id) {
                        if (role === 'manager') {
                            managers.push(id);
                        } else {
                            members.push(id);
                        }
                    });

                    _.each(data.invitations, function(invitation, id) {
                        if (invitation.role === 'manager') {
                            managers.push(id);
                        } else {
                            members.push(id);
                        }
                    });
                }

                // Add the permissions summary
                $('#creatediscussion-permissions', $rootel).html(data.summary);

                // Switch back to the overview
                showOverview();
            });

            // Event that will be triggered when permission changes have been cancelled
            $(document).on('oae.setpermissions.cancel.' + setPermissionsId, showOverview);

            // Always add the created discussion to the current user's discussion library
            var preFill = [{
                'displayName': oae.api.i18n.translate('__MSG__MY_DISCUSSIONS__'),
                'id': oae.data.me.id,
                'fixed': true
            }];

            // If the current user is creating the discussion from a within a group,
            // the group is added as a fixed item as well
            if (contextData.id !== oae.data.me.id) {
                preFill.push($.extend({'fixed': true}, contextData));
            }

            // Load the `setpermissions` widget into its container
            oae.api.widget.insertWidget('setpermissions', setPermissionsId, $setPermissionsContainer, false, {
                'count': 1,
                'preFill': preFill,
                'type': 'discussion',
                'visibility': visibility
            });
        };

        /**
         * Create the discussion. When the discussion has been created successfully, the user will be redirected
         * to the created discussion
         */
        var createDiscussion = function() {
            // Disable the form
            $('#creatediscussion-form *', $rootel).prop('disabled', true);

            var displayName = $.trim($('#creatediscussion-name', $rootel).val());
            var discussionTopic = $.trim($('#creatediscussion-topic', $rootel).val());

            oae.api.discussion.createDiscussion(displayName, discussionTopic, visibility, managers, members, function (err, data) {
                // If the creation succeeded, redirect to the discussion profile
                if (!err) {
                    window.location = data.profilePath;
                } else {
                    // Re-enable the form
                    $('#creatediscussion-form *', $rootel).prop('disabled', true);

                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__DISCUSSION_NOT_CREATED__', 'creatediscussion'),
                        oae.api.i18n.translate('__MSG__DISCUSSION_COULD_NOT_BE_CREATED__', 'creatediscussion'),
                        'error');
                }
            });

            // Avoid default form submit behavior
            return false;
        };

        /**
         * Initialize the create discussion modal dialog
         */
        var setUpCreateDiscussionModal = function() {
            $(document).on('click', '.oae-trigger-creatediscussion', function() {
                // Request the context information
                $(document).trigger('oae.context.get', 'creatediscussion');
            });

            // Receive the context information and cache it
            $(document).on('oae.context.send.creatediscussion', function(ev, ctx) {
                contextData = ctx;
                $('#creatediscussion-modal', $rootel).modal({
                    'backdrop': 'static'
                });
            });

            $('#creatediscussion-modal', $rootel).on('shown.bs.modal', function() {
                // IE10 has a problem where it treats the placeholder text as the textarea's
                // value. Therefore, we need to explicitly clear the value of the textarea to
                // make the placeholder behave like a placeholder.
                // @see https://github.com/oaeproject/3akai-ux/pull/2906
                $('#creatediscussion-topic', $rootel).val('');
                // Set focus to the discussion topic field
                $('#creatediscussion-name', $rootel).focus();

                // Initiate the permissions widget
                setUpSetPermissions();
            });

            // Binds the 'change' button that shows the setpermissions widget
            $rootel.on('click', '.setpermissions-change-permissions', showPermissions);
        };

        setUpCreateDiscussionModal();
        setUpCreateDiscussion();
        setUpReset();

    };
});
