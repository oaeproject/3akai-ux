require(['jquery', 'oae.core'], function ($, oae) {

    // Get the meeting id from the URL. The expected URL is `/meeting-jitsi/<tenantId>/<resourceId>/<action>`. [view|close]
    // The meeting id will then be `d:<tenantId>:<resourceId>`
    var meetingId = 'd:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the meeting's base URL
    var baseUrl = '/meeting-jitsi/' + $.url().segment(2) + '/' + $.url().segment(3);

    var getMeetingProfile = function () {
        oae.api.meetingJitsi.getMeeting(meetingId, function (err, meeting) {

            console.log('err : ', err);
            console.log('profile : ', meeting);

            if (err) {
                if (err.code === 401) 
                    oae.api.util.redirect().accessdenied();
                else 
                    oae.api.util.redirect().notfound();
                return;
            }

            /**
            // Cache the meeting profile data
            meetingProfile = profile;

            // Render the entity information
            setUpClip();

            // Set up the page
            setUpNavigation();

            // Set up the context event exchange
            setUpContext();

            // We can now unhide the page
            oae.api.util.showPage();

            // Set up the meeting push notifications
            setUpPushNotifications();
             */
        });
    };

    getMeetingProfile();

});