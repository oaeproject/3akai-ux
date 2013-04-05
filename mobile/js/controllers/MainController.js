define(
    [
        'oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js'
    ],
    function(oae, constants, mobileUtil){

        // Properties
        var instance = null;
        var settings = null;

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
                return settings;
            }
        };

        /**
         * Returns an instance of the MainController
         * @return Class {*}        Returns an instance of the MainController
         */
        MainController.getInstance = function(){
            if(instance === null){
                instance = new MainController();
            }
            return instance;
        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         * Listen te events from controllers
         */
        var addBinding = function() {
            $(document).on(constants.events.activities.activitystart, showIndicator);
            $(document).on(constants.events.activities.activityend, hideIndicator);
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
                        settings = data;
                        initControllers();
                    }
                },
                error: function(e){
                    console.log('[MainController] loadSettings => error');
                    console.log(e);
                }
            });
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
         * Show the activity indicator
         */
        var showIndicator = function() {
            console.log('[mobile] showIndicator');
        };

        /**
         * Hide the activity indicator
         */
        var hideIndicator = function() {
            console.log('[mobile] hideIndicator');
        };

        // Singleton
        return MainController.getInstance();
    }
);