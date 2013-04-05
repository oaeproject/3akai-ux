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
         *
         * @param {}    key         The name of the view
         * @param {}    obj         The view object
         * @param {}    index       The index of the view
         * @param {}    total       The amount of views that need to be rendered
         * @param {}    callback    Callback function
         */
        exports.renderPageTemplate = function(key, obj, index, total, callback) {
            $.ajax({
                url: obj.template,
                type: 'GET',
                success: function(data) {
                    var template = document.createElement('div');
                    template.innerHTML = oae.api.i18n.translate(data);
                    obj.name = key;
                    obj.el = template;
                    callback(null, obj);
                    if(index === total){
                        $(document).trigger(constants.events.templatesready);
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    callback(textStatus, null);
                }
            });
        };

    }
);
