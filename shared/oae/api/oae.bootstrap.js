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
requirejs.config({
    baseUrl:'/shared/',
    paths: {
        'jquery': 'vendor/js/jquery',
        'globalize': 'vendor/js/l10n/globalize',
        'jqmodal.sakai-edited': 'vendor/js/jquery-plugins/jqmodal.sakai-edited',
        'jquery.ba-bbq': 'vendor/js/jquery-plugins/jquery.ba-bbq',
        'jquery.ba-hashchange': 'vendor/js/jquery-plugins/jquery.ba-hashchange',
        'jquery.contentchange.sakai-edited': 'vendor/js/jquery-plugins/jquery.contentchange.sakai-edited',
        'jquery.equal-height-columns': 'vendor/js/jquery-plugins/jquery.equal-height-columns',
        'jquery.fileSize': 'vendor/js/jquery-plugins/jquery.fileSize',
        'jquery.form': 'vendor/js/jquery-plugins/jquery.form',
        'jquery.gritter.sakai-edit': 'vendor/js/jquery-plugins/jquery.gritter.sakai-edit',
        'jquery.infinitescroll-sakai': 'vendor/js/jquery-plugins/jquery.infinitescroll-sakai',
        'jquery.properties-parser': 'vendor/js/jquery-plugins/jquery.properties-parser',
        'jquery.serializeObject': 'vendor/js/jquery-plugins/jquery.serializeObject',
        'jquery.validate': 'vendor/js/jquery-plugins/jquery.validate',
        'jquery.iframe-transport': 'vendor/js/jquery-plugins/jquery.iframe-transport',
        'jquery.timeago': 'vendor/js/jquery-plugins/jquery.timeago',
        'jquery.fileupload': 'vendor/js/jquery-plugins/jquery.fileupload',
        'jquery.autoSuggest.sakai-edited': 'vendor/js/jquery-plugins/jquery.autoSuggest.sakai-edited',
        'jquery.jeditable.sakai-edited': 'vendor/js/jquery-plugins/jquery.jeditable.sakai-edited',
        'jquery-ui': 'vendor/js/jquery-ui.custom',
        'underscore': 'vendor/js/underscore',
        'oae.api': 'oae/api/oae.api',
        'oae.core': 'oae/api/oae.core',
        'oae.culture-map': 'oae/api/oae.culture-map'
    },
    priority: ['jquery', 'underscore']
});

/*!
 * Load all of the dependencies and core OAE APIs
 */
require(['oae.core']);
