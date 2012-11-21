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

define(
    [
        'oae/oae.api.authentication',
        'oae/oae.api.content',
        'oae/oae.api.group',
        'oae/oae.api.i18n',
        'oae/oae.api.l10n',
        'oae/oae.api.profile',
        'oae/oae.api.user',
        'oae/oae.api.util',
        'oae/oae.api.widgets',
        '/ui/configuration/config_custom.js',
        '/var/widgets.json?callback=define'
    ],
    function(sakai_auth,
            sakai_content,
            sakai_groups,
            sakai_i18n,
            sakai_l10n,
            sakai_server,
            sakai_user,
            sakai_util,
            sakai_widgets,
            sakai_conf,
            sakai_widget_config) {

    return {
        api : {
            Activity : sakai_util.Activity,
            Communication : sakai_comm,
            Content: sakai_content,
            Datetime: sakai_util.Datetime,
            Groups : sakai_groups,
            i18n : sakai_i18n,
            l10n : sakai_l10n,
            Security : sakai_util.Security,
            Server : sakai_server,
            User : sakai_user,
            Util : sakai_util,
            Widgets : sakai_widgets
        },
        config : sakai_conf,
        data : sakai_user.data,
        widgets : sakai_widget_config
    };
});

// TODO
var init = function() {
    /**
     * Make caching the default behavior for $.getScript
     */
    jQuery.ajaxSetup({'cache': true});
    
    /**
     * Make sure that arrays passed in as arguments are properly encoded
     */
    jQuery.ajaxSettings.traditional = true;
}
