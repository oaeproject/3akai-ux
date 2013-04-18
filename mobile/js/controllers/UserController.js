define(
    [
        'oae.core',
        '/mobile/js/constants/constants.js',
        '/mobile/js/mobile.util.js'
    ],
    function(oae, constants, mobileUtil) {

        /////////////////////
        //// Constructor ////
        /////////////////////

        // Instance of UserController
        var instance = null;
        // Instance of MainController
        var mainController = null;
        // The logintype: local/external
        var loginType = null;

        /////////////////////
        //// Constructor ////
        /////////////////////

        var UserController = function() {
            if (instance !== null) {
                throw new Error("Cannot instantiate more than one UserController, use UserController.getInstance()");
            }
        };

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
         *
         * @return {UserController} instance        Returns an instance of the UserController
         */
        UserController.getInstance = function() {
            if (instance === null) {
                instance = new UserController();
            }
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
                if (err) {
                    $(document).trigger(constants.events.activities.activityend);
                    obj.callback(err);
                } else {
                    loginType = constants.authentication.types.local;
                    try{
                        oae.init(function(e) {
                            $(document).trigger(constants.events.activities.activityend);
                            $(document).trigger(constants.authentication.events.loginsuccess);
                        });
                    }catch(e){
                        window.alert('Logged in successfully, but a problem occured when loading the page');
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
                if (err) {
                    obj.callback(err);
                    $(document).trigger(constants.events.activities.activityend);
                } else {
                    loginType = null;
                    try{
                        oae.init(function(e) {
                            $(document).trigger(constants.events.activities.activityend);
                            $(document).trigger(constants.authentication.events.logoutsuccess);
                        });
                    }catch(e){
                        window.alert('Logged out successfully, but a problem occured when loading the page');
                        $(document).trigger(constants.events.activities.activityend);
                    }
                }
            });
        };

        /**
         * Login with a social network api
         */
        var loginWithSocialNetwork = function(e, type) {
            $(document).trigger(constants.events.activities.activitystart);
            var url = "";
            if (type && type != null) {
                loginType = type;
                switch(type) {
                    case constants.authentication.types.cas:
                        url = constants.authentication.urls.cas;
                        break;
                    case constants.authentication.types.facebook:
                        url = constants.authentication.urls.facebook;
                        break;
                    case constants.authentication.types.google:
                        url = constants.authentication.urls.google;
                        break;
                    case constants.authentication.types.shibboleth:
                        url = constants.authentication.urls.shibboleth;
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
