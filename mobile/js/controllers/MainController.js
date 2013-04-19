define(
    [
        'exports',
        'jquery','underscore','oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js',
        '/mobile/js/controllers/UserController.js',
        '/mobile/js/controllers/ViewController.js',
        '/mobile/js/views/components/Menu.js'
    ],
    function(exports, $, underscore, oae, constants, mobileUtil, userController, viewController, Menu) {

        /////////////////////
        //// Properties /////
        /////////////////////

        // Instance of MainController
        var instance = null;
        // Settings loaded from .json file are stored here
        var settings = null;
        // Instance of the menu
        var menu = null;
        // The modal view
        var modal = $('#oae-mobile-modal');

        /////////////////////
        //// Constructor ////
        /////////////////////

        var MainController = function() {
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one MainController, use MainController.getInstance()");
            }
        };

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
             *
             * @return {Object} object              Returns the settings as an object
             */
            getSettings: function() {
                return settings;
            }
        };

        /**
         * Returns an instance of the MainController
         *
         * @return {MainController} instance        Returns an instance of the MainController
         */
        MainController.getInstance = function() {
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
                    var type = constants.alerts.types.error;
                    var message = oae.api.i18n.translate('__MSG__AN_ERROR_HAS_OCCURED_TRY_LATER__');
                    $(document).trigger(constants.alerts.init, {'confirm': false, 'type': type, 'message': message});
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
         *
         * @param {Boolean} active              true/false
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
         *
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
         * Initializes a new modal window
         *
         * @param {Event}       e                   The dispatched event
         * @param {Object}      message             The object containing the message data
         * @param {Boolean}     message.confirm     If the modal needs a confirm button
         * @param {String}      message.type        The type of the message
         * @param {String}      message.message     The message
         * @param {Function}    message.callback    The callback function when confirm is pressed
         */
        var onShowModal = function(e, message) {

            // Set header and body
            $(modal).find('.modal-header').html(oae.api.i18n.translate('__MSG__ERROR__'));
            $(modal).find('.modal-body').html(message.message);

            // Hide the confirm button by default
            $(modal).find('#btnModalConfirm').hide();

            // Show the modal
            $(modal).modal({show: true, backdrop: false});

            // When a confirm button is needed => show button + add eventlistener
            if (message.confirm) {
                var canceltext = oae.api.i18n.translate('__MSG__CANCEL__');
                var confirmtext = oae.api.i18n.translate('__MSG__CONFIRM__');
                $(modal).find('#btnModalClose').html(canceltext);
                $(modal).find('#btnModalConfirm').html(confirmtext).show().on('click', function() {
                    // Do callback when pressed on confirm button
                    message.callback(true);
                    // Hide the modal
                    onHideModal();
                });
            } else {
                $(modal).find('#btnModalClose').html(oae.api.i18n.translate('__MSG__OK__'));
            }
        };

        /**
         * Hides the modal window
         */
        var onHideModal = function() {
            $(modal).modal('hide');
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
            $('#oae-mobile-activity-indicator').animate({'opacity': 0}, 250, null, function() {
                $('#oae-mobile-activity-indicator').hide();
            });
        };

        ////////////////////////
        /////// BINDING ////////
        ////////////////////////

        /**
         * Listen to events dispatched from controllers
         */
        var addBinding = function() {
            $(document).on(constants.alerts.init, onShowModal);
            $(document).on(constants.alerts.kill, onHideModal);
            $(document).on(constants.authentication.events.loginsuccess, onUserLogin);
            $(document).on(constants.authentication.events.logoutsuccess, onUserLogout);
            $(document).on(constants.events.activities.activityend, hideIndicator);
            $(document).on(constants.events.activities.activitystart, showIndicator);
            $(document).on(constants.events.activities.initmenu, onInitMenu);
            $(document).on(constants.events.activities.menuclicked, onMenuItemClicked);
            $(document).on(constants.events.activities.menutoggle, onMenuToggle);
            $(modal).find("#btnModalClose").bind('click', onHideModal);
        };

        /**
         * Returns an instance of MainController
         */
        return MainController.getInstance();
    }
);
