define(['jquery', 'oae.core'], function($, oae) {

    return function (uid) {

        // The widget container
        var $rootel = $('#' + uid);

        /**
         * Render the metadata for the current meeting item
         *
         * @param  {Meeting}    meetingProfile    Meeting for which the metadata should be rendered
         */
        var renderMetadata = function (meetingProfile) {

            oae.api.util.template().render($('#aboutmeeting-jitsi-template', $rootel), {
                'meetingProfile': meetingProfile,
                'displayOptions': {
                    'linkTarget': '_blank'
                }
            }, $('#aboutmeeting-jitsi-container'), $rootel);

        };

        /**
         * Initialize the aboutmeeting-jitsi modal dialog
         */
        var setUpAboutMeeting = function () {

            $(document).on('click', '.oae-trigger-aboutmeeting-jitsi', function (e, data) {
                // Request the context profile information
                $(document).trigger('oae.context.get', 'aboutmeeting-jitsi');
            });

            // Receive the context's profile information and set ip the aboutmeetting-jitsi modal
            $(document).on('oae.context.send.aboutmeeting-jitsi', function (e, meetingProfile) {
                // Show the aboutmeeting-jitsi modal
                $('#aboutmeeting-jitsi-modal', $rootel).modal();
                // Render the metadata for the current meeting item
                renderMetadata(meetingProfile);
            });

        };

        setUpAboutMeeting();

    };

});