require(['jquery', 'oae.core'], function ($, oae) {

    // Get the meeting id from the URL. The expected URL is `/meeting-jitsi/<tenantId>/<resourceId>/<action>`. [view|close]
    // The meeting id will then be `m:<tenantId>:<resourceId>`
    var meetingId = 'm:' + $.url().segment(2) + ':' + $.url().segment(3);

    // Variable used to cache the requested meeting profile
    var meetingProfile = null;

    // Variable used to cache the meeting's base URL
    var baseUrl = '/meeting-jitsi/' + $.url().segment(2) + '/' + $.url().segment(3);

    /**
     * Create the widgetData object to send to the manageaccess widget that contains all
     * variable values needed by the widget.
     *
     * @return {Object}    The widgetData to be passed into the manageaccess widget
     * @see manageaccess#initManageAccess
     */
    var getManageAccessData = function () {
        return {
            'contextProfile': meetingProfile,
            'messages': {
                'accessNotUpdatedBody': oae.api.i18n.translate('__MSG__MEETING_ACCESS_COULD_NOT_BE_UPDATED__'),
                'accessNotUpdatedTitle': oae.api.i18n.translate('__MSG__MEETING_ACCESS_NOT_UPDATED__'),
                'accessUpdatedBody': oae.api.i18n.translate('__MSG__MEETING_ACCESS_SUCCESSFULLY_UPDATED__'),
                'accessUpdatedTitle': oae.api.i18n.translate('__MSG__MEETING_ACCESS_UPDATED__'),
                'membersTitle': oae.api.i18n.translate('__MSG__SHARED_WITH__'),
                'private': oae.api.i18n.translate('__MSG__PRIVATE__'),
                'loggedin': oae.api.util.security().encodeForHTML(meetingProfile.tenant.displayName),
                'public': oae.api.i18n.translate('__MSG__PUBLIC__'),
                'privateDescription': oae.api.i18n.translate('__MSG__MEETING_PRIVATE_DESCRIPTION__'),
                'loggedinDescription': oae.api.i18n.translate('__MSG__MEETING_LOGGEDIN_DESCRIPTION__', null, {'tenant': oae.api.util.security().encodeForHTML(meetingProfile.tenant.displayName)}),
                'publicDescription': oae.api.i18n.translate('__MSG__MEETING_PUBLIC_DESCRIPTION__')
            },
            'defaultRole': 'member',
            'roles': [
                {'id': 'member', 'name': oae.api.i18n.translate('__MSG__CAN_VIEW__')},
                {'id': 'manager', 'name': oae.api.i18n.translate('__MSG__CAN_MANAGE__')}
            ],
            'api': {
                'getMembersURL': '/api/meeting-jitsi/'+ meetingProfile.id + '/members',
                'setMembers': oae.api.meetingJitsi.updateMembers,
                'setVisibility': oae.api.meetingJitsi.updateMeeting
            }
        };
    };

    /**
     * Set up the context.
     */
    var setUpContext = function () {
        $(document).on('oae.context.get', function (e, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, meetingProfile);
            } else {
                $(document).trigger('oae.context.send', meetingProfile);
            }
        });
        $(document).trigger('oae.context.send', meetingProfile);
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
                if (err.code === 401) {
                    oae.api.util.redirect().accessdenied();
                } else {
                    oae.api.util.redirect().notfound();
                }
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
        });
    };

    /**
     * Trigger the manageaccess widget and pass in context data
     */
    $(document).on('click', '.meeting-jitsi-trigger-manageaccess', function () {
        $(document).trigger('oae.trigger.manageaccess', getManageAccessData());
    });

    /**
     * Trigger the manageaccess widget in 'add members' view and pass in context data
     */
    $(document).on('click', '.meeting-jitsi-trigger-manageaccess-add', function () {
        $(document).trigger('oae.trigger.manageaccess-add', getManageAccessData());
    });

    //////////////////
    // EDIT MEETING //
    //////////////////

    /**
     * Refresh the meeting topic by emptying the existing meeting topic container and rendering a new one
     * (for now its useless, but in case one day we should refresh the widget container we let it)
     */
    var refreshMeetingTopic = function () {
        // Empty the preview container
        var $widgetContainer = $('#lhnavigation-widget-meeting-jitsi');
        $widgetContainer.empty();

        // Insert the new updated meeting widget
        oae.api.widget.insertWidget('meeting-jitsi', null, $widgetContainer, null, meetingProfile);
    };

    /**
     * Refresh the meeting profile by updating the clips and meeting topic
     *
     * @param {Meeting}     updatedMeeting      Meeting profile of the updated meeting item@
     */
    var refreshMeetingProfile = function (updatedMeeting) {
        // Cache the meeting profile data
        meetingProfile = updatedMeeting;
        // Refresh the meeting topic
        // refreshMeetingTopic();
        // Refresh the clip
        setUpClip();
    };

    //////////////////
    // EDIT DETAILS //
    //////////////////

    /**
     * Re-render the meeting's clip when the details have been updated.
     */
    $(document).on('oae.editmeeting-jitsi.done', function(ev, updatedMeeting) {
        refreshMeetingProfile(updatedMeeting);
    });

    getMeetingProfile();

});
