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
 * Load all of the 3rd party libraries that need to be present from the very beginning, as well as the actual
 * core client-side Sakai OAE APIs
 */
define(['oae.api!', 'jquery', 'underscore', 'jquery-ui', 'globalize', 'jqmodal',
        'jquery.ba-bbq', 'jquery.ba-hashchange', 'jquery.contentchange',
        'jquery.equal-height-columns', 'jquery.fileSize', 'jquery.form',
        'jquery.gritter',  'jquery.infinitescroll', 'jquery.properties-parser',
        'jquery.serializeObject', 'jquery.validate'],

    function(oae, $) {

        // Make caching the default behavior for $.getScript
        $.ajaxSetup({'cache': true});
        // Make sure that arrays passed in as arguments are properly encoded
        $.ajaxSettings.traditional = true;

        return oae;
    }
);
