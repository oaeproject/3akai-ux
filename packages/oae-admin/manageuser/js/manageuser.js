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

define(['jquery', 'oae.core'], function($, oae) {

    return function(uid, showSettings) {

        // The widget container
        $rootel = $('#' + uid);

        // Variable that will cache the current tenant context and the selected user
        var widgetData = null;


        ///////////////
        // UTILITIES //
        ///////////////

        /**
         * Reset the widget to its original state
         */
        var reset = function() {

            // Reset the actions panel
            showPanel('main');

            // Reset all the forms
            $('form', $rootel).each(function(formIndex, form) {
                // Reset the form
                form.reset();
                // Clear the validation messages from the form
                oae.api.util.validation().clear(form);
            });

            // Show the first tab
            $('#manageuser-modal .tab-pane, #manageuser-modal .nav-tabs li').removeClass('active');
            $('#manageuser-modal .tab-pane:first-child, #manageuser-modal .nav-tabs li:first-child').addClass('active');
        };


        //////////////////
        // EDIT PROFILE //
        //////////////////

        /**
         * Edit a user's profile information
         */
        var editProfile = function() {
            // Lock the modal so it cannot be closed while updating the user
            $('#manageuser-modal', $rootel).modal('lock');

            var params = {
                'displayName': $.trim($('#manageuser-editprofile-name', $rootel).val()),
                'email': $.trim($('#manageuser-editprofile-email', $rootel).val()),
                'visibility': $('#manageuser-editprofile-form .oae-large-options-container input[type="radio"]:checked', $rootel).val()
            };

            oae.api.admin.updateUser(widgetData.userProfile.id, params, function (err, updatedUser) {
                // Unlock the modal after updating
                $('#manageuser-modal', $rootel).modal('unlock');

                if (!err) {
                    // Hide the modal after updating
                    $('#manageuser-modal', $rootel).modal('hide');

                    // Show a success notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__PROFILE_EDITED__'),
                        oae.api.i18n.translate('__MSG__PROFILE_DETAILS_EDIT_USER_SUCCESS__', 'manageuser'));

                    // Let other widgets know that the user's details have been edited
                    $(document).trigger('oae.manageuser.done', {'updated': updatedUser});
                } else {
                    // Show an error notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__PROFILE_NOT_EDITED__'),
                        oae.api.i18n.translate('__MSG__PROFILE_DETAILS_EDIT_USER_FAIL__', 'manageuser'),
                        'error');
                }
            });

            // Return false to avoid default form submit behavior
            return false;
        };

        /**
         * Set up the validation for the edit profile form
         */
        var setUpEditProfileValidation = function() {
            var validateOpts = {
                'submitHandler': editProfile
            };
            oae.api.util.validation().validate($('#manageuser-editprofile-form', $rootel), validateOpts);
        };

        /**
         * Render the edit profile form and initialize validation
         */
        var setUpEditProfileForm = function() {
            oae.api.util.template().render($('#manageuser-editprofile-template', $rootel), {
                'userProfile': widgetData.userProfile,
                'displayOptions': {
                    'addLink': false,
                    'size': 'large'
                }
            }, $('#manageuser-editprofile-container', $rootel));

            // Set up the profile validation
            setUpEditProfileValidation();
        };


        /////////////
        // ACTIONS //
        /////////////

        /**
         * Edit a user's privileges
         */
        var editPrivileges = function() {
            // Lock the modal so it cannot be closed while editing the privileges
            $('#manageuser-modal', $rootel).modal('lock');

            var isAdmin = $('#manageuser-privileges-isadmin', $rootel).is(':checked');
            oae.api.admin.editPrivileges(widgetData.userProfile.id, isAdmin, widgetData.context.isGlobalAdminServer, function(err) {
                // Unlock the modal
                $('#manageuser-modal', $rootel).modal('unlock');

                if (err) {
                    // Show an error notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__PRIVILEGES_NOT_EDITED__', 'manageuser'),
                        oae.api.i18n.translate('__MSG__PRIVILEGES_EDIT_FAILED__', 'manageuser'),
                        'error');
                } else {
                    // Hide the modal after saving
                    $('#manageuser-modal', $rootel).modal('hide');

                    // Show a success notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__PRIVILEGES_EDITED__', 'manageuser'),
                        oae.api.i18n.translate('__MSG__PRIVILEGES_EDIT_SUCCESS__', 'manageuser'));
                }
            });

            // Return false to avoid default form submit behavior
            return false;
        };

        /**
         * Delete a user
         */
        var deleteUser = function() {
            // Lock the modal so it cannot be closed while deleting the user
            $('#manageuser-modal', $rootel).modal('lock');
            $('#manageuser-modal *').prop('disabled', true);

            oae.api.admin.deleteUser(widgetData.userProfile.id, function(err) {
                // When the delete request finishes re-enable the form
                $('#manageuser-modal', $rootel).modal('unlock');
                $('#manageuser-modal *').prop('disabled', false);

                if (err) {
                    // Show an error notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__ACCOUNT_NOT_DELETED__', 'manageuser'),
                        oae.api.i18n.translate('__MSG__ACCOUNT_DELETE_FAIL__', 'manageuser'),
                        'error');
                } else {
                    // Hide the modal after deleting
                    $('#manageuser-modal', $rootel).modal('hide');

                    // Indicate that we have deleted a user
                    $(document).trigger('oae.manageuser.done', {'deleted': widgetData.userProfile});

                    // Show a success notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__ACCOUNT_DELETED__', 'manageuser'),
                        oae.api.i18n.translate('__MSG__ACCOUNT_DELETE_SUCCESS__', 'manageuser'));
                }
            });

            // Return false to avoid default form submit behavior
            return false;
        };

        /**
         * Set up the actions form
         */
        var setUpActionsForm = function() {
            // Make the main actions panel the active one
            showPanel('main');

            var data = {
                'context': widgetData.context,
                'userProfile': widgetData.userProfile
            };

            // Render the main panel body
            oae.api.util.template().render($('#manageuser-actions-template', $rootel), data,
                $('#manageuser-actions-container', $rootel));
        };

        /**
         * Switch between different modal panels (i.e., main and deleteuser confirmation)
         *
         * @param  {String}     panel   The panel to make active. Valid values are 'main' and 'deleteuser'
         */
        var showPanel = function(panel) {
            // Hide all form panels
            $('#manageuser-panel-main').hide();
            $('#manageuser-panel-deleteuser').hide();

            // Show just the specified panel
            $('#manageuser-panel-' + panel).show();
        };


        ////////////////////
        // AUTHENTICATION //
        ////////////////////

        /**
         * Set up the authentication form
         */
        var setUpAuthenticationForm = function() {
            setUpChangePasswordValidation();

            oae.api.util.template().render($('#manageuser-authentication-template', $rootel), {
                'loginIds': widgetData.userProfile.loginIds
            }, $('#manageuser-authentication-container', $rootel));
        };


        /////////////////////
        // CHANGE PASSWORD //
        /////////////////////

        /**
         * Change a user's password
         */
        var changePassword = function() {
            // Lock the modal so it cannot be closed while changing the password
            $('#manageuser-modal', $rootel).modal('lock');

            var oldPassword = $('#manageuser-current-password', $rootel).val();
            var newPassword = $('#manageuser-new-password', $rootel).val();

            oae.api.admin.changePassword(widgetData.userId, newPassword, function(err) {
                // Unlock the modal
                $('#manageuser-modal', $rootel).modal('unlock');

                if (err) {
                    if (err.code === 400) {
                        // The user has a non-local account
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__PASSWORD_NOT_UPDATED__'),
                            oae.api.i18n.translate('__MSG__THE_PASSWORD_CANNOT_BE_CHANGED_HERE__', 'manageuser'),
                            'error'
                        );
                    } else {
                        // Show a generic failure notification
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__PASSWORD_NOT_UPDATED__'),
                            oae.api.i18n.translate('__MSG__THE_PASSWORD_UPDATE_FAILED__', 'manageuser'),
                            'error'
                        );
                    }
                } else {
                    // Hide the modal after saving
                    $('#manageuser-modal', $rootel).modal('hide');

                    // Show a success notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__PASSWORD_UPDATED__'),
                        oae.api.i18n.translate('__MSG__THE_PASSWORD_SUCCESSFULLY_UPDATED__', 'manageuser')
                    );
                }
            });

            // Return false to avoid default form submit behavior
            return false;
        };

        /**
         * Set up the validation for the change password form
         */
        var setUpChangePasswordValidation = function() {
            oae.api.util.validation().validate($('#manageuser-authentication-form', $rootel), {
                'rules': {
                    'manageuser-new-password': {
                        'minlength': 6
                    },
                    'manageuser-retype-password': {
                        'equalTo': '#manageuser-new-password'
                    }
                },
                'messages': {
                    'manageuser-new-password': {
                        'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_THE_NEW_PASSWORD__', 'manageuser'),
                        'minlength': oae.api.i18n.translate('__MSG__THE_PASSWORD_SHOULD_BE_AT_LEAST_SIX_CHARACTERS_LONG__')
                    },
                    'manageuser-retype-password': {
                        'required': oae.api.i18n.translate('__MSG__PLEASE_REPEAT_THE_NEW_PASSWORD__', 'manageuser'),
                        'passwordmatch': oae.api.i18n.translate('__MSG__THIS_PASSWORD_DOES_NOT_MATCH_THE_FIRST_ONE__')
                    }
                },
                'submitHandler': changePassword
            });
        };


        ///////////////////////
        // EMAIL PREFERENCES //
        ///////////////////////

        /**
         * Change a user's email preferences
         */
        var editEmailPreference = function() {
            // Lock the modal so it cannot be closed while changing the email preference
            $('#manageuser-modal', $rootel).modal('lock');

            var profile = {
                'emailPreference': $('#manageuser-email-form .oae-large-options-container input[type="radio"]:checked', $rootel).val()
            };

            oae.api.admin.updateUser(widgetData.userId, profile, function(err) {
                // Unlock the modal
                $('#manageuser-modal', $rootel).modal('unlock');

                if (err) {
                    // Show a generic failure notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__EMAIL_PREFERENCES_NOT_UPDATED__', 'manageuser'),
                        oae.api.i18n.translate('__MSG__THE_EMAIL_PREFERENCES_UPDATE_FAILED__', 'manageuser'),
                        'error'
                    );
                } else {
                    // Hide the modal after saving
                    $('#manageuser-modal', $rootel).modal('hide');

                    // Show a success notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__EMAIL_PREFERENCES_UPDATED__', 'manageuser'),
                        oae.api.i18n.translate('__MSG__THE_EMAIL_PREFERENCES_SUCCESSFULLY_UPDATED__', 'manageuser')
                    );
                }
            });

            // Return false to avoid default form submit behavior
            return false;
        };

        /**
         * Set up the email form
         */
        var setUpEmailForm = function() {
            oae.api.util.template().render($('#manageuser-email-template', $rootel), {
                'context': widgetData.context,
                'userProfile': widgetData.userProfile
            }, $('#manageuser-email-container', $rootel));
        };


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        /**
         * Add bindings to various elements in the widget
         */
        var addBinding = function() {
            $rootel.on('click', '#manageuser-actions-form button.manageuser-become-user', function() {
                oae.api.admin.getSignedBecomeRequestInfo(widgetData.userProfile.id, function(err, data) {
                    if (err) {
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__TOKEN_ERROR__', 'manageuser'),
                            oae.api.i18n.translate('__MSG__COULD_NOT_BECOME_USER_NAME__', 'manageuser', {
                                'displayName': oae.api.util.security().encodeForHTML(widgetData.userProfile.displayName)
                            }),
                            'error');
                    } else {
                        // Fill in our hidden form and submit it. A form is being used because it is potentially a cross-domain request
                        oae.api.util.template().render($('#manageuser-become-user-form-template', $rootel), data, $('#manageuser-become-user-form-container', $rootel));
                        $('#manageuser-become-user-form').submit();
                    }
                });
            });

            // Switch to deleteuser panel when user selects to delete the user
            $rootel.on('click', '#manageuser-actions-form button.manageuser-delete-user', function() {
                showPanel('deleteuser');
            });

            // Delete the user when the user accepts the deleteuser confirmation
            $rootel.on('submit', '#manageuser-deleteuser-form', deleteUser);

            // Switch back to the main panel when the user clicks the "Cancel" button in the
            // deleteuser confirmation panel
            $rootel.on('click', '#manageuser-deleteuser-cancel', function() {
                showPanel('main');
            });

            $rootel.on('submit', '#manageuser-actions-form', editPrivileges);
            $rootel.on('submit', '#manageuser-email-form', editEmailPreference);

            // Catch changes in the visibility radio group
            $rootel.on('change', '.oae-large-options-container input[type="radio"]', function() {
                var $optionsContainer = $(this).closest('.oae-large-options-container');
                $optionsContainer.find('label').removeClass('checked');
                $(this).closest('label').addClass('checked');
            });
        };

        /**
         * Set up the manageuser modal
         */
        var setUpManageUserModal = function() {
            $(document).on('oae.trigger.manageuser', function(ev, data) {
                widgetData = data;
                $('#manageuser-modal', $rootel).modal({
                    'backdrop': 'static'
                });

                // Retrieve user information
                oae.api.user.getUser(widgetData.userId, function(err, userProfile) {
                    widgetData.userProfile = userProfile;

                    // Retrieve the user login ids
                    oae.api.authentication.getAuthLoginIds(widgetData.userProfile.id, function(err, loginIds) {
                        widgetData.userProfile.loginIds = loginIds;

                        // Render the modal dialog header
                        oae.api.util.template().render($('#manageuser-editprofile-header-template', $rootel), {
                            'userProfile': userProfile
                        }, $('#manageuser-editprofile-header-container', $rootel));

                        // Don't show the actions tab for the global admin tenant
                        if (widgetData.context.isGlobalAdminServer) {
                            $('#manageuser-actions-tab', $rootel).hide();
                        }

                        setUpAuthenticationForm();
                        setUpEditProfileForm();
                        setUpActionsForm();
                        setUpEmailForm();
                    });
                });
            });

            // Reset the widget when it closes
            $('#manageuser-modal').on('hidden.bs.modal', reset);
        };

        addBinding();
        setUpManageUserModal();
    };
});
