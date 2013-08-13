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
        'oae.api.authentication',
        'oae.api.config',
        'oae.api.content',
        'oae.api.comment',
        'oae.api.discussion',
        'oae.api.group',
        'oae.api.i18n',
        'oae.api.l10n',
        'oae.api.profile',
        'oae.api.user',
        'oae.api.util',
        'oae.api.widget',

        /**
         * OAE plugins
         */
        'bootstrap.modal',
        'jquery.browse-focus',
        'jquery.clip',
        'jquery.dnd-upload',
        'jquery.infinitescroll',
        'jquery.list-options',
        'jquery.update-picture',

        /*!
         * Third-party dependencies.
         */
        'bootstrap.clickover',
        'globalize',
        'jquery.encoder',
        'jquery.fileSize',
        'jquery.form',
        'jquery.infinitescroll',
        'jquery.notify',
        'jquery.parseurl',
        'jquery.properties-parser',
        'jquery.serializeObject',
        'jquery.timeago',
        'jquery.validate',
        'jquery-ui',
        'underscore'
    ],

    function(oae, $) {

        // Make caching the default behavior for $.getScript
        $.ajaxSetup({'cache': true});
        // Make sure that arrays passed in as arguments are properly encoded
        $.ajaxSettings.traditional = true;

        return oae;
    }
);
