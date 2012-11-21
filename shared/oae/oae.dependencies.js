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

require(
    {
        baseUrl:'/shared/',
        paths: {
            'jquery': 'js/jquery',
            'jquery-plugins': 'js/jquery-plugins',
            'jquery-ui': 'js/jquery-ui.custom',
            'jquery-cookie': 'js/jquery-plugins/jquery.cookie',
            'jquery-fileupload': 'js/jquery-plugins/jquery.fileupload',
            'jquery-iframe-transport': 'js/jquery-plugins/jquery.iframe-transport',
            'underscore': 'js/underscore'
        },
        priority: ['jquery', 'underscore']
    }
);

require(
    [
        'jquery',
        'oae/oae.api.core',
        'underscore',
        'jquery-ui',
        'js/l10n/globalize',
        'js/html-sanitizer',
        'jquery-plugins/jquery.equal-height-columns',
        'jquery-plugins/jquery.contentchange.sakai-edited',
        'jquery-plugins/jquery.timeago',
        'jquery-plugins/jqmodal.sakai-edited',
        'jquery-plugins/jquery.ba-bbq',
        'jquery-plugins/jquery.ba-hashchange',
        'jquery-plugins/jquery.threedots',
        'jquery-plugins/jquery.fileSize',
        'jquery-plugins/jquery.form',
        'jquery-plugins/gritter/jquery.gritter.sakai-edit',
        'jquery-plugins/jquery.infinitescroll-sakai',
        'jquery-plugins/jquery.serializeObject'
    ],
    function($, sakai) {
        sakai.api.User.loadMeData(function(success, data) {
            // Start i18n
            sakai.api.i18n.init(data);
        });
        return sakai;
    }
);
