/*!
 * Copyright 2013 Apereo Foundation (AF) Licensed under the
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
 * tenant will be retrueved, and the localization and internationalization APIs will be initialized. Finally, the widgets declared
 * in the page source will be rendered.
 *
 * This module is intended to be referenced as a *plugin*, not a regular module. Do not depend on this directly, instead depend
 * on `oae.core`, which invokes this plugin, and also efficiently pre-loads many third-party dependencies.
 */
define(['oae.api.authentication', 'oae.api.config', 'oae.api.content', 'oae.api.comment', 'oae.api.discussion', 'oae.api.group',
        'oae.api.i18n', 'oae.api.l10n', 'oae.api.profile', 'oae.api.user', 'oae.api.util', 'oae.api.widget'],

    function(authenticationAPI, configAPI, contentAPI, commentAPI, discussionAPI, groupAPI, i18nAPI, l10nAPI, profileAPI, userAPI, utilAPI, widgetAPI) {

        /*!
         * Object containing all of the available OAE API modules and their functions, as well as some
         * cached data (e.g. me object) that will be passed in when a module adds `oae.api!` as a dependency.
         */
        var oae = {
            'api': {
                'authentication': authenticationAPI,
                'config': configAPI,
                'content': contentAPI,
                'comment': commentAPI,
                'discussion': discussionAPI,
                'group': groupAPI,
                'i18n': i18nAPI,
                'l10n': l10nAPI,
                'profile': profileAPI,
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
                        throw new Error('Could not initialize the config API.');
                    }

                    // Initialize l10n
                    var userLocale = oae.data.me.locale ? oae.data.me.locale.locale : null;
                    oae.api.l10n.init(userLocale, function(err) {
                        if (err) {
                            throw new Error('Could not initialize the l10n API.');
                        }

                        // Initialize i18n
                        oae.api.i18n.init(userLocale, function(err) {
                            if (err) {
                                throw new Error('Could not initialize the i18n API.');
                            }

                            // Initialize utility API
                            oae.api.util.init(function() {

                                // Initialize widgets API
                                oae.api.widget.init(userLocale, function(err) {
                                    if (err) {
                                        throw new Error('Could not initialize the widgets API.');
                                    }

                                    // The APIs have now fully initialized. All javascript that
                                    // depends on the initialized core APIs can now execute
                                    callback(oae);

                                    // We now load the widgets in the core HTML
                                    oae.api.widget.loadWidgets(null, null, null, function() {
                                        // We can show the body as internationalization and
                                        // initial widget loading have finished
                                        $('body').show();
                                    });
                                });
                            });
                        });
                    });
                });
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
