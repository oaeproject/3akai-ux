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
        'exports', 'jquery', 'oae.core',
        '/mobile/js/constants/constants.js'
    ]
    , function(exports, $, oae, constants) {

        /**
         * Renders a view template
         * @param {String}      key             The name of the view
         * @param {Object}      view            The view object
         * @param {Integer}     index           The index of the view
         * @param {Integer}     total           The amount of views that need to be rendered
         * @param {Function}    callback        Callback function
         */
        exports.renderViewTemplate = function(key, view, index, total, callback) {
            $.ajax({
                url: view.settings.template.templateURL,
                type: 'GET',
                success: function(data) {
                    var retval = {};
                    var template = document.createElement('div');
                    template.innerHTML = oae.api.i18n.translate(data);
                    retval.templateID = view.settings.template.templateID;
                    retval.name = key;
                    retval.el = template;
                    callback(null, retval);
                    if(index === total){
                        $(document).trigger(constants.events.activities.templatesready);
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    callback(textStatus, null);
                }
            });
        };

        /**
         * Renders a component
         * @param {Integer}     id              The id of the template
         * @param {String}      url             The url of the page template
         * @param {Object}      target          The target where the template will be appended
         * @param {Object}      data            The data used for the content
         * @param {Function}    callback        Callback function
         */
        exports.renderComponent = function(id, url, target, data, callback) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    var template = document.createElement('div');
                    template.innerHTML = oae.api.i18n.translate(response);
                    $(constants.components.templatehelper).append(template);
                    oae.api.util.template().render(id, data, target);
                    callback(null);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    callback(textStatus);
                }
            });
        }
    }
);
