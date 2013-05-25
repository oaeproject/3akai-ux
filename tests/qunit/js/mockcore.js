/*!
 * Copyright 2013 Sakai Foundation (SF) Licensed under the
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

/**
 * MockCore - Default mocking for sakai unit tests
 */
require(['jquery', 'mockjax'], function($) {
    if ($ && $.mockjax) {
        $.mockjax(function(settings) {
            var url = settings.url.match(/\/dev\/(.*)$/);
            if (url) {
                return {
                    responseTime: 10,
                    proxy: '../../../../dev/' + url[1]
                };
            } else {
                var widgetURL = settings.url.match(/\/devwidgets\/(.*)$/);
                if (widgetURL) {
                    return {
                        responseTime: 10,
                        proxy: '../../../../devwidgets/' + widgetURL[1]
                    };
                }
                return null;
            }
            return null;
        });
    }
});
