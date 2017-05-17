/*!
 * Copyright 2017 Apereo Foundation (AF) Licensed under the
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
require(['jquery', 'oae.core'], function ($, oae) {
    // Get the group id and tool id from the URL. The expected URL is `/lti/<tenantId>/<resourceId>/<toolId>`.
    var url = oae.api.util.url();
    var groupId = 'g:' + url.segment(2) + ':' + url.segment(3);
    var toolId = url.segment(4);

    // Variable to keep track of the LTI tool to launch
    var toolProfile = null;

    // Variable used to cache the tool's base URL
    var baseUrl = '/lti/' + url.segment(2) + '/' + url.segment(3) + '/' + url.segment(4);

    /**
     * Render the LTI tool clip
     */
    var setUpClip = function() {
        oae.api.util.template().render($('#lti-clip-template'), {
            'lti': toolProfile.tool,
            'displayOptions': {
                'addLink': false
            }
        }, $('#lti-clip-container'));
    };

    var setUpContext = function() {
        $(document).on('oae.context.get', function(ev, widgetId) {
            if (widgetId) {
                $(document).trigger('oae.context.send.' + widgetId, toolProfile);
            } else {
                $(document).trigger('oae.context.send', toolProfile);
            }
        });
        $(document).trigger('oae.context.send', toolProfile);
    };

    //////////////////////////////
    // LTI TOOL INITIALIZATION //
    /////////////////////////////

    /**
     * Get the tool's launch settings and set up the screen. If the tool
     * can't be found or is not available the appropriate error page will
     * be shown
     */
    var getLtiLaunchProfile = function () {
        oae.api.lti.launchLtiTool(groupId, toolId, function (err, data) {
            if (err) {
                if (err.code === 401) {
                    oae.api.util.redirect().accessdenied();
                } else {
                    oae.api.util.redirect().notfound();
                }
                return;
            }
            toolProfile = data;
            var launchParams = toolProfile.launchParams;
            var tool = toolProfile.tool;

            oae.api.util.setBrowserTitle(tool.displayName);

            var form = $('<form/>', {
                action: tool.launchUrl,
                target: 'lti-name',
                method: 'POST',
                id: 'lti-form'
            });
            for (var param in launchParams) {
                form.append(
                    $('<input>', {
                        type: 'hidden',
                        name: param,
                        value: launchParams[param]
                    })
                );
            }
            $('#lti-container').empty().append(form);
            $('#lti-form').submit();

            setUpClip();
            setUpContext();

            oae.api.util.showPage();
        });
    };

    getLtiLaunchProfile();
});
