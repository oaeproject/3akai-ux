/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @class User
 *
 * @description
 * Advanced user related functionality, especially common actions
 * that originate from a logged in user. This should only hold functions which
 * are used across multiple pages, and does not constitute functionality related
 * to a single area/page
 *
 * @namespace
 * Advanced user related functionality, especially common actions
 * that originate from a logged in user.
 */
define(
    [
        'jquery',
        'sakai/sakai.api.server',
        'sakai/sakai.api.l10n',
        'sakai/sakai.api.i18n',
        'sakai/sakai.api.util',
        'config/config_custom'
    ],
    function($, sakai_serv, sakai_l10n, sakai_i18n, sakai_util, sakai_conf) {

    var sakaiUserAPI = {
        data : {
            me: {}
        },
        /**
         * @param {Object} extraOptions can include recaptcha: {challenge, response}, locale : 'user_LOCALE', template: 'templateName'
         */
        createUser : function(username, firstName, lastName, email, password, passwordConfirm, extraOptions, callback) {
            var profileData = {}; profileData.basic = {}; profileData.basic.elements = {};
            profileData.basic.elements['firstName'] = {};
            profileData.basic.elements['firstName'].value = firstName;
            profileData.basic.elements['lastName'] = {};
            profileData.basic.elements['lastName'].value = lastName;
            profileData.basic.elements['email'] = {};
            profileData.basic.elements['email'].value = email;
            profileData['email'] = email;
            profileData.basic.access = 'everybody';
            var user = {
                '_charset_': 'utf-8',
                'locale': sakai_l10n.getUserDefaultLocale(),
                'timezone': sakai_l10n.getUserDefaultTimezone(),
                'pwd': password,
                'pwdConfirm': passwordConfirm,
                'firstName': firstName,
                'lastName': lastName,
                'email': email,
                ':name': username,
                ':sakai:profile-import': JSON.stringify(profileData)
            };
            for (var i in extraOptions) {
                if (extraOptions.hasOwnProperty(i)) {
                    switch(i) {
                        case 'recaptcha':
                            user[':create-auth'] = 'reCAPTCHA.net';
                            user[':recaptcha-challenge'] = extraOptions[i].challenge;
                            user[':recaptcha-response'] = extraOptions[i].response;
                            break;
                        case 'locale':
                            user['locale'] = extraOptions[i];
                            break;
                        case 'template':
                            user['template'] = '/var/templates/site/' + extraOptions[i];
                            break;
                        default:
                            break;
                    }
                }
            }
            // Send an Ajax POST request to create a user
            $.ajax({
                url: sakai_conf.URL.CREATE_USER_SERVICE,
                type: 'POST',
                data: user,
                success: function(data) {

                    // Call callback function if set
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }

                },
                error: function(xhr, textStatus, thrownError) {

                    // Call callback function if set
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }

                }
            });
        },

        /**
         * Update a user's profile
         *
         * @param {String} userid The userid of the user to update their profile
         * @param {String} section The profile section (ie basic, publications)
         * @param {Object} data The data to save on this section
         * @param {Array} tags The tags and categories on this user
         * @param {Object} sectionData The current data for this section, before any updates.
         *                             Used for saving tags on the user.
         * @param {Boolean} multiple If this is a multi-assign section, like publications
         * @param {Function} callback The callback function for after the data has been saved
         */
        updateUserProfile: function( userid, section, data, tags, sectionData, multiple, callback ) {
            var url = '/~' + userid + '/public/authprofile',
                saveJSONURL = url + '/' + section + '.profile.json';

            var postData = {
                elements: {}
            };
            $.each( data, function( key, value ) {
                if ( multiple ) {
                    postData.elements[ key ] = {};
                    $.each( value, function( subkey, subvalue ) {
                        //oOrder is special, save it without a value sub-element
                        if ( subkey === 'order' ) {
                            postData.elements[ key ][ subkey ] = subvalue;
                        } else {
                            postData.elements[ key ][ subkey ] = {
                                value: subvalue
                            };
                        }
                    });
                    // TODO set the data nested-like
                } else {
                    postData.elements[ key ] = {
                        value: value
                    };
                }

            });

            var savedFunction = function(success, data) {
                if (success) {
                    var oldDisplayName = sakaiUserAPI.getDisplayName(sakaiUserAPI.data.me.profile);
                    // Update the users profile to reflect changed data
                    $.extend(true, sakaiUserAPI.data.me.profile[section], postData);
                    var newDisplayName = sakaiUserAPI.getDisplayName(sakaiUserAPI.data.me.profile);
                    if (oldDisplayName !== newDisplayName) {
                        $(window).trigger('displayName.profile.updated.sakai');
                    }
                }
                if ($.isFunction(callback)) {
                    callback(success, data);
                }
            };

            var existingTags = sectionData['sakai:tags'] ? sectionData['sakai:tags'].value : false;
            sakai_util.tagEntity( url, tags, existingTags, function( success, final_tags ) {
                sectionData['sakai:tags'] = {
                    value: final_tags
                };
                sakai_serv.saveJSON( saveJSONURL, postData, savedFunction, true );
            });

        },

        deleteUserProfileSection: function( userid, section, subsection, callback ) {
            var url = '/~' + userid + '/public/authprofile/' + section + '/elements/' + subsection + '.json';
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    ':operation': 'delete'
                },
                success: function( data ) {
                    if ( $.isFunction( callback ) ) {
                        callback( data );
                    }
                }
            });
        },

        /**
         * Remove the user credentials in the Sakai OAE system.
         * Note that this doesn't actually remove the user, only its permissions.
         *
         * @example
         * sakai.api.User.createUser({
         *     'firstName': 'User',
         *     'lastName': '0',
         *     'email': 'user.0@sakatest.edu',
         *     'pwd': 'test',
         *     'pwdConfirm': 'test',
         *     ':name': 'user0'
         * });
         *
         * @param {String} userid The id of the user you want to remove from the system
         * @param {Function} [callback] A callback function which will be called after the request to the server.
         */
        removeUser : function(userid, callback) {

            // Send an Ajax POST request to remove a user
            $.ajax({
                url: '/system/userManager/user/' + userid + '.delete.json',
                type: 'POST',
                success: function(data) {

                    // Call callback function if set
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }

                },
                error: function(xhr, textStatus, thrownError) {

                    // Call callback function if set
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }

                }
            });

        },

        /**
         * Gets the profile data for a user
         * @param {String} userid The userId to fetch the profile for
         * @param {Function} callback Callback function to call when the request is complete
         */
        getUser: function(userid, callback) {
            var authprofileURL = '/~' + sakai_util.safeURL(userid) + '/public/authprofile.profile.json';
            sakai_serv.loadJSON(authprofileURL, function(success, data) {
                if (success && data) {
                    callback(true, data);
                } else {
                    callback(false);
                }
            });
        },

        /**
         * Gets the profile data for multiple users
         * @param {Array} userArray Array of userIds to fetch the profiles for
         * @param {Function} callback Callback function to call when the request is complete
         */
        getMultipleUsers: function(userArray, callback) {
            var uniqueUserArray = [];
            var batchRequests = [];

            for (var i in userArray) {
                if (userArray.hasOwnProperty(i) && $.inArray(userArray[i], uniqueUserArray) === -1) {
                    uniqueUserArray.push(userArray[i]);
                }
            }
            for (var ii in uniqueUserArray) {
                if (uniqueUserArray.hasOwnProperty(ii)) {
                    batchRequests.push({
                        'url': '/~' + uniqueUserArray[ii] + '/public/authprofile.profile.json',
                        'method': 'GET',
                        'dataType': 'json'
                    });
                }
            }

            sakai_serv.batch(batchRequests, function(success, reqData) {
                var users = {};
                if (success) {
                    $.each(reqData.results, function(index, val) {
                        var data = $.parseJSON(val.body);
                        if (data && data.userid) {
                            users[data.userid] = data;
                        }
                    });
                }
                callback(users);
            });
        },

        /**
         * Log-in to Sakai OAE
         *
         * @example
         * sakai.api.User.login({
         *     'username': 'user1',
         *     'password': 'test'
         * });
         *
         * @param {Object} credentials JSON object container the log-in information. Contains the username and password.
         * @param {Function} [callback] Callback function that is called after sending the log-in request to the server.
         */
        login : function(credentials, callback) {

            // Argument check
            if (!credentials || !credentials.username || !credentials.password) {
                debug.info('sakai.api.user.login: Not enough or invalid arguments!');
                callback(false, null);
                return;
            }

            /*
             * sakaiauth:un : the username for the user
             * sakaiauth:pw : the password for the user
             * sakaiauth:login : set to 1 because we want to perform a login action
             */
            var data = {
                'sakaiauth:login': 1,
                'sakaiauth:un': credentials.username,
                'sakaiauth:pw': credentials.password,
                '_charset_': 'utf-8'
            };

            // Send the Ajax request
            $.ajax({
                url : sakai_conf.URL.LOGIN_SERVICE,
                type : 'POST',
                success: function(data) {

                    // Call callback function if set
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }

                },
                error: function(xhr, textStatus, thrownError) {

                    // Call callback function if set
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }

                },
                data : data
            });

        },


        /**
         * Log-out from Sakai OAE
         *
         * @example sakai.api.user.logout();
         * @param {Function} [callback] Callback function that is called after sending the log-in request to the server.
         */
        logout : function(callback) {

            /*
             * Request to the logout service.
             */
            if (sakai_conf.followLogoutRedirects) {
                window.location = sakai_conf.URL.LOGOUT_SERVICE;
            } else {
                // hit the logout service to destroy the session
                $.ajax({
                    url: sakai_conf.URL.LOGOUT_SERVICE,
                    // SAKIII-5968 - we need to use cache:false since doing a POST doesn't always work.
                    cache: false,
                    complete: function(xhrInner, textStatusInner) {
                        callback(textStatusInner === 'success');
                    }
                });
            }
        },

        /**
         * Safely retrieves an element value from the user's profile
         *
         * @param {Object} profile the user's profile (data.me.profile for the current user)
         * @param {String} eltName the element name to retrieve the value for
         * @return {String} the value of the element name provided
         */
        getProfileBasicElementValue : function(profile, eltName) {
            var ret = '';
            if (profile !== undefined &&
                profile.basic !== undefined &&
                profile.basic.elements !== undefined &&
                profile.basic.elements[eltName] !== undefined &&
                profile.basic.elements[eltName].value !== undefined) {
                    ret = profile.basic.elements[eltName].value;
                }
            return $.trim(ret);
        },

        /**
         * Sets a value to the user's basic profile information
         *
         * @param {Object} profile the user's profile (data.me.profile for the current user)
         * @param {String} eltName the element name to retrieve the value for
         * @param {String} eltValue the value to place in the element
         */
        setProfileBasicElementValue : function(profile, eltName, eltValue) {
            if (profile !== undefined &&
                profile.basic !== undefined &&
                profile.basic.elements !== undefined &&
                profile.basic.elements[eltName] !== undefined) {

                profile.basic.elements[eltName].value = eltValue;
            }
        },


        /**
         * Retrieves all available information about a logged in user and stores it under data.me object. When ready it will call a specified callback function
         *
         * @param {Function} [callback] A function which will be called when the information is retrieved from the server.
         * The first argument of the callback is a boolean whether it was successful or not, the second argument will contain the retrieved data or the xhr object
         * @return {Void}
         */
        loadMeData : function(callback) {
            var cache = true;
            // don't use cache for IE8
            if ($.browser.msie && parseInt($.browser.version, 10) < 9) {
                cache = false;
            }

            // Start a request to the service
            $.ajax({
                // Get the service url from the config file
                url: sakai_conf.URL.ME_SERVICE,
                cache: cache,
                success: function(data) {
                    sakaiUserAPI.data.me = sakai_serv.convertObjectToArray(data, null, null);

                    // Check for firstName and lastName property - if not present use 'rep:userId' for both (admin for example)
                    if (sakaiUserAPI.getProfileBasicElementValue(sakaiUserAPI.data.me.profile, 'firstName') === '') {
                        sakaiUserAPI.setProfileBasicElementValue(sakaiUserAPI.data.me.profile, 'firstName', sakaiUserAPI.data.me.profile['rep:userId']);
                    }
                    if (sakaiUserAPI.getProfileBasicElementValue(sakaiUserAPI.data.me.profile, 'lastName') === '') {
                        sakaiUserAPI.setProfileBasicElementValue(sakaiUserAPI.data.me.profile, 'lastName', sakaiUserAPI.data.me.profile['rep:userId']);
                    }

                    // SAKIII-2419 server isn't saving basic access param
                    if (sakaiUserAPI.data.me.profile.basic.access === undefined) {
                        sakaiUserAPI.data.me.profile.basic.access = 'everybody';
                    }

                    if (sakaiUserAPI.data.me.user.properties) {
                        if (sakaiUserAPI.data.me.user.properties.isAutoTagging) {
                            if (sakaiUserAPI.data.me.user.properties.isAutoTagging === 'true') {
                                sakaiUserAPI.data.me.user.properties.isAutoTagging = true;
                            } else if (sakaiUserAPI.data.me.user.properties.isAutoTagging === 'false') {
                                sakaiUserAPI.data.me.user.properties.isAutoTagging = false;
                            }
                        }
                        if (sakaiUserAPI.data.me.user.properties.sendTagMsg) {
                            if (sakaiUserAPI.data.me.user.properties.sendTagMsg === 'true') {
                                sakaiUserAPI.data.me.user.properties.sendTagMsg = true;
                            } else if (sakaiUserAPI.data.me.user.properties.sendTagMsg === 'false') {
                                sakaiUserAPI.data.me.user.properties.sendTagMsg = false;
                            }
                        }
                    }

                    // Call callback function if set
                    if ($.isFunction(callback)) {
                        callback(true, sakaiUserAPI.data.me);
                    }
                },
                error: function(xhr, textStatus, thrownError) {

                    // Log error
                    debug.error('sakai.api.User.loadMeData: Could not load logged in user data from the me service!');

                    if (xhr.status === 500 && window.location.pathname !== '/dev/500.html' && window.location.pathname !== '/500') {
                        document.location = '/500';
                    }

                    // Call callback function if set
                    if ($.isFunction(callback)) {
                        callback(false, xhr);
                    }
                }
            });
        },

        /**
         * Retrieves the profile picture for the user
         *
         * @param {Object} profile the users profile (data.me.profile for the current user)
         * @return {String} the url for the profile picture
         */
        getProfilePicture : function(profile) {
            return sakai_util.constructProfilePicture(profile, 'user');
        },

        /**
         * Retrieves the first name display to use for the user from config
         * and parses it from the profile elements
         *
         * @param {Object} profile the user's profile (data.me.profile for the current user)
         * @param {Boolean} doSafeOutput (Optional) perform html safe output. Defaults to true
         * @return {String} the first name to show for a user
         */
        getFirstName : function(profile, doSafeOutput) {
            var safeOutput = true;
            if (doSafeOutput !== undefined) {
                safeOutput = doSafeOutput;
            }

            var configFirstName = [sakai_conf.Profile.userFirstNameDisplay];
            var nameToReturn = '';

            if (profile &&
                profile.basic &&
                profile.basic.elements &&
                profile.basic.elements[configFirstName] !== undefined &&
                profile.basic.elements[configFirstName].value !== undefined) {
                nameToReturn += profile.basic.elements[configFirstName].value;
            }

            if (safeOutput) {
                return sakai_util.Security.safeOutput($.trim(nameToReturn));
            } else {
                return $.trim(nameToReturn);
            }
        },

        /**
         * Retrieves the display name to use for the user from config
         * and parses it from the profile elements
         *
         * @param {Object} profile the user's profile (data.me.profile for the current user)
         * @param {Boolean} doSafeOutput (Optional) perform html safe output. Defaults to true
         * @return {String} the name to show for a user
         */
        getDisplayName : function(profile, doSafeOutput) {
            var safeOutput = true;
            if (doSafeOutput !== undefined) {
                safeOutput = doSafeOutput;
            }

            var configDisplayName = [sakai_conf.Profile.userNameDisplay, sakai_conf.Profile.userNameDefaultDisplay];
            var nameToReturn = '';
            var done = false;
            var idx = 0;

            var parseName = function(i,key) {
                if (profile &&
                    profile.basic &&
                    profile.basic.elements &&
                    profile.basic.elements[key] !== undefined &&
                    profile.basic.elements[key].value !== undefined &&
                    $.trim(profile.basic.elements[key].value) !== '') {
                   nameToReturn += profile.basic.elements[key].value + ' ';
                   done = true;
               }
            };

            // iterate over the configDisplayName object until a valid non-empty display name is found
            while (!done && idx < 2) {
                if (configDisplayName[idx] !== undefined && configDisplayName[idx] !== '') {
                    var configEltsArray = configDisplayName[idx].split(' ');
                    $(configEltsArray).each(parseName);
                }
                idx++;
            }

            if (!done) {
                if (profile && profile['rep:userId']) {
                    return profile['rep:userId'];
                } else {
                    return '';
                }
            } else {
                if (safeOutput) {
                    return sakai_util.Security.safeOutput($.trim(nameToReturn));
                } else {
                    return $.trim(nameToReturn);
                }
            }
            return false;
        },

        /**
         * Get a user's short description from their profile
         * This is based off of the configuration in config.js
         * Example: '${role} in ${department}' could translate to 'Undergraduate Student in Computer Science'
         *           based on the configuration in config.js and the user's profile information
         * If the user doesn't have the profile information requested by config.js, the function
         * will remove the token from the string and any modifiers before the token after the previous token
         * In the above example, if the user only had a department, the resulting string would be 'Computer Science'
         *
         * @param {Object} profile The user's profile to get a description from
         * @return {String} the user's short description
         */
        getShortDescription : function(profile) {
            var shortDesc = sakai_conf.Profile.shortDescription || '';
            var tokenRegex = /\$\{[A-Za-z]+\}/gi;
            var tokens = shortDesc.match(tokenRegex);
            var lastReplacementValue = '';
            $(tokens).each(function(i, val) {
                var profileNode = val.match(/[A-Za-z]+/gi)[0];
                if (profile.basic.elements[profileNode] && $.trim(profile.basic.elements[profileNode].value) !== '') {
                    /*if (lastReplacementValue === '' && tokens[i-1]) {
                        // replace everything before this and after the last token
                    } */
                    if (sakai_conf.Profile.configuration.defaultConfig.basic.elements[profileNode].type === 'select') {
                        lastReplacementValue = profile.basic.elements[profileNode].value;
                        lastReplacementValue = sakai_conf.Profile.configuration.defaultConfig.basic.elements[profileNode].select_elements[lastReplacementValue];
                        lastReplacementValue = sakai_i18n.General.process(lastReplacementValue);
                    } else {
                        lastReplacementValue = profile.basic.elements[profileNode].value;
                    }

                    shortDesc = shortDesc.replace(val, lastReplacementValue);
                } else {
                    if (tokens[i-1]) { // this is not the first time through
                        var indexToStart = 0;
                        // if the previous token's replaced value exists
                        if (lastReplacementValue !== '' && shortDesc.indexOf(shortDesc.indexOf(lastReplacementValue)) !== -1) {
                            // the index to start replacing at is the end of the last replacement
                            indexToStart = shortDesc.indexOf(shortDesc.indexOf(lastReplacementValue)) + lastReplacementValue.length;
                        }
                        var indexToEnd = shortDesc.indexOf(val) + val.length;
                        shortDesc = $.trim(shortDesc.replace(shortDesc.substring(indexToStart, indexToEnd), ''));
                    } else {
                        shortDesc = $.trim(shortDesc.replace(val, ''));
                    }
                }
            });
            return $.trim(shortDesc);
        },

        getContacts : function(callback) {
            if (this.data.me.mycontacts) {
                if ($.isFunction(callback)) {
                    callback();
                }
            } else {
                // has to be synchronous
                $.ajax({
                    url: sakai_conf.URL.CONTACTS_FIND_ALL + '?page=0&items=100',
                    async: false,
                    cache: false,
                    success: function(data) {
                        $.each(data.results, function(index, contact) {
                            contact.profile.basic.elements.picture = sakai_util.constructProfilePicture(contact.profile);
                        });
                        sakaiUserAPI.data.me.mycontacts = data.results;
                        if ($.isFunction(callback)) {
                            callback();
                        }
                    }
                });
            }
        },

        checkIfConnected : function(userid) {
            var ret = false;
            this.getContacts(function() {
                for (var i in sakaiUserAPI.data.me.mycontacts) {
                    if (i && sakaiUserAPI.data.me.mycontacts.hasOwnProperty(i)) {
                        if (sakaiUserAPI.data.me.mycontacts[i].target === userid) {
                            ret = true;
                        }
                    }
                }
            });
            return ret;
        },

        /**
         * Get a contacts connection state, or return false if user is not a contact
         *
         * @param {String} the user's ID
         * @param {Function} [callback] A function which will be called when the information is retrieved from the server.
         */
        getConnectionState : function(userid, callback) {
            var ret = false;
            this.getContacts(function() {
                for (var i in sakaiUserAPI.data.me.mycontacts) {
                    if (i && sakaiUserAPI.data.me.mycontacts.hasOwnProperty(i)) {
                        if (sakaiUserAPI.data.me.mycontacts[i].target === userid && sakaiUserAPI.data.me.mycontacts[i].details) {
                            ret = sakaiUserAPI.data.me.mycontacts[i].details['sakai:state'];
                        }
                    }
                }
                if ($.isFunction(callback)) {
                    callback(ret);
                }
            });
        },

        acceptContactInvite : function(inviteFrom, callback) {
            $.ajax({
                url: '/~' + sakai_util.safeURL(sakaiUserAPI.data.me.user.userid) + '/contacts.accept.html',
                type: 'POST',
                data: {
                    'targetUserId': inviteFrom
                },
                success: function(data) {
                    if (sakaiUserAPI.data.me.mycontacts) {
                        $.each(sakaiUserAPI.data.me.mycontacts, function(i, contact) {
                            if (contact.target === inviteFrom) {
                                contact.details['sakai:state'] = 'ACCEPTED';
                            }
                        });
                    }
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                    if (sakai_global.profile && sakai_global.profile.main && sakai_global.profile.main.mode && sakai_global.profile.main.mode.value !== 'view') {
                        $(window).trigger('contacts.accepted.sakai');
                    }
                },
                error: function() {
                    if ($.isFunction(callback)) {
                        callback(false, {});
                    }
                }
            });
        },

        ignoreContactInvite : function(inviteFrom, callback) {
            $.ajax({
                url: '/~' + sakai_util.safeURL(sakaiUserAPI.data.me.user.userid) + '/contacts.ignore.html',
                type: 'POST',
                data: {
                    'targetUserId': inviteFrom
                },
                success: function(data) {
                    if (sakaiUserAPI.data.me.mycontacts) {
                        $.each(sakaiUserAPI.data.me.mycontacts, function(i, contact) {
                            if (contact.target === inviteFrom) {
                                contact.details['sakai:state'] = 'IGNORED';
                            }
                        });
                    }
                    $.ajax({
                        url: '/~' + sakai_util.safeURL(sakaiUserAPI.data.me.user.userid) + '/contacts.remove.html',
                        type: 'POST',
                        data: {
                            'targetUserId': inviteFrom
                        },
                        success: function(data) {
                            if ($.isFunction(callback)) {
                                callback(true, data);
                            }
                            if (sakai_global.profile && sakai_global.profile.main && sakai_global.profile.main.mode && sakai_global.profile.main.mode.value !== 'view') {
                                $(window).trigger('lhnav.updateCount', ['contacts', -1]);
                            }
                        },
                        error: function() {
                            if ($.isFunction(callback)) {
                                callback(false, {});
                            }
                        }
                    });
                }
            });
        },

        respondToSiteJoinRequest : function(inviteFrom, siteToJoin, accept, callback) {
            var action = accept ? 'approve' : 'deny';
            $.ajax({
                url: siteToJoin + '.' + action + '.html',
                type: 'POST',
                data: {
                    'user': inviteFrom
                },
                success: function(data) {
                    if ($.isFunction(callback)) {
                        callback(true, data);
                    }
                },
                error: function() {
                    if ($.isFunction(callback)) {
                        callback(false, {});
                    }
                }
            });
        },

        getUpdatedCounts : function(medata, callback) {
            $.ajax({
                url: medata.profile.homePath + '/public/authprofile.profile.json',
                success: function(profile) {
                    medata.profile.counts = profile.counts;
                    if ($.isFunction(callback)) {
                        callback(true);
                    }
                },
                error: function() {
                    if ($.isFunction(callback)) {
                        callback(false);
                    }
                }
            });
        },

        isAnonymous : function(meData) {
            if (meData.user.userid) {
                return false;
            } else {
                return true;
            }
        },

        /**
         * Function to process search results for users
         *
         * @param {Object} results Search results to process
         * @param {Object} meData User object for the user
         * @returns {Object} results Processed results
         */
        preparePeopleForRender: function(results, meData) {
            $.each(results, function(i, item) {
                // The My Contacts feed comes back with everything wrapped inside of
                // a target object
                if (item.target) {
                    item = item.profile;
                }
                if (item && item['rep:userId'] && item['rep:userId'] !== 'anonymous') {
                    item.id = item['rep:userId'];
                    item.userid = item['rep:userId'];
                    item.picture = sakaiUserAPI.getProfilePicture(item);
                    item.name = sakaiUserAPI.getDisplayName(item);
                    item.nameShort = sakai_util.applyThreeDots(item.name, 580, {max_rows: 1,whole_word: false}, 's3d-bold', true);
                    item.nameShorter = sakai_util.applyThreeDots(item.name, 150, {max_rows: 1,whole_word: false}, 's3d-bold', true);

                    // use large default user icon on search page
                    if (item.picture === sakai_conf.URL.USER_DEFAULT_ICON_URL) {
                        item.pictureLarge = sakai_conf.URL.USER_DEFAULT_ICON_URL_LARGE;
                    }
                    if (item['sakai:tags'] && item['sakai:tags'].length > 0) {
                        item.tagsProcessed = sakai_util.formatTags(item['sakai:tags']);
                    } else if (item.basic && item.basic.elements && item.basic.elements['sakai:tags']) {
                        item.tagsProcessed = sakai_util.formatTags(item.basic.elements['sakai:tags'].value);
                    }

                    item.connected = false;
                    item.accepted = false;
                    item.invited = item.invited !== undefined ? item.invited : false;
                    // Check if this user is a friend of us already.
                    var connectionState = false;
                    if (item['sakai:state'] || results[i]['details']) {
                        connectionState = item['sakai:state'] || results[i]['details']['sakai:state'];
                        item.connected = true;
                        // if invited state set invited to true
                        if (connectionState === 'INVITED') {
                            item.invited = true;
                        } else if (connectionState === 'PENDING') {
                            item.pending = true;
                        } else if (connectionState === 'ACCEPTED') {
                            item.accepted = true;
                        } else if (connectionState === 'NONE') {
                            //user.none = true;
                            item.connected = false;
                        }
                    }

                    // Check if the user you found in the list isn't the current
                    // logged in user
                    if (item.userid === meData.user.userid) {
                        item.isMe = true;
                    }
                    results[i] = item;
                }
            });
            return results;
        },

        /**
         * Load the privacy settings for the current user's account
         * @param {Function} callback    Function to call once the privacy setting has been retrieved. Returns
         *                               'public' for public user accounts or 'everyone' for user
         *                               accounts that are only visible to logged in users
         */
        loadPrivacySettings: function(callback) {
            $.ajax({
                url: '/~' + sakaiUserAPI.data.me.user.userid + '.acl.json',
                success: function(data) {
                    var setting = data['anonymous'].granted && data['anonymous'].granted.length ? 'public' : 'everyone';
                    if ($.isFunction(callback)) {
                        callback(setting);
                    }
                },
                error: function() {
                    if ($.isFunction(callback)) {
                        callback(false);
                    }
                }
            });
        },

        /**
         * Store new account privacy settings for the current user. This can either make the account
         * public or only visible to logged in users
         * @param {String} option         'public' for a public account or 'everyone' for an account that's only
         *                                visible to logged in users
         * @param {Function} callback     Function to call once the privacy setting has been stored. Returns
         *                                true when the change was successful and false when the change failed
         */
        savePrivacySettings: function(option, callback) {
            // Both the user's home folder and authorizable node need to be updated
            var batchRequest = [{
                'url': '/~' + sakaiUserAPI.data.me.user.userid + '.modifyAce.json',
                'method':'POST',
                'parameters':{
                    'principalId': 'anonymous',
                    'privilege@jcr:read': (option === 'public' ? 'granted' : 'denied')
                }
            }, {
                'url': '/system/userManager/user/' + sakaiUserAPI.data.me.user.userid + '.modifyAce.json',
                'method': 'POST',
                'parameters':{
                    'principalId': 'anonymous',
                    'privilege@jcr:read': (option === 'public' ? 'granted' : 'denied')
                }
            }];
            sakai_serv.batch(batchRequest, function(success, data) {
                if ($.isFunction(callback)) {
                    callback(success);
                }
            });
            return false;
        }

    };

    return sakaiUserAPI;
});
