define(
    [
        'exports',
        'oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js',
        '/mobile/js/views/views/LoginView.js',
        '/mobile/js/views/views/HomeView.js',
        '/mobile/js/views/views/DetailView.js'
    ],
    function(exports, oae, constants, mobileUtil, LoginView, HomeView, DetailView){

        // Properties
        var instance = null;

        var mainController = null;

        var _activeView = null;
        var _oldView = null;

        /////////////////////
        //// Constructor ////
        /////////////////////

        function ViewController(){
            if(instance !== null){
                throw new Error("Cannot instantiate more than one ViewController");
            }
        }

        ////////////////////
        // Public methods //
        ////////////////////

        ViewController.prototype = {

            /**
             * Initialize ViewController
             */
            initialize: function(_mainController) {
                console.log('[ViewController] initialize');
                // Listen to events from controllers
                addBinding();
                // Store instance of the maincontroller
                mainController = _mainController;
                // Set startup view
                setStartupView();
            },

            /**
             * Push a new view into the stack
             * @param {String} view          The new view that will be pushed into the stack
             */
            changeView: function(view) {

                console.log('[ViewController] changeView');

                /*

                if(_activeView){
                    _oldView = _activeView;
                    _oldView.destroy();
                }
                switch(view){
                    case constants.views.login:
                        _activeView = new LoginView(_views[0]['loginView']['templateId']);
                        break;
                    case constants.views.home:
                        _activeView = new HomeView(_views[1]['homeView']['templateId']);
                        break;
                    case constants.views.detail:
                        _activeView = new DetailView(_views[2]['detailView']['templateId']);
                        break;
                }

                */
            }
        };

        /**
         * Returns an instance of the MainController
         * @return Class {*}        Returns an instance of the MainController
         */
        ViewController.getInstance = function(){
            if(instance === null){
                instance = new ViewController();
            }
            return instance;
        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         * Listen to events dispatched from controllers
         */
        var addBinding = function() {
            $(document).on(constants.events.user.loginsuccess, onLoginSuccess);
            $(document).on(constants.events.user.logoutsuccess, onLogoutSuccess);
        };

        /**
         * Set startup view, depends if user is logged in or not
         */
        var setStartupView = function() {
            var newView = oae.data.me.anon ? constants.views.login : constants.views.home;
            instance.changeView(newView);
        };

        var onLoginSuccess = function() {
            instance.changeView(constants.views.home);
        };

        var onLogoutSuccess = function() {
            instance.changeView(constants.views.login);
        };

        // Singleton
        return ViewController.getInstance();
    }
);