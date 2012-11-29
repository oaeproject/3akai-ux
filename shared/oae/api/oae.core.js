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
 * Initalize requireJS by setting paths and specifying load priorities
 */
require(
    {
        baseUrl:'/shared/',
        paths: {
            'jquery': 'lib/jquery',
            'jquery-plugins': 'lib/jquery-plugins',
            'jquery-ui': 'lib/jquery-ui.custom',
            'underscore': 'lib/underscore'
        },
        priority: ['jquery', 'underscore']
    }
);

/*!
 * Load all of the 3rd party libraries that need to be present from the very beginning, as well as the actual
 * core client-side Sakai OAE APIs
 */
require(['oae/oae.api!', 'jquery', 'underscore', 'jquery-ui', 'lib/l10n/globalize', 'lib/html-sanitizer', 
         'jquery-plugins/jquery.equal-height-columns', 'jquery-plugins/jquery.contentchange.sakai-edited', 
         'jquery-plugins/jquery.timeago', 'jquery-plugins/jqmodal.sakai-edited', 'jquery-plugins/jquery.ba-bbq', 
         'jquery-plugins/jquery.ba-hashchange', 'jquery-plugins/jquery.threedots', 'jquery-plugins/jquery.fileSize', 
         'jquery-plugins/jquery.form', 'jquery-plugins/gritter/jquery.gritter.sakai-edit', 
         'jquery-plugins/jquery.infinitescroll-sakai', 'jquery-plugins/jquery.serializeObject'],

    function(oae, $) {

        // Make caching the default behavior for $.getScript
        $.ajaxSetup({'cache': true});
        // Make sure that arrays passed in as arguments are properly encoded
        $.ajaxSettings.traditional = true;

        return oae;
    }
);
