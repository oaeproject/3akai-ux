require(['jquery', 'oae.core'], function ($, oae) {

    // Get the meeting id from the URL. The expected URL is `/meeting-jitsi/<tenantId>/<resourceId>/<action>`. [view|close]
    // The meeting id will then be `d:<tenantId>:<resourceId>`
    var meetingId = 'd:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the meeting's base URL
    var baseUrl = '/meeting-jitsi/' + $.url().segment(2) + '/' + $.url().segment(3);

    /**
     * Set up the context. 
     */
    var setUpContext = function () {
        $(document).on('oae.context.get', function (e, widgetId) {
            console.log('widgetId : ', widgetId);
            console.log('meetingProfile : ', meetingProfile);
            if (widgetId)
                $(document).trigger('oae.context.send.' + widgetId, meetingProfile);
            else
                $(document).trigger('oae.context.send', meetingProfile);
        });
    };

    /**
     * Set up the left hand navigation with the content space page structure.
     * The content left hand navigation item will not be shown to the user and
     * is only used to load the correct content preview widget
     */
    var setUpNavigation = function () {
        var lhNavPages = [{
            'id': 'meeting',
            'title': meetingProfile.displayName,
            'icon': 'fa-video-camera',
            'closeNav': true,
            'class': 'hide',
            'layout': [{
                'width': 'col-md-12',
                'widgets': [
                    {
                        'id': 'meeting-jitsi',
                        'name': 'meeting-jitsi',
                        'settings': meetingProfile
                    },
                    {
                        'name': 'comments'
                    }
                ]
            }]
        }];

        $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], baseUrl]);
        $(window).on('oae.ready.lhnavigation', function () {
            $(window).trigger('oae.trigger.lhnavigation', [lhNavPages, [], baseUrl]);
        });
    };

    /**
     * Render the meeting clip
     */
    var setUpClip = function () {
        oae.api.util.template().render($('#meeting-jitsi-clip-template'), {
            'meeting': meetingProfile,
            'displayOptions': {
                'addLink:': false
            }
        }, $('#meeting-jitsi-clip-container'));
    };

    var getMeetingProfile = function () {
        oae.api.meetingJitsi.getMeeting(meetingId, function (err, profile) {

            if (err) {
                if (err.code === 401) 
                    oae.api.util.redirect().accessdenied();
                else 
                    oae.api.util.redirect().notfound();
                return;
            }
            
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
            /**
            // Set up the meeting push notifications
            setUpPushNotifications();
             */
        });
    };

    getMeetingProfile();

});