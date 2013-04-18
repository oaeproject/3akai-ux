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
    function(exports, oae, constants, mobileUtil, Menu, Modal, LoginView, HomeView, DetailView) {

        // Properties
        var instance = null;
        var mainController = null;
        var templates = null;
        var views = null;
        var activeView = null;
        var oldView = null;

        /////////////////////
        //// Constructor ////
        /////////////////////

        function ViewController() {
            if (instance !== null) {
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
            initialize: function(controller) {

                // Listen to events from controllers
                addBinding();

                // Store instance of the maincontroller
                mainController = controller;

                // Put all the views into an array
                views = [
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
                if (activeView) {
                    oldView = activeView;
                    oldView.destroy();
                }
                switch(view) {
                    case constants.views.login:
                        activeView = getView(LoginView);
                        break;
                    case constants.views.home:
                        activeView = getView(HomeView);
                        break;
                    case constants.views.detail:
                        $(document).trigger(constants.events.activities.activitystart);
                        activeView = getView(DetailView);
                        break;
                }
                activeView.initialize();
            }
        };

        /**
         * Returns an instance of the MainController
         * @return {ViewController} instance        Returns an instance of the ViewController
         */
        ViewController.getInstance = function() {
            if (instance === null) {
                instance = new ViewController();
            }
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
            _.each(views, function(view) {
                    if (view.constructor == req) {
                        result = view
                    }
                }
            );
            return result;
        };

        /**
         * Renders all the templates and caches them
         */
        var renderAllTemplates = function() {
            templates = {};
            _.each(views, function(view) {
                var name = view.settings.name;
                var index = views.indexOf(view);
                var total = views.length - 1;
                mobileUtil.renderTemplate(name, view, index, total, function(err, template) {
                    templates[template.name] = {
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
            for (var template in templates) {
                $(constants.components.templatehelper).append(templates[template]['template']);
            }
            $(document).trigger(constants.events.activities.initmenu);
            setStartupView();
        };

        /**
         * Set startup view, depends if user is logged in or not
         * Checks if a hash is provided in the url
         * If TRUE => trigger the hashchange event
         * if FALSE => set the hash in the url
         */
        var setStartupView = function() {
            if (getBBQStateLength()) {
                $(window).trigger('hashchange');
            } else {
                var hash = oae.data.me.anon ? constants.views.hash.login : constants.views.hash.home;
                changeHash(hash);
            }
        };

        /**
         * When the changeview event is fired for internal communication
         * @param {Event}   e               The dispatched event
         * @param {String}  view            The view
         */
        var onViewChanged = function(e, view) {
            var hash = null;
            switch(view) {
                case constants.views.home:
                    hash = constants.views.hash.home;
                    break;
                case constants.views.detail:
                    hash = constants.views.hash.detail;
                    break;
                case constants.views.login:
                    hash = constants.views.hash.login;
                    break;
            }
            changeHash(hash);
        };

        /**
         * Manually change the hash
         * @param {String} hash
         */
        var changeHash = function(hash) {
            $.bbq.pushState(hash, 2);
        };

        /**
         * When the hashchange event gets triggered for external communication
         * @param {Event}   e               The dispatched event
         */
        var onHashChange = function(e) {
            var hash = e.currentTarget.location.hash.split(':');
            var type = hash[0],
                tenant = hash[1],
                document = hash[2];

            if (!oae.data.me.anon) {
                var state = constants.views.home;
                var type_raw = type.substring(1, type.length);
                switch(type_raw) {
                    case constants.views.hash.home:
                        state = constants.views.home;
                        break;
                    case constants.views.hash.detail:
                        state = constants.views.detail;
                        break;
                    case constants.views.hash.login:
                        changeHash(constants.views.hash.home);
                        state = constants.views.home;
                        break;
                }
                instance.changeView(state);
            } else {
                changeHash(constants.views.hash.login);
                instance.changeView(constants.views.login);
            }
        };

        var getBBQStateLength = function() {
            var size = 0, key;
            var state = $.bbq.getState();
            for (key in state) {
                if (state.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        };

        ////////////////////////
        ///////// USER /////////
        ////////////////////////

        // When UserController dispatches logged in event
        var onLoginSuccess = function() {
            changeHash(constants.views.hash.home);
        };

        // When UserController dispatches logged out event
        var onLogoutSuccess = function() {
            changeHash(constants.views.hash.login);
        };

        ////////////////////////
        /////// BINDING ////////
        ////////////////////////

        /**
         * Bind events
         */
        var addBinding = function() {
            $(document).on(constants.events.activities.templatesready, onTemplatesReady);
            $(document).on(constants.events.activities.viewchanged, onViewChanged);
            $(document).on(constants.authentication.events.loginsuccess, onLoginSuccess);
            $(document).on(constants.authentication.events.logoutsuccess, onLogoutSuccess);
            $(window).on('hashchange', onHashChange);
        };

        // Singleton
        return ViewController.getInstance();
    }
);
