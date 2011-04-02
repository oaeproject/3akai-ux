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
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 */
/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai_global.contacts
     *
     * @class contacts
     *
     * @description
     * Initialize the contacts widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contacts = function(tuid, showSettings){

        var contactsContainer = "#contacts_container";

        var contactsTemplate = "contacts_template";

        var acceptRequest = function(user){
            $.ajax({
                url: "/~" + sakai.data.me.user.userid + "/contacts.accept.html",
                type: "POST",
                data: {
                    "targetUserId": user
                },
                success: function(data){
                    getContacts();
                }
            });
        };

        var removeRequest = function(user){
            $.ajax({
                url: "/~" + sakai.data.me.user.userid + "/contacts.remove.html",
                type: "POST",
                data: {
                    "targetUserId": user
                },
                success: function(data){
                    getContacts();
                }
            });
        };

        var bindEvents = function(){
            $(".contacts_add_to_contacts").live("click", function(){
                acceptRequest($(this)[0].id.split("contacts_add_to_contacts_")[1]);
            });

            $(".contact_delete_button").live("click", function(){
                removeRequest($(this)[0].id.split("contacts_delete_contact_")[1]);
            });
        };

        var renderContacts = function(dataObj){
            $(contactsContainer).html(sakai.api.Util.TemplateRenderer(contactsTemplate, dataObj));
        };

        var determineRenderContacts = function(dataObj){
            if (sakai_global.profile.main.mode.value !== "view") {
                if (dataObj.accepted && dataObj.pending && dataObj.invited) {
                    renderContacts(dataObj);
                }
            }else{
                if(dataObj.accepted){
                    renderContacts(dataObj);
                }
            }
        };

        var getAccepted = function(dataObj){
            var url = "";
            if(sakai_global.profile.main.mode.value !== "view"){
                url = sakai.config.URL.SEARCH_USERS_ACCEPTED + "?state=ACCEPTED&page=0&items=1000"
                data = {};
            }else{
                url = "/var/contacts/findbyuser.json"
                data = {
                    "userid": sakai_global.profile.main.data.homePath.split("~")[1]
                };
            }

            $.ajax({
                url: url,
                cache: false,
                async: true,
                data: data,
                success: function(data){
                    dataObj.accepted = data;
                    determineRenderContacts(dataObj);
                }
            });
        };

        var getPending = function(dataObj){
            $.ajax({
                url: sakai.config.URL.SEARCH_USERS_ACCEPTED + "?state=PENDING&page=0&items=1000",
                cache: false,
                async: true,
                success: function(data){
                    dataObj.pending = data;
                    determineRenderContacts(dataObj);
                }
            });
        };

        var getPendingToOther= function(dataObj){
            $.ajax({
                url: sakai.config.URL.CONTACTS_FIND_STATE + "?state=INVITED&page=0&items=1000",
                cache: false,
                async: true,
                success: function(data){
                    dataObj.invited = data;
                    determineRenderContacts(dataObj);
                }
            });
        };

        var getContacts = function(){
            var dataObj = {
                "accepted": false,
                "pending": false,
                "invited": false,
                "sakai": sakai
            };

            if (sakai_global.profile.main.mode.value !== "view") {
                getAccepted(dataObj);
                getPending(dataObj);
                getPendingToOther(dataObj);
            }
            else {
                getAccepted(dataObj);
            }
        }

        var doInit = function(){
            getContacts();
            bindEvents();
        };

        doInit();

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("contacts");

});