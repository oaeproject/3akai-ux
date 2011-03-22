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
        var entityUserDropdown = ".entity_user_dropdown";

        // Buttons
        var entityUserCreateAndAdd = "#entity_user_create_and_add";
        var entityUserImage = "#entity_user_image";
        var entityUserMessage = "#entity_user_message";
        var entityUserAddToContacts = "#entity_user_add_to_contacts";

        // Templates
        var entityUserTemplate = "entity_user_template";
        var entityContentTemplate = "entity_content_template";

        /**
         * The 'context' variable can have the following values:
         * - 'user_me' When the viewed user page is the current logged in user
         * - 'user_other' When the viewed user page is a user that is not a contact
         * - 'contact' When the viewed user page is one of a contact
         * @param {String} context String defining the context of the entity widget
         */
        var addBinding = function(context){
            switch(context){
                case "user_me":
                    $(entityUserCreateAndAdd).bind("click", function(){
                        // Place create/add functionality
                    })
                    $(entityUserImage).bind("click", function(){
                        if($(this).hasClass("entity_user_image_clicked")){
                            $(this).removeClass("entity_user_image_clicked");
                            $(entityUserDropdown).hide();
                        }else{
                            $(this).addClass("entity_user_image_clicked");
                            $(entityUserDropdown).show();
                        }
                    });
                    break;
                case "user_other":
                    $(entityUserMessage).bind("click", function(){
                        // Place message functionality
                    });
                    $(entityUserAddToContacts).bind("click", function(){
                        // Place contacts functionality
                    });
                    break;
                case "contact":
                    $(entityUserMessage).bind("click", function(){
                        // Place message functionality
                    });
                    break;
            }
        }

        var renderEntity = function(template, data){
            $(entityContainer).html(sakai.api.Util.TemplateRenderer(template, data));
        }

        var doInit = function(){
            var anon = sakai.data.me.user.anon || false;
            // Your user header
            //renderEntity(entityUserTemplate, {"type":"user_me", "anon":anon});
            //addBinding("user_me");

            // Other user's header
            //renderEntity(entityUserTemplate, {"type":"user_other", "anon":anon});
            //addBinding("user_other");

            // Contact's header
            //renderEntity(entityUserTemplate, {"type":"contact", "anon":anon});
            //addBinding("contact");

            // Content's header
            renderEntity(entityContentTemplate, {"type":"content", "anon":anon});
            addBinding("content");

        };

        doInit();

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("entity");
});