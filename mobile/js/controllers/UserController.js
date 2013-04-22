define(
    [
        'oae.core',
        '/mobile/js/constants/constants.js'
    ],
    function(oae, constants) {

        /////////////////////
        //// Properties /////
        /////////////////////

        // Instance of UserController
        var instance = null;
        // Instance of MainController
        var mainController = null;

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
            initialize: function(controller) {
                // Bind events
                addBinding();
                // Store an instance of MainController
                mainController = controller;
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
                    try{
                        oae.init(function(e) {
                            $(document).trigger(constants.events.activities.activityend);
                            $(document).trigger(constants.authentication.events.loginsuccess);
                        });
                    }catch(e){
                        var confirm = false;
                        var type = constants.alerts.types.error;
                        var message = oae.api.i18n.translate('__MSG__SIGNED_IN_SUCCESSFUL_BUT_PROBLEM_OCCURED__');
                        $(document).trigger(constants.alerts.init, {'confirm': confirm, 'type': type, 'message': message});
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
                    try{
                        oae.init(function(e) {
                            $(document).trigger(constants.events.activities.activityend);
                            $(document).trigger(constants.authentication.events.logoutsuccess);
                        });
                    }catch(e){
                        var confirm = false;
                        var type = constants.alerts.types.error;
                        var message = oae.api.i18n.translate('__MSG__SIGNED_OUT_SUCCESSFUL_BUT_PROBLEM_OCCURED__');
                        $(document).trigger(constants.alerts.init, {'confirm': confirm, 'type': type, 'message': message});
                        $(document).trigger(constants.events.activities.activityend);
                    }
                }
            });
        };

        /**
         * Login with a social network api
         *
         * @param {Event}       e                   The dispatched event
         * @param {String}      type                The external login type (e.g. cas, facebook...)
         */
        var loginWithSocialNetwork = function(e, type) {
            if (type) {
                $(document).trigger(constants.events.activities.activitystart);
                document.location = constants.authentication.urls.authpath + type;
            }
        };

        ////////////////////////
        /////// BINDING ////////
        ////////////////////////

        /**
         * Listen to events dispatched from controllers
         */
        var addBinding = function() {
            $(document).on(constants.authentication.events.loginattempt, login);
            $(document).on(constants.authentication.events.logoutattempt, logout);
            $(document).on(constants.authentication.events.socialloginattempt, loginWithSocialNetwork);
        };

        /**
         * Returns an instance of UserController
         */
        return UserController.getInstance();
    }
);
