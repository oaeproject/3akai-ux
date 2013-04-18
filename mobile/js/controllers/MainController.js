define(
    [
        'exports',
        'jquery','underscore','oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js',
        '/mobile/js/controllers/UserController.js',
        '/mobile/js/controllers/ViewController.js',
        '/mobile/js/views/components/Menu.js',
        '/mobile/js/views/components/Modal.js'
    ],
    function(exports, $, underscore, oae, constants, mobileUtil, userController, viewController, Menu, Modal) {

        // Properties
        var instance = null;

        var settings = null;

        var menu = null;
        var modal = null;

        /////////////////////
        //// Constructor ////
        /////////////////////

        function MainController() {
            if (instance !== null) {
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
                return settings;
            }
        };

        /**
         * Returns an instance of the MainController
         * @return Class {*}        Returns an instance of the MainController
         */
        MainController.getInstance = function(){
            if (instance === null) {
                instance = new MainController();
            }
            return instance;
        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         * Load settings from JSON file
         */
        var loadSettings = function() {
            $.ajax({
                dataType: 'json',
                url: constants.paths.settings,
                success: function(data) {
                    settings = data;
                    hideIndicator();
                    initControllers();
                },
                error: function(e) {
                    window.alert('Application could not be loaded');
                }
            });
        };

        /**
         * Init the other controllers and pass an instance of the MainController
         */
        var initControllers = function() {
            userController.initialize(MainController.getInstance());
            viewController.initialize(MainController.getInstance());
        };

        ////////////////////////
        ///////// MENU /////////
        ////////////////////////

        /**
         * Initialize the menu
         */
        var onInitMenu = function() {
            if (menu) {
                menu = null;
            }
            menu = new Menu(MainController.getInstance());
            menu.initialize();
        };

        /**
         * Toggles the menu visibility
         */
        var onMenuToggle = function() {
            menu.setActive(!menu.getActive());
            showHideMenu();
        };

        /**
         * Shows or hides the menu
         * @param {Boolean} active              True/false
         */
        var showHideMenu = function(active) {
            if (active != null) {
                menu.setActive(active);
            }
            var val = (menu.getActive()) ? '261px' : '0';
            $('#oae-mobile-viewport').animate({'margin-left': val}, 300);
        };

        /**
         * When a menu items gets clicked
         * @param {Event}   e                   The dispatched event
         * @param {String}  action              The action that needs to be executed
         */
        var onMenuItemClicked = function(e, action) {
            switch(action) {
                case "signout":
                    $(document).trigger(constants.authentication.events.logoutattempt);
                    break;
            }
        };

        ////////////////////////
        ///////// USER /////////
        ////////////////////////

        /**
         * After user logs in successfully
         * Re-initialize the menu
         */
        var onUserLogin = function() {
            onInitMenu();
        };

        /**
         * After user logs out successfully
         * Re-initialize and hide the menu
         */
        var onUserLogout = function() {
            showHideMenu(false);
            onInitMenu();
        };

        ////////////////////////
        //////// MODALS ////////
        ////////////////////////

        /**
         * Initializes a new modal message window
         */
        var onModalInit = function() {
            var message = {
                'type': 'Warning',
                'message': 'The message'
            };
            modal = new Modal();
            modal.initialize(message);
        };

        var onModalDestroy = function() {
            console.log('[MainController] onModalDestroy');
        };

        ////////////////////////
        // ACTIVITY INDICATOR //
        ////////////////////////

        /**
         * Show the activity indicator
         */
        var showIndicator = exports.showIndicator = function() {
            $('#oae-mobile-activity-indicator').animate({'opacity':1}, 250).show();
        };

        /**
         * Hide the activity indicator
         */
        var hideIndicator = exports.hideIndicator = function() {
            $('#oae-mobile-activity-indicator').animate({'opacity': 0}, 250, null, function(){
                $('#oae-mobile-activity-indicator').hide();
            });
        };

        ////////////////////////
        /////// BINDING ////////
        ////////////////////////

        /**
         * Listen te events from controllers
         */
        var addBinding = function() {
            $(document).on(constants.alerts.init, onModalDestroy);
            $(document).on(constants.alerts.kill, onModalInit);
            $(document).on(constants.authentication.events.loginsuccess, onUserLogin);
            $(document).on(constants.authentication.events.logoutsuccess, onUserLogout);
            $(document).on(constants.events.activities.activityend, hideIndicator);
            $(document).on(constants.events.activities.activitystart, showIndicator);
            $(document).on(constants.events.activities.initmenu, onInitMenu);
            $(document).on(constants.events.activities.menuclicked, onMenuItemClicked);
            $(document).on(constants.events.activities.menutoggle, onMenuToggle);
        };

        // Singleton
        return MainController.getInstance();
    }
);
