define(
    [
        'exports',
        'jquery','underscore','oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js',
        '/mobile/js/views/components/Menu.js'
    ],
    function(exports, $, underscore, oae, constants, mobileUtil, Menu){

        // Properties
        var instance = null;

        var _settings = null;

        var _menu = null;
        var _menuActive = 0;

        /////////////////////
        //// Constructor ////
        /////////////////////

        function MainController(){
            if(instance !== null){
                throw new Error("Cannot instantiate more than one MainController, use MainController.getInstance()");
            }
        }

        ////////////////////
        // Public methods //
        ////////////////////

        MainController.prototype = {

            /**
             * Initialize MainController
             */
            initialize: function() {
                // Listen to events from controllers
                addBinding();
                // Load settings from JSON file
                loadSettings();
            },

            /**
             * Returns the settings
             * @return {Object} object      Returns the settings as an object
             */
            getSettings: function() {
                return _settings;
            }
        };

        /**
         * Returns an instance of the MainController
         * @return Class {*}        Returns an instance of the MainController
         */
        MainController.getInstance = function(){
            if(instance === null) instance = new MainController();
            return instance;
        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         * Listen te events from controllers
         */
        var addBinding = function() {
            $(document).on(constants.events.activities.togglemenu, onMenuToggle);
            $(document).on(constants.events.user.loginsuccess, onUserLoginLogout);
            $(document).on(constants.events.user.logoutsuccess, onUserLoginLogout);
            $(document).on(constants.events.activities.activityend, hideIndicator);
            $(document).on(constants.events.activities.activitystart, showIndicator);
        };

        /**
         * Load settings from JSON file
         */
        var loadSettings = function() {
            $.ajax({
                dataType: 'json',
                url: constants.paths.settings,
                success: function(data){
                    if(data && data != null){
                        _settings = data;
                        initChildren();
                    }
                },
                error: function(e){
                    console.log(e);
                }
            });
        };

        /**
         * Initializes the (view)controllers
         */
        var initChildren = function() {
            initControllers();
            initMenu();
        };

        /**
         * Init the other controllers and pass an instance of the MainController
         */
        var initControllers = function() {
            require(
                [
                    "/mobile/js/controllers/UserController.js",
                    "/mobile/js/controllers/ViewController.js"
                ],
                function(userController, viewController) {
                    userController.initialize(MainController.getInstance());
                    viewController.initialize(MainController.getInstance());
                }
            );
        };

        /**
         * Initialize the menu
         */
        var initMenu = exports.initMenu = function() {
            _menu = new Menu(MainController.getInstance());
        };

        /**
         * Toggles the menu
         */
        var onMenuToggle = function() {

            // TODO: REPLACE THIS TEMPORARY SOLUTION

            console.log('[ViewController] onMenuToggle');
            _menuActive = !_menuActive;
            var $viewport = '#oae-mobile-viewport';
            if(_menuActive){
                $($viewport).css('left','90%');
            }else{
                $($viewport).css('left',0);
            }
        };

        /**
         * When user logs in or out
         */
        var onUserLoginLogout = function() {
            //if(!oae.data.me.anon){
                //console.log('[MainController] onUserLoginLogout');
            //}else{
                //console.log('[MainController] onUserLoginLogout');
            //}
        };

        /**
         * Show the activity indicator
         */
        var showIndicator = exports.showIndicator = function() {
            console.log('[Mobile] showIndicator');
        };

        /**
         * Hide the activity indicator
         */
        var hideIndicator = exports.hideIndicator = function() {
            console.log('[Mobile] hideIndicator');
        };

        // Singleton
        return MainController.getInstance();
    }
);