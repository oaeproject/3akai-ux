define(
    [
        'exports',
        'oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js',
        '/mobile/js/views/components/Menu.js',
        '/mobile/js/views/components/Modal.js',
        '/mobile/js/views/views/LoginView.js',
        '/mobile/js/views/views/HomeView.js',
        '/mobile/js/views/views/DetailView.js'
    ],
    function(exports, oae, constants, mobileUtil, Menu, Modal, LoginView, HomeView, DetailView){

        // Properties
        var instance = null;

        var mainController = null;

        var _templates = null;

        var _views = null;
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

                // Listen to events from controllers
                addBinding();

                // Store instance of the maincontroller
                mainController = _mainController;

                // Put all the views into an array
                _views = [
                    new Menu(),
                    new Modal(),
                    new LoginView(),
                    new HomeView(),
                    new DetailView()
                ];

                // Render all templates
                renderAllTemplates();
            },

            /**
             * Push a new view into the stack
             * @param {String} view          The new view that will be pushed into the stack
             */
            changeView: function(view) {
                if(_activeView){
                    _oldView = _activeView;
                    _oldView.destroy();
                }

                switch(view){
                    case constants.views.login:
                        _activeView = getView(LoginView);
                        break;
                    case constants.views.home:
                        _activeView = getView(HomeView);
                        break;
                    case constants.views.detail:
                        _activeView = getView(DetailView);
                        break;
                }
                _activeView.initialize();
            }
        };

        /**
         * Returns an instance of the MainController
         * @return Class {*}        Returns an instance of the MainController
         */
        ViewController.getInstance = function(){
            if(instance === null) instance = new ViewController();
            return instance;
        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         *  Gets the requested class from the array
         * @param   {Class}     req             The requested class
         * @return  {Class}     retclass        The returned view class
         */
        var getView = function(req) {
            var result = null;
            _.each(_views, function(view){ if(view.constructor == req) result = view });
            return result;
        };

        /**
         * Renders all the templates and caches them
         */
        var renderAllTemplates = function() {
            _templates = {};
            _.each(_views, function(view){
                var name = view.settings.name;
                var index = _views.indexOf(view);
                var total = _views.length - 1;
                mobileUtil.renderTemplate(name, view, index, total, function(err, template){
                    _templates[template.name] = {
                        templateID: template.templateID,
                        template: template.el
                    };
                });
            });
        };

        /**
         * Called when all templates are rendered
         * Add templates to the helper element and initialize startup view
         */
        var onTemplatesReady = function() {
            for(var template in _templates){
                $(constants.components.templatehelper).append(_templates[template]['template']);
            }
            $(document).trigger(constants.events.activities.initmenu);
            setStartupView();
        };


        /**
         * Listen to events dispatched from controllers
         */
        var addBinding = function() {
            $(document).on(constants.events.activities.templatesready, onTemplatesReady);
            $(document).on(constants.events.activities.viewchanged, onViewChanged);
            $(document).on(constants.authentication.events.loginsuccess, onLoginSuccess);
            $(document).on(constants.authentication.events.logoutsuccess, onLogoutSuccess);
        };

        /**
         * Set startup view, depends if user is logged in or not
         */
        var setStartupView = function() {
            var newView = oae.data.me.anon ? constants.views.login : constants.views.home;
            instance.changeView(newView);
        };

        /**
         * When the changeview event is fired
         * @param {Event}   e               The dispatched event
         * @param {String}  view            The view
         */
        var onViewChanged = function(e, view) {

            //TODO: CHECK IF THE VIEW != THE CURRENT VIEW
            //instance.changeView(view);

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
