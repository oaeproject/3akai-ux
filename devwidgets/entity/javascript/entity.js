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
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.entity
     *
     * @class entity
     *
     * @description
     * Initialize the entity widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.entity = function(tuid, showSettings){

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var entityContainer = "#entity_container";
        
        // Buttons
        var entityUserCreateAndAdd = "#entity_user_create_and_add";
        var entityUserImage = "#entity_user_image";

        // Templates
        var entityUserTemplate = "entity_user_template";

        var addBinding = function(context){
            if(context === "user"){
                $(entityUserCreateAndAdd).bind("click", function(){
                    alert("test");
                })

                $(entityUserImage).bind("click", function(){
                    if($(this).hasClass("entity_user_image_clicked")){
                        $(this).removeClass("entity_user_image_clicked");
                    }else{
                        $(this).addClass("entity_user_image_clicked");
                    }
                })
            }
        }

        var renderEntity = function(template){
            $(entityContainer).html(sakai.api.Util.TemplateRenderer(template, {}));
        }

        var doInit = function(){
            renderEntity(entityUserTemplate);
            // Derived from the context we'll bind the correct elements
            addBinding("user");
        };

        doInit();

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("entity");
});
