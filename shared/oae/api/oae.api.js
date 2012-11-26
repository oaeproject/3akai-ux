/*!
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

/*!
 * TODO
 */
define(['oae/oae.api.authentication', 'oae/oae.api.content', 'oae/oae.api.group', 'oae/oae.api.i18n', 
        'oae/oae.api.l10n', 'oae/oae.api.profile', 'oae/oae.api.user', 'oae/oae.api.util', 'oae/oae.api.widget'],

    function(authenticationAPI, contentAPI, groupAPI, i18nAPI, l10nAPI, profileAPI, userAPI, utilAPI, widgetAPI) {
        
        /*!
         * Object containing all of the available OAE API modules and their functions, as well as some
         * cached data (e.g. me object) that will be passed in when a module adds `oae.api!` as a dependency.
         */
        var oae = {
            'api': {
                'authentication': authenticationAPI,
                'content': contentAPI,
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
                    throw new Error('Could not load the me feed. Make sure that the server is running and properly configured');
                }

                // Add the me object onto the oae data object
                oae.data.me = meObj;

                // Initialize l10n
                oae.api.l10n.init('en_GB', function(err) {
                    
                    // Initialize i18n
                    // TODO
    
                    // The APIs have now fully initialized
                    callback(oae);
                });
            });
        };

        return {
            'load': function(name, parentRequire, load, config) {
                initOAE(load);
            }
        };
    }
);


//    '/ui/configuration/config_custom.js',
//    '/var/widgets.json?callback=define'
//],