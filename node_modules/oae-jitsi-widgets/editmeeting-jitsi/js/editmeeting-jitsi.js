define(['jquery', 'oae.core'], function ($, oae) {

    return function (uid) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that keeps track of the meeting profile
        var meetingProfile = null;

        /**
         * Reset the widget to its original state when the modal dialog is opened and closed.
         * Ideally this would only be necessary when the modal is hidden, but IE10+ fires `input`
         * events while Bootstrap is rendering the modal, and those events can "undo" parts of the
         * reset. Hooking into the `shown` event provides the chance to compensate.
         */
        var setUpReset = function () {

            $('#editmeeting-jitsi-modal', $rootel).on('shown.bs.modal hidden.bs.modal', function () {
                // Reset the form
                var $form = $('#editmeeting-jitsi-form', $rootel);
                $form[0].reset();
                oae.api.util.validation().clear($form);

                // Enable the form and disable the submit button
                $('#editmeeting-jitsi-form *', $rootel).prop('disabled', false);
                $('#editmeeting-jitsi-form button[type="submit"]', $rootel).prop('disabled', true);
            });

        };

        /**
         * Edit the meeting
         */
        var editMeeting = function () {

            // Disable the form
            $('#editmeeting-jitsi-form *', $rootel).prop('disabled', true);

            var params = {
                'displayName': $.trim($('#editmeeting-jitsi-name', $rootel).val()),
                'description': $.trim($('#editmeeting-jitsi-description', $rootel).val()),
                'chat': $('#editmeeting-jitsi-chat').is(":checked").toString(),
                'contactList': $('#editmeeting-jitsi-contact-list').is(":checked").toString()
            }

            oae.api.meetingJitsi.updateMeeting(meetingProfile.id, params, function (err, data) {
                // If the update succeeded, trigger the `oae.editmeeting-jitsi.done` event,
                // show a success notification and close the modal
                if(!err) {
                    $('#editmeeting-jitsi-modal', $rootel).modal('hide');
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__MEETING_EDITED__', 'editmeeting-jitsi'),
                        oae.api.i18n.translate('__MSG__MEETING_EDIT_SUCCESS__', 'editmeeting-jitsi')
                    );
                    $(document).trigger('oae.editmeeting-jitsi.done', data);
                }
                // If the update failed, enable the form and show an error notification
                else {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__MEETING_NOT_EDITED__', 'editmeeting-jitsi'),
                        oae.api.i18n.translate('__MSG__MEETING_EDIT_FAIL__', 'editmeeting-jitsi'),
                        'error'
                    );
                    // Enable the form
                    $('#editmeeting-jitsi-form *', $rootel).prop('disabled', false);
                }

            });

            // Avoid default form submit behavior
            return false;

        };

        /**
         * Render the edit meeting form and initialize its validation
         */
        var setUpEditMeeting = function () {

            // Render the form elements
            oae.api.util.template().render($('#editmeeting-jitsi-template', $rootel), {
                'meeting': meetingProfile
            }, $('.modal-body', $rootel));

            // Initialize jQuery validate on the form
            var validateOpts = {
                'submitHandler': editMeeting
            };
            oae.api.util.validation().validate($('#editmeeting-jitsi-form', $rootel), validateOpts);

        };

        /**
         * Initialize the edit meeting modal dialog
         */
        var setUpEditMeetingModal = function () {

            $(document).on('click', '.oae-trigger-editmeeting-jitsi', function () {
                $('#editmeeting-jitsi-modal', $rootel).modal({
                    'backdrop': 'static'
                });
                $(document).trigger('oae.context.get', 'editmeeting-jitsi');
            });

            $(document).on('oae.context.send.editmeeting-jitsi', function (e, data) {
                meetingProfile = data;
                setUpEditMeeting();
            });

            // Detect changes in the form and enable the submit button
            $('#editmeeting-jitsi-form', $rootel).on(oae.api.util.getFormChangeEventNames(), function () {
                $('#editmeeting-jitsi-form button[type="submit"]', $rootel).prop('disabled', false);
            });

            $('#editmeeting-jitsi-modal', $rootel).on('shown.bs.modal', function () {
                // Set focus to the meeting name field
                $('#editmeeting-jitsi-name', $rootel).focus(); 
            });

        };

        setUpReset();
        setUpEditMeetingModal();

    };

});