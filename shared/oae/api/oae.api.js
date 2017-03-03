/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/*!
 * Initializes the OAE UI APIs. First of all, the me data will be retrieved. After that, the configuration for the current
 * tenant will be retrieved, and the localization and internationalization APIs will be initialized. Finally, the widgets declared
 * in the page source will be rendered.
 *
 * This module is intended to be referenced as a *plugin*, not a regular module. Do not depend on this directly, instead depend
 * on `oae.core`, which invokes this plugin, and also efficiently pre-loads many third-party dependencies.
 */
define(['underscore', 'oae.api.admin', 'oae.api.authentication', 'oae.api.config', 'oae.api.content', 'oae.api.comment', 'oae.api.discussion', 'oae.api.folder',
        'oae.api.follow','oae.api.group', 'oae.api.i18n', 'oae.api.l10n', 'oae.api.meetup', 'oae.api.push', 'oae.api.user', 'oae.api.util', 'oae.api.widget'],

    function(_, adminAPI, authenticationAPI, configAPI, contentAPI, commentAPI, discussionAPI, folderAPI, followAPI, groupAPI, i18nAPI, l10nAPI, meetupAPI, pushAPI, userAPI, utilAPI, widgetAPI) {

        /*!
         * Object containing all of the available OAE API modules and their functions, as well as some
         * cached data (e.g. me object) that will be passed in when a module adds `oae.api!` as a dependency.
         */
        var oae = {
            'api': {
                'admin': adminAPI,
                'authentication': authenticationAPI,
                'config': configAPI,
                'content': contentAPI,
                'comment': commentAPI,
                'discussion': discussionAPI,
                'folder': folderAPI,
                'follow': followAPI,
                'group': groupAPI,
                'i18n': i18nAPI,
                'l10n': l10nAPI,
                'meetup': meetupAPI,
                'push': pushAPI,
                'user': userAPI,
                'util': utilAPI,
                'widget': widgetAPI
            },
            'data': {}
        };

        /*!
         * Initialize OAE after all of the API files have loaded. This will first of all fetch the current user's me
         * feed. Then, the localization API and the internationalization API will be initialized with the locale information
         * that has been found in the me feed. After that, the full `oae` object will be returned to the module that has required
         * `oae.api!`
         */
        var initOAE = function(callback) {
            // Keep track of our original window location, as we don't have control of some widgets
            // using plugins that clear query string variables. We have to use a string because
            // `window.location` is stateful and can change
            oae.data.location = window.location.toString();
            // Get the me feed
            oae.api.user.getMe(function(err, meObj) {
                if (err) {
                    if (err.code === 502) {
                        return utilAPI.redirect().unavailable();
                    } else if (err.code === 503) {
                        return utilAPI.redirect().maintenance();
                    }
                    throw new Error('Could not load the me feed. Make sure that the server is running and properly configured');
                }
                // Add the me object onto the oae data object
                oae.data.me = meObj;

                // Initialize the config API
                oae.api.config.init(function(err) {
                    if (err) {
                        throw new Error('Could not initialize the config API');
                    }

                    // Initialize l10n
                    var userLocale = oae.data.me.locale;
                    oae.api.l10n.init(userLocale, function(err) {
                        if (err) {
                            throw new Error('Could not initialize the l10n API');
                        }

                        // Initialize i18n
                        oae.api.i18n.init(userLocale, function(err) {
                            if (err) {
                                throw new Error('Could not initialize the i18n API');
                            }

                            // Initialize utility API
                            oae.api.util.init(oae.data.me, function() {

                                // Initialize widgets API
                                oae.api.widget.init(userLocale, function(err) {
                                    if (err) {
                                        throw new Error('Could not initialize the widgets API');
                                    }

                                    // Add a `.ie-lt10` class to the html element that can be used for CSS fallbacks in IE9.
                                    // We can feature detect IE9 by checking for the unsupported `requestAnimationFrame` function
                                    // TODO: Once we drop support for IE9 this can be removed
                                    if (!window.requestAnimationFrame) {
                                        $('html').addClass('ie-lt10');
                                    }

                                    // Add a `.mobile` class to the html element when the user is using a mobile device.
                                    // This allows for showing/hiding elements on a mobile device through CSS
                                    if (oae.api.util.isHandheldDevice()) {
                                        $('html').addClass('mobile');
                                    }

                                    // Add a `.anon` class to the html element when the user is anonymous.
                                    // This allows for showing/hiding elements for anonymous users through CSS
                                    if (oae.data.me.anon) {
                                        $('html').addClass('anon');
                                    }

                                    // The APIs have now fully initialized. All javascript that
                                    // depends on the initialized core APIs can now execute
                                    callback(oae);

                                    // We now load the widgets in the core HTML
                                    oae.api.widget.loadWidgets(null, null, null, function() {

                                        setupPreUseActions();

                                        // We can show the body as internationalization and
                                        // initial widget loading have finished
                                        $('body').css('visibility', 'visible');

                                        // Apply auto-focus after the core HTML widgets have loaded.
                                        // The rendering will cause HTML5 autofocus to be lost, so
                                        // we re-inforce it here
                                        var $focus = $('[autofocus]:first');
                                        if ($focus.is('input')) {
                                            // Ensure that, when focussed, the
                                            // cursor will be positioned at the
                                            // end of the input content
                                            var val = $focus.val();
                                            $focus[0].selectionStart = val.length;
                                            $focus[0].selectionEnd = val.length;
                                        }
                                        $focus.focus();

                                        // Initialize websocket push API, unless we're on the
                                        // global admin tenant
                                        if (oae.data.me.tenant.alias !== 'admin') {
                                            // Ensure the push API is initialized
                                            oae.api.push.init();
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        };


        /////////////////////
        // Pre-use actions //
        /////////////////////

        /**
         * Trigger the user details widgets if the user needs to provide a valid display name
         * or email address. If the user needs to accept the Terms and Conditions, the Terms
         * and Conditions widget will be triggered.
         */
        var setupPreUseActions = function() {
            // Global admins don't have to perform any pre-use actions
            if (oae.data.me.isGlobalAdmin) {
                return;
            }

            // Perform any email verification if instructed before we try and determine if the
            // user's profile info is valid
            verifyEmail(function() {
                // No other pre-use actions are applicable to anonymous users
                if (oae.data.me.anon) {
                    return;
                }

                // Perform any invitation accepting if instructed and if possible
                acceptInvitation(function() {
                    var needsToProvideDisplayName = !oae.api.util.validation().isValidDisplayName(oae.data.me.displayName);
                    var needsToProvideEmail = !oae.data.me.email;

                    // Show the edit profile widget if a valid name or email address need to be provided
                    if (needsToProvideDisplayName || needsToProvideEmail) {
                        $(document).trigger('oae.trigger.editprofile');

                    // Show the Terms and Conditions widget if the user needs to accept the Terms and Conditions
                    } else if (oae.data.me.needsToAcceptTC) {
                        oae.api.widget.insertWidget('termsandconditions', null, null, true);
                    }
                });
            });
        };

        /**
         * Accept the invitation if the query string indicates there is an invitation to be accepted
         *
         * @param  {Function}       callback            Invoked when the accept invitation request is complete
         */
        var acceptInvitation = function(callback) {
            var invitationToken = oae.api.util.url().param('invitationToken');
            if (!invitationToken) {
                return callback();
            } else if (oae.data.me.needsToAcceptTC) {
                // Do not attempt to accept an invitation when we still need to
                // accept the T&C
                return callback();
            }

            // We need to ensure we can handle activities that happen as a result of accepting this
            // invitation, so set up the push API a bit earlier than we normally would have
            oae.api.push.init(function() {

                // Accept the invitation
                oae.api.user.acceptInvitation(invitationToken, function(err, result) {
                    if (err && err.code !== 404) {
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__EMAIL_INVITATION_FAILED__'),
                            oae.api.i18n.translate('__MSG__AN_ERROR_OCCURRED_WHILE_ACCEPTING_YOUR_INVITATION__'),
                            'error');
                        return callback();
                    } else if (err) {
                        return callback();
                    }

                    return callback();
                });
            });
        };

        /**
         * Verify the user's email if there is instruction in the query string to do so with the
         * specified verification token. If there is no `verifyEmail` query string parameter, then
         * this will simply return doing no work.
         *
         * @param  {Function}   callback    Invoked when the email verification has completed, regardless if it was successful or failed
         */
        var verifyEmail = function(callback) {
            var emailToken = oae.api.util.url().param('verifyEmail');
            if (!emailToken) {
                return callback();
            } else if (oae.data.me.anon) {
                // If we are anonymous, we have to login first, so refresh with
                // a redirect url that indicates we should invoke signin
                return oae.api.util.redirect().login();
            }

            var previousEmail = oae.data.me.email;
            oae.api.user.getEmailVerificationStatus(oae.data.me.id, function(err, unverifiedEmail) {
                if (err) {
                    // Notify if we could not determine there was an email to be verified
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__EMAIL_VERIFICATION_FAILED__'),
                        oae.api.i18n.translate('__MSG__AN_ERROR_OCCURRED_VERIFYING_YOUR_EMAIL_ADDRESS__'),
                        'error');

                    return callback();
                } else if (unverifiedEmail) {
                    oae.api.user.verifyEmail(oae.data.me.id, emailToken, function(err) {
                        if (err) {
                            // Notify if we failed to perform the actual email verification
                            oae.api.util.notification(
                                oae.api.i18n.translate('__MSG__EMAIL_VERIFICATION_FAILED__'),
                                oae.api.i18n.translate('__MSG__AN_ERROR_OCCURRED_VERIFYING_YOUR_EMAIL_ADDRESS__'),
                                'error');

                            return callback();
                        }

                        // Update the me data appropriately
                        oae.data.me.email = unverifiedEmail;

                        // Notify that we successfully verified the email address
                        oae.api.util.notification(
                            oae.api.i18n.translate('__MSG__EMAIL_VERIFIED__'),
                            oae.api.i18n.translate('__MSG__EMAIL_VERIFIED_THANK_YOU__'));

                        return callback();
                    });
                } else {
                    return callback();
                }
            });
        };

        return {

            /*!
             * This pluginBuilder property tells requirejs to use a different module file for the plugin ONLY when
             * this module is being evaluated at server-size build time. The string value 'pluginBuilder' is
             * referencing a different module, aliased in the paths of `oae.bootstrap.js`. The key is that the
             * server-side substitute does not have any other dependencies, which means that all dependencies herein
             * will not be attempted to be "executed" (eval'd) on the server-side. Dependencies such as jQuery cause
             * issues when that happens.
             */
            'pluginBuilder': 'pluginBuilder',

            /*!
             * Invoked when the module has been loaded, which can trigger initialization in a chained manner.
             */
            'load': function(name, parentRequire, load, config) {
                initOAE(load);
            }
        };
    }
);
