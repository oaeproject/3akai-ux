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
// load the master sakai object to access all Sakai OAE API methods
require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai.userpermissions
     *
     * @class userpermissions
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.userpermissions = function(tuid, showSettings){

        var contextData = false;

        ///////////////////////////////////////
        // Retrieving the current permission //
        ///////////////////////////////////////

        var getCurrentPermission = function(){
            var currentPath = contextData.path;
            var page = false;
            if (currentPath.indexOf("/") !== -1) {
                var split = currentPath.split("/");
                page = sakai_global.user.pubdata.structure0[split[0]][split[1]];
            }
            else {
                page = sakai_global.user.pubdata.structure0[currentPath];
            }
            var permission = page._view;
            $("#userpermissions_area_title").text(sakai.api.i18n.General.process(page._title, sakai.api.User.data.me));
            $("#userpermissions_content_container").html(sakai.api.Util.TemplateRenderer("userpermissions_content_template", {
                "permission": permission
            }));
        };

        /////////////////////////////
        // Storing new permissions //
        /////////////////////////////

        /**
         * Notify the user that the permissions have been changed or an error has occurred
         * @param {Boolean} success Indicates the success or failure of setting the permissions
         */
        var permissionsSet = function(success){
            if (success) {
                // Hide the dialog
                $("#userpermissions_container").jqmHide();
                // Show gritter notification
                sakai.api.Util.notification.show($("#userpermissions_notification_title").text(), $("#userpermissions_notification_body").text());
            }else{
                // Show an error notification
                sakai.api.Util.notification.show($("#userpermissions_notification_title").text(), $("#userpermissions_notification_error_body").text(), sakai.api.Util.notification.type.ERROR);
            }
        };

        /**
         * Sets ACLs on a profile section
         * @param {String} pageRef ID of the page to be updated
         * @param {String} permission anonymous, everyone, contacts or private determining what ACLs need to be set
         */
        var setACLs = function(pageRef, permission){
            var path = "/~" + sakai.data.me.user.userid + "/public/authprofile/" + pageRef;
            var ACLs = [];
            switch (permission) {
                case "anonymous":
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["everyone"],
                            "privilege@jcr:read": "granted"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["anonymous"],
                            "privilege@jcr:read": "granted"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["g-contacts-" + sakai.data.me.user.userid],
                            "privilege@jcr:read": "granted"
                        }
                    });
                    break;
                case "everyone":
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["g-contacts-" + sakai.data.me.user.userid],
                            "privilege@jcr:read": "granted"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["everyone"],
                            "privilege@jcr:read": "granted"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["anonymous"],
                            "privilege@jcr:read": "denied"
                        }
                    });
                    break;
                case "contacts":
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": [sakai.data.me.user.userid],
                            "privilege@jcr:write": "granted"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": [sakai.data.me.user.userid],
                            "privilege@jcr:read": "granted"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["g-contacts-" + sakai.data.me.user.userid],
                            "privilege@jcr:read": "granted"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["everyone"],
                            "privilege@jcr:read": "denied"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["anonymous"],
                            "privilege@jcr:read": "denied"
                        }
                    });
                    break;
                case "private":
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": [sakai.data.me.user.userid],
                            "privilege@jcr:write": "granted"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": [sakai.data.me.user.userid],
                            "privilege@jcr:read": "granted"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["g-contacts-" + sakai.data.me.user.userid],
                            "privilege@jcr:read": "denied"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["everyone"],
                            "privilege@jcr:read": "denied"
                        }
                    });
                    ACLs.push({
                        "url": path + ".modifyAce.html",
                        "method": "POST",
                        "parameters": {
                            "principalId": ["anonymous"],
                            "privilege@jcr:read": "denied"
                        }
                    });
                    break;
            }

            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                cache: false,
                data: {
                    requests: $.toJSON(ACLs)
                },
                success: function(data){
                    permissionsSet(true);
                },
                error: function(xhr, textStatus, thrownError){
                    debug.err(xhr, textStatus, thrownError);
                    permissionsSet(false);
                }
            });
        };

        /**
         * Apply the selected permissions to the page
         */
        var applyPermissions = function(){
            var currentPath = contextData.path;
            var page = false;
            if (currentPath.indexOf("/") !== -1) {
                var split = currentPath.split("/");
                page = sakai_global.user.pubdata.structure0[split[0]][split[1]];
            }
            else {
                page = sakai_global.user.pubdata.structure0[currentPath];
            }

            // Collect selected permission
            var permission = $("#userpermissions_area_general_visibility").val();
            page._view = permission;

            sakai.api.Server.saveJSON("/~" + sakai.data.me.user.userid + "/public/pubspace", {
                "structure0": $.toJSON(sakai_global.user.pubdata.structure0)
            });

            if (currentPath !== "library" && currentPath !== "memberships" && currentPath !== "contacts") {
                setACLs(split[1], permission.toString());
            } else {
                permissionsSet(true);
            }
        };

        /////////////////////////////////
        // Modal dialog initialization //
        /////////////////////////////////

        var initializeOverlay = function(){
            $("#userpermissions_container").jqmShow();
        };

        $("#userpermissions_container").jqm({
            modal: true,
            overlay: 20,
            toTop: true,
            zIndex: 3000
        });

        /////////////////////
        // Internal events //
        /////////////////////

        $("#userpermissions_apply_permissions").live("click", function(){
            applyPermissions();
        });

        /////////////////////
        // External events //
        /////////////////////

        $(window).bind("permissions.area.trigger", function(ev, _contextData){
            contextData = _contextData
            getCurrentPermission();
            initializeOverlay();
        });

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("userpermissions");
});