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
            console.log('[MainController] constructor');
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
                console.log('[MainController] initialize');
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
                console.log('[MainController] getSettings');
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
            console.log('[MainController] addBinding');
        };

        /**
         * Load settings from JSON file
         */
        var loadSettings = function() {
            console.log('[MainController] loadSettings');
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

        // Singleton
        return MainController.getInstance();
    }
);