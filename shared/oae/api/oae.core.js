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
 * Load all of the 3rd party libraries that need to be present from the very beginning, as well as the actual
 * core client-side OAE APIs
 */
define([
        /*!
         * The ! after `oae.api` indicates that this module is actually treated as a *plugin*, which is a special kind of
         * requirejs module. The difference we need is that the module can return a `load` function that can chain together
         * an initialization process client-size. We use this to initialize the client-side data.
         */
        'oae.api!',

        'jquery',
        'bootstrap',

        /*!
         * All the OAE API libraries found in /shared/oae/api. By including these here, requirejs will know that the
         * libraries are already included in the `oae.core` dependency and individual libraries will not be loaded
         * on the client when requested.
         */
        'oae.api.admin',
        'oae.api.authentication',
        'oae.api.config',
        'oae.api.content',
        'oae.api.comment',
        'oae.api.discussion',
        'oae.api.folder',
        'oae.api.follow',
        'oae.api.group',
        'oae.api.i18n',
        'oae.api.l10n',
        'oae.api.meetup',
        'oae.api.push',
        'oae.api.user',
        'oae.api.util',
        'oae.api.widget',

        /**
         * OAE plugins
         */
        'bootstrap.focus',
        'bootstrap.modal',
        'jquery.browse-focus',
        'jquery.clip',
        'jquery.dnd-upload',
        'jquery.infinitescroll',
        'jquery.list',
        'jquery.responsive',
        'jquery.update-picture',

        /*!
         * Third-party dependencies
         */
        'bootstrap.clickover',
        'bootstrap.notify',
        'globalize',
        'jquery.dotdot',
        'jquery.encoder',
        'jquery.fileSize',
        'jquery.form',
        'jquery.infinitescroll',
        'jquery.parseurl',
        'jquery.properties-parser',
        'jquery.serializeObject',
        'jquery.timeago',
        'jquery.validate',
        'jquery-ui',
        'markdown',
        'sockjs',
        'tinycon',
        'underscore'
    ],

    function(oae, $) {
        $.ajaxSetup({
            // Make caching the default behavior for $.getScript
            'cache': true,
            // Intercept 419 status indicating that the user has to accept the Terms and Conditions before continuing
            'complete': function(xhr, textStatus) {
                if (xhr.status === 419) {
                    // Update user status
                    oae.data.me.needsToAcceptTC = true;
                    // Hide any modal that might be open as bootstrap doesn't support 2 modals at once
                    $('.modal').modal('hide');
                    // Insert the Terms and Conditions widget in settings mode
                    var termsandconditionsId = oae.api.util.generateId();
                    oae.api.widget.insertWidget('termsandconditions', termsandconditionsId, null, true);
                }
            }
        });
        // Make sure that arrays passed in as arguments are properly encoded
        $.ajaxSettings.traditional = true;
        // Tell IE9 that cross-domain requests are a possibility when Amazon S3 is enabled
        // as the content storage strategy
        $.support.cors = true;

        return oae;
    }
);
