define(['jquery', 'oae.core', 'jquery.history'], function($, oae) {
    
    return function (uid, showSettings, widgetData) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that will be used to keep track of the current infinite scroll instance
        var infinityScroll = false;

        /**
         * Set up event listeners
         */
        var setUpEvents = function () {

            // Listen to state changes
            $(window).on('statechange', function () {
                // Only re-load the meeting list when the widget is currently visible
                if ($rootel.is(':visible')) getMeetingsLibrary();
            });

            // Listen to a deleted meeting event 
            $(window).on('oae.deleteresources.done', function () {
                // Only re-load the meeting list when the widget is currently visible
                if ($rootel.is(':visible')) getMeetingsLibrary();
            });

        };

        /**
         * If the current user is an anonymous user, we don't show any actions. If the user
         * is logged in, we render the list of available actions based on whether or not the
         * user can manage this library.
         */
        var setUpListHeaders = function () {
            
            // Determine which list header actions should be available to the user viewing the library
            var listHeaderActions = [];
            
            if (!oae.data.me.anon) {
                // If the user is logged in, he/she has the option to share the item
                listHeaderActions.push({
                    'icon': 'fa-share-square-o',
                    'label': oae.api.i18n.translate('__MSG__SHARE__', 'meetings-jitsi-library'),
                    'trigger': 'oae-trigger-share',
                    'data': {'resourceType': 'meeting-jitsi'}
                });

                if (widgetData.canManage) {
                    // If the user is the manager of the library, he/she has the option to delete items
                    listHeaderActions.push({
                        'icon': 'fa-trash-o',
                        'label': oae.api.i18n.translate('__MSG__DELETE__', 'meetings-jitsi-library'),
                        'trigger': 'oae-trigger-deleteresources',
                        'data': {'resourceType': 'meeting-jitsi'}
                    });
                }
            }

            oae.api.util.template().render(
                $('#meetings-jitsi-library-list-header-template', $rootel), 
                {'actions': listHeaderActions},
                $('#meetings-jitsi-library-list-header', $rootel)
            );

        };

        /**
         * Initialize a new infinite scroll container that fetches a meeting library.
         * This will detect when a search is happening and will change the endpoint
         * accordingly.
         */
        var getMeetingsLibrary = function () {

            // Disable the previous inifite scroll
            if (infinityScroll) infinityScroll.kill();

            // Detect where or not we need to do a search by checking if 
            // the History.js state has a query parameter
            var query = History.getState().data.query;
            $('#oae-list-header-search-query', $rootel).val(query);

            // Set up the list actions
            var initialContent = null;
            if ((widgetData.canAdd || widgetData.canManage) && !query)
                initialContent = oae.api.util.template().render($('#meetings-jitsi-library-list-actions-template', $rootel));

            var url = '/api/meeting-jitsi/library/' + widgetData.context.id;
            if (query)
                url = '/api/search/meeting-jitsi-library/' + widgetData.context.id;

            // Set up the infinite scroll for the meetings library
            infinityScroll = $('.oae-list', $rootel).infiniteScroll(url, {
                'limit': 12,
                'q': query
            }, '#meetings-jitsi-library-template', {
                'initialContent': initialContent,
                'postProcessor': function(data) {
                    // Let the template know whether or not the current list
                    // is a main list or a search list, as different paging
                    // keys need to be provided for each

                    data.query = query;
                    data.displayOptions = {
                        'showCheckbox': true
                    };
                    return data;
                },
                'emptyListProcessor': function() {
                    oae.api.util.template().render($('#meetings-jitsi-library-noresults-template', $rootel), {
                        'query': query
                    }, $('.oae-list', $rootel));
                }
            });

        };

        setUpEvents();
        setUpListHeaders();
        getMeetingsLibrary();

    };
    
});