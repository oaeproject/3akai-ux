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

        var _templates = null;
        var _views = null;
        var _menu = null;

        var _settings = null;

        var $helper =  $('#oae-mobile-template-helper');

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
            $(document).on(constants.events.activities.templatesready, onTemplatesReady);
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
                        _settings = data;
                        initViews();
                        renderAllTemplates();
                    }
                },
                error: function(e){
                    console.log(e);
                }
            });
        };

        /**
         * Initialize and render the view templates
         */
        var initViews = function() {
            _views = [];
            _.each(_settings['templates'], function(view){
                _views.push(view);
            });
        };

        /**
         * Renders all the templates and caches them
         */
        var renderAllTemplates = function() {
            _templates = {};
            _.each(_views, function(view){
                for(var key in view){
                    var total = _views.length;
                    var index = _views.indexOf(view) + 1;
                    mobileUtil.renderTemplate(key, view[key], index, total, function(err, obj){
                        _templates[obj.name] = {
                            'template': obj.template,
                            'templateId': obj.templateId,
                            'el': obj.el
                        };
                    });
                }
            });
        };

        /**
         * Called when all templates are rendered
         * Add templates to the helper element and initialize startup view
         */
        var onTemplatesReady = function() {
            for(var template in _templates) $helper.append(_templates[template]['el']);
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