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

        // Holds the current state of the user profile as it is updated
        var profile = _.extend({}, oae.data.me);

        // Holds an email address that is pending verification from the user, if
        // applicable
        var unverifiedEmail = null;

        /**
         * Determine if the current profile has a valid display name
         *
         * @return {Boolean}    Whether or not the profile has a valid display name
         */
        var isValidDisplayName = function() {
            return oae.api.util.validation().isValidDisplayName(profile.displayName);
        };

        /**
         * Determine if the current profile has a valid email
         *
         * @return {Boolean}    Whether or not the profile has a valid email
         */
        var isValidEmail = function() {
            return oae.api.util.validation().isValidEmail(profile.email);
        };

        /**
         * Determine if the current profile is valid, such that it would allow a user to dismiss the
         * user profile modal
         *
         * @return {Boolean}        Whether or not the profile is valid in its current state
         */
        var isValidProfile = function() {
            return (isValidEmail() && isValidDisplayName());
        };

        /**
         * Show the main panel
         */
        var showMainPanel = function() {
            $('#editprofile-panel-email-container').hide();
            $('#editprofile-panel-main-container').show();
        };

        /**
         * Show the email panel
         */
        var showEmailPanel = function() {
            $('#editprofile-panel-main-container').hide();
            $('#editprofile-panel-email-container').show();
        };

        /**
         * Show the appropriate panel based on the user's profile state
         */
        var showDefaultPanel = function() {
            // Initialize the email verification status
            oae.api.user.getEmailVerificationStatus(oae.data.me.id, function(err, email) {
                // Ignore issues checking for a pending email verification, as there being no
                // pending verification is the 99.999% use-case and we wouldn't want to annoy
                // uninterested users with an error notification or anything
                unverifiedEmail = email;

                if (isValidDisplayName() && !isValidEmail() && unverifiedEmail) {
                    // If the user profile is awaiting a verified email, but all
                    // the other information is accurate, we take them directly
                    // to the panel that indicates they need to verify their
                    // email
                    renderEditProfileEmailPanel();
                } else {
                    renderEditProfileMainPanel();
                }
            });
        };

        /**
         * Render the edit profile "main" panel with validation and switch the current modal view to
         * the "main" panel
         */
        var renderEditProfileMainPanel = function() {
            // If the display name is not valid, clear it to inform the template that the user
            // has no real display name
            if (!isValidDisplayName()) {
                profile.displayName = null;
                 // Profiles with invalid display names will have had visibility set to private, so we
                 // reset it to the tenant's default visibility
                 // @see https://github.com/oaeproject/3akai-ux/pull/4100
                var tenantVisibility = oae.api.config.getValue('oae-principals', 'user', 'visibility');
                profile.visibility = tenantVisibility;
            }

            // Render the form elements
            oae.api.util.template().render($('#editprofile-panel-main-template', $rootel), {
                'isValidProfile': isValidProfile(),
                'profile': profile,
                'unverifiedEmail': unverifiedEmail
            }, $('#editprofile-panel-main-container', $rootel));

            // Detect changes in the form and enable the submit button
            $('#editprofile-form', $rootel).on(oae.api.util.getFormChangeEventNames(), function() {
                $('#editprofile-panel-main-container button[type="submit"]', $rootel).prop('disabled', false);
            });

            // Initialize jQuery validate on the form
            var validateOpts = {
                'submitHandler': editProfile,
                'methods': {
                    'displayname': {
                        'method': oae.api.util.validation().isValidDisplayName,
                        'text': oae.api.i18n.translate('__MSG__PLEASE_ENTER_A_VALID_NAME__')
                    }
                }
            };
            oae.api.util.validation().validate($('#editprofile-form', $rootel), validateOpts);

            // Switch the view to the main panel
            showMainPanel();
        };

        /**
         * Render the edit profile "email" panel that instructs the user how to proceed with
         * verifying their email. It will also switch the view to the "email" panel.
         */
        var renderEditProfileEmailPanel = function() {
            // Render the email verification instruction template
            oae.api.util.template().render($('#editprofile-panel-email-template', $rootel), {
                'isValidProfile': isValidProfile(),
                'profile': profile,
                'unverifiedEmail': unverifiedEmail
            }, $('#editprofile-panel-email-container', $rootel));

            // Switch the view to the email panel
            showEmailPanel();
        };

        /**
         * Perform the edit profile action
         */
        var editProfile = function() {
            // Disable the form
            $('#editprofile-form *', $rootel).prop('disabled', true);

            var newDisplayName = $.trim($('#editprofile-name', $rootel).val());
            var newEmail = $.trim($('#editprofile-email', $rootel).val()).toLowerCase();
            var newVisibility = $('.oae-large-options-container input[type="radio"]:checked', $rootel).val();
            var params = {
                'displayName': newDisplayName,
                'email': newEmail,
                'visibility': newVisibility
            };

            // Determine if this update constitutes a change in email. If so we will need to notify
            // the user that the new email is pending verification
            var isEmailChange = (newEmail !== oae.data.me.email);
            oae.api.user.updateUser(params, function (err, data) {
                if (!err) {
                    // Update the user profile in state
                    profile = data;

                    // Notify the rest of the UI widgets that the profile has been updated
                    $(document).trigger('oae.editprofile.done', data);

                    if (!isEmailChange) {
                        // If the update succeeded and didn't have an email change, close the modal
                        // while showing a notification
                        closeModal();
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__PROFILE_EDITED__'),
                            oae.api.i18n.translate('__MSG__PROFILE_DETAILS_EDIT_SUCCESS__', 'editprofile'));
                    } else {
                        // Since the email is updated, a verification email will be sent. We should
                        // tell the user that they must validate their email address from their
                        // email inbox
                        unverifiedEmail = newEmail;
                        renderEditProfileEmailPanel();
                    }
                } else {
                    // If the update failed, enable the form and show an error notification
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__PROFILE_NOT_EDITED__'),
                        oae.api.i18n.translate('__MSG__PROFILE_DETAILS_EDIT_FAIL__', 'editprofile'),
                        'error');
                    // Enable the form
                    $('#editprofile-form *', $rootel).prop('disabled', false);
                }
            });

            // Avoid default form submit behavior
            return false;
        };

        /**
         * Reset the widget to its original state when the modal dialog is opened and closed.
         * Ideally this would only be necessary when the modal is hidden, but IE10+ fires `input`
         * events while Bootstrap is rendering the modal, and those events can "undo" parts of the
         * reset. Hooking into the `shown` event provides the chance to compensate.
         */
        var setUpReset = function() {
            $('#editprofile-modal', $rootel).on('shown.bs.modal', showDefaultPanel);
            $('#editprofile-modal', $rootel).on('hidden.bs.modal', function (evt) {
                // Reset the form
                var $form = $('#editprofile-form', $rootel);
                $form[0].reset();

                oae.api.util.validation().clear($form);

                // Enable the form
                $('#editprofile-form *', $rootel).prop('disabled', false);
                $('#editprofile-form button[type="submit"]', $rootel).prop('disabled', true);

                showMainPanel();
            });
        };

        /**
         * Apply the listeners to the document that will launch the editprofile modal
         */
        var setUpModalListeners = function() {
            $(document).on('click', '.oae-trigger-editprofile', showModal);
            $(document).on('oae.trigger.editprofile', showModal);
        };

        /**
         * Show the edit profile modal and render the appropriate panel
         */
        var showModal = function() {
            $('#editprofile-modal', $rootel).modal({
                'backdrop': 'static'
            });

            showDefaultPanel();
        };

        /**
         * Close the edit profile modal
         */
        var closeModal = function() {
            $('#editprofile-modal', $rootel).modal('hide');
            if (oae.data.me.needsToAcceptTC) {
                // It is possible that we entered the edit profile modal to
                // clean up our user profile before accepting the terms and
                // conditions (see `oae.api.js` function `setupPreUseActions`).
                // Therefore we need to ensure we segue to the terms and
                // conditions widget after we close the editprofile modal
                oae.api.widget.insertWidget('termsandconditions', null, null, true);
           }
        };

        /**
         * Bind all the action listeners needed for the user to interact with the "main" panel in
         * the edit profile modal
         */
        var bindEditProfileMainPanelListeners = function() {
            $('#editprofile-modal', $rootel).on('shown.bs.modal', function() {
                // Set focus to the display name field
                $('#editprofile-name', $rootel).focus();
            });

            // Catch changes in the visibility radio group
            $rootel.on('change', '#editprofile-panel-main-container .oae-large-options-container input[type="radio"]', function() {
                $('.oae-large-options-container label', $rootel).removeClass('checked');
                $(this).parents('label').addClass('checked');
            });

            // When the "Resend Verification" button is clicked, resend the email verification
            $rootel.on('click', '#editprofile-email-verification .editprofile-email-verification-action button', function() {
                // Disable all actions in the modal
                $('#editprofile-form *', $rootel).prop('disabled', true);
                oae.api.user.resendEmailToken(oae.data.me.id, function(err) {
                    if (!err) {
                        // If the token resent successfully show a notification
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__VERIFICATION_EMAIL_SENT__', 'editprofile'),
                            oae.api.i18n.translate('__MSG__A_VERIFICATION_EMAIL_HAS_BEEN_SENT_TO_UNVERIFIED_EMAIL__', 'editprofile', {
                                'unverifiedEmail': unverifiedEmail
                            }));
                    } else {
                        // If the token failed to resend, show a notification
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__VERIFICATION_EMAIL_FAILED__', 'editprofile'),
                            oae.api.i18n.translate('__MSG__A_VERIFICATION_EMAIL_FAILED_TO_BE_SENT_TO_UNVERIFIED_EMAIL__', 'editprofile', {
                                'unverifiedEmail': unverifiedEmail
                            }),
                            'error');
                    }

                    // Re-enable the form
                    $('#editprofile-form *', $rootel).prop('disabled', false);
                });
            });

            // When the "Cancel Verification" button is clicked, delete the pending email verification
            // and close the container that indicates there is a pending verification
            $rootel.on('click', '#editprofile-email-verification .editprofile-email-verification-cancel button', function(evt) {
                // Allow the modal to be saved now
                $('#editprofile-panel-main-container button[type="submit"]', $rootel).prop('disabled', false);

                oae.api.user.deletePendingEmailVerification(function(err) {
                    if (!err) {
                        unverifiedEmail = null;

                        // If cancelling succeeded, simply remove the email verification panel
                        $('#editprofile-email-verification', $rootel).slideUp();
                    } else {
                        // If the token failed to resend, show a notification
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__CANCEL_EMAIL_VERIFICATION_FAILED__', 'editprofile'),
                            oae.api.i18n.translate('__MSG__AN_ERROR_OCCURRED_WHILE_CANCELLING_THE_EMAIL_VERIFICATION__', 'editprofile'),
                            'error');
                    }
                });

                evt.preventDefault();
            });
        };

        /**
         * Bind all the action listeners needed for the user to interact with the "email" panel in
         * the edit profile modal
         */
        var bindEditProfileEmailPanelListeners = function() {
            // When "Done" is clicked, close the modal
            $rootel.on('click', '#editprofile-panel-email-container .modal-footer button.btn-primary', function() {
                closeModal();
            });

            // When the user chooses to go back, re-render and enable the main panel
            $rootel.on('click', '#editprofile-panel-email-container .modal-footer button.btn-link', function() {
                renderEditProfileMainPanel();
            });
        };

        setUpReset();
        setUpModalListeners();
        bindEditProfileMainPanelListeners();
        bindEditProfileEmailPanelListeners();
    };
});
