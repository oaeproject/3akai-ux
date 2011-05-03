/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*
 * Dependencies
 *
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/jquery/plugins/jquery.validate.sakai-edited.js (validate)
 */

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.newcreategroup
     *
     * @class newcreategroup
     *
     * @description
     * selecttemplate widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.selecttemplate = function(tuid, showSettings){

        var doInit = function(){
            var templatesToRender = false;
            for (var i = 0; i < sakai.config.worldTemplates.length; i++){
                if (sakai.config.worldTemplates[i].id === tuid){
                    templatesToRender = sakai.config.worldTemplates[i];
                    break;
                }
            }
            if (templatesToRender){
                if (templatesToRender.templates.length === 1){
                    renderCreateWorld(templatesToRender.id, templatesToRender.templates[0].id);
                } else {
                    renderTemplateList(templatesToRender);
                }
            }
        };

        var renderTemplateList = function(templates){
            
        };

        var renderCreateWorld = function(category, id){
            $("#selecttemplate_templatelist_container").hide();
            var tuid = Math.round(Math.random() * 10000000);
            var toPassOn = {};
            toPassOn[tuid] = {
                "category": category,
                "id": id
            }
            $("#selecttemplate_createworld_container").html(sakai.api.Util.TemplateRenderer("selecttemplate_createworld_template", {"tuid" : tuid}));
            sakai.api.Widgets.widgetLoader.insertWidgets("selecttemplate_createworld_" + tuid, false, false,[toPassOn]);
            $("#selecttemplate_createworld_container").show();
        };

        doInit();
        
    }

    sakai.api.Widgets.widgetLoader.informOnLoad("selecttemplate");

});