define(
    [
        'oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js'
    ],
    function(oae, constants, mobileUtil){

        // Properties
        var instance = null,
            mainController = null,
            _loginType = null;

        /////////////////////
        //// Constructor ////
        /////////////////////

        function UserController(){
            if(instance !== null){
                throw new Error("Cannot instantiate more than one UserController, use UserController.getInstance()");
            }
        }

        ////////////////////
        // Public methods //
        ////////////////////

        UserController.prototype = {

            /**
             * Initialize UserController
             */
            initialize: function(_mainController) {
                // Bind events
                addBinding();
                // Store an instance of MainController
                mainController = _mainController;
            }
        };

        /**
         * Returns an instance of the MainController
         * @return Class {*}        Returns an instance of the MainController
         */
        UserController.getInstance = function(){
            if(instance === null) instance = new UserController();
            return instance;
        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         * Login
         *
         * @param {Event}       e                   The dispatched event
         * @param {Object}      obj                 The object containing the login values
         * @param {String}      obj.username        The username
         * @param {String}      obj.password        The password
         * @param {Function}    obj.callback        The callback function
         */
        var login = function(e, obj) {
            $(document).trigger(constants.events.activities.activitystart);
            oae.api.authentication.login(obj.username, obj.password, function(err) {
                if(err) {
                    $(document).trigger(constants.events.activities.activityend);
                    obj.callback(err);
                }else{
                    _loginType = constants.authentication.types.local;
                    try{
                        setTimeout(function(){
                            oae.init(function(e){
                                $(document).trigger(constants.events.activities.activityend);
                                $(document).trigger(constants.authentication.events.loginsuccess);
                            });
                        }, 300);
                    }catch(e){
                        console.log('[UserController] Executing oae.init failed after login');
                        $(document).trigger(constants.events.activities.activityend);
                    }
                }
            });
        };

        /**
         * Logout
         *
         * @param {Event}       e                   The dispatched event
         * @param {Object}      obj                 The parameters
         * @param {Function}    obj.callback        The callback function
         */
        var logout = function(e, obj) {
            $(document).trigger(constants.events.activities.activitystart);
            oae.api.authentication.logout(function(err) {
                if(err) {
                    obj.callback(err);
                    $(document).trigger(constants.events.activities.activityend);
                }else{
                    _loginType = null;
                    try{
                        setTimeout(function(){
                            oae.init(function(e){
                                $(document).trigger(constants.events.activities.activityend);
                                $(document).trigger(constants.authentication.events.logoutsuccess);
                            });
                        }, 300);
                    }catch(e){
                        console.log('[UserController] Executing oae.init failed after logout');
                        $(document).trigger(constants.events.activities.activityend);
                    }
                }
            });
        };

        /**
         * Login with a social network api
         */
        var loginWithSocialNetwork = function(e, type) {
            var url = "";
            if(type && type != null){
                _loginType = type;
                switch(type){
                    case constants.authentication.types.facebook:
                        url = constants.authentication.urls.facebook;
                        break;
                    case constants.authentication.types.google:
                        url = constants.authentication.urls.google;
                        break;
                    case constants.authentication.types.twitter:
                        url = constants.authentication.urls.twitter;
                        break;
                }
                document.location = url;
            }
        };

        // Private methods
        var addBinding = function() {
            $(document).on(constants.authentication.events.loginattempt, login);
            $(document).on(constants.authentication.events.logoutattempt, logout);
            $(document).on(constants.authentication.events.socialloginattempt, loginWithSocialNetwork);
        };

        // Singleton
        return UserController.getInstance();
    }
);
