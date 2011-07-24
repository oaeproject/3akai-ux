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
require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai.userpermissions
     *
     * @class userpermissions
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.userpermissions = function (tuid, showSettings) {

         var contextData = false;
         
         ///////////////////////////////////////
         // Retrieving the current permission //
         ///////////////////////////////////////
         
         var getCurrentPermission = function(){
             var currentPath = contextData.path;
             var page = false;
             if (currentPath.indexOf("/") !== -1){
                 var split = currentPath.split("/");
                 page = sakai_global.user.pubdata.structure0[split[0]][split[1]];
             } else {
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

         /* var applyPermissions = function(){
             var groupData = sakai_global.group.groupData;
             var roles = $.parseJSON(groupData["sakai:roles"]);

             var newView = [];
             var newEdit = [];

             // Collect everyone and anonymous value
             var generalVisibility = $("#areapermissions_area_general_visibility").val();
             if (generalVisibility === "everyone"){
                 newView.push("everyone"); 
                 newView.push("anonymous");
             } else if (generalVisibility === "loggedin"){
                 newView.push("everyone");
             }

             // Collect new view roles and new edit roles
             for (var i = 0; i < roles.length; i++){
                 var el = $("select[data-roleid='" + roles[i].id + "']");
                 var selectedPermission = el.val();
                 if (selectedPermission === "edit"){
                     newEdit.push("-" + roles[i].id);
                 } else if (selectedPermission === "view"){
                     newView.push("-" + roles[i].id);
                 }
             }

             // Refetch docstructure information
             $.ajax({
                 url: "/~" + sakai_global.group.groupId + "/docstructure.infinity.json",
                 success: function(data){
                     // Store view and edit roles
                     var pubdata = sakai.api.Server.cleanUpSakaiDocObject(data);
                     pubdata.structure0[contextData.path]._view = $.toJSON(newView);
                     pubdata.structure0[contextData.path]._edit = $.toJSON(newEdit);
                     sakai_global.group.pubdata.structure0 = pubdata.structure0;
                     sakai.api.Server.saveJSON("/~" + sakai_global.group.groupId + "/docstructure", {
                        "structure0": $.toJSON(pubdata.structure0)
                    });
                 }
             });

             // If I manage the document, add/remove appropriate roles from document
             if (contextData.isManager){

                 // General visibility
                 // Options are public, everyone or private
                 var permissionsBatch = [];

                 var $generalVisEl = $("#areapermissions_area_general_visibility");
                 var generalValue = $generalVisEl.val();
                 var originalGeneralValue = $generalVisEl.data("original-selection");
                 var generalPermission = "";
                 if (generalValue !== originalGeneralValue){
                     if (generalValue === "everyone"){
                         generalPermission = "public";
                     } else if (generalValue === "loggedin"){
                         generalPermission = "everyone";
                     } else if (generalValue === "selected"){
                         generalPermission = "private";
                     }
                 }
                 permissionsBatch.push({
                     "url": contextData.pageSavePath + ".json",
                     "method": "POST",
                     "parameters": {
                         "sakai:permissions": generalPermission
                     }
                 });

                 // Per role visibility
                 for (var i = 0; i < roles.length; i++) {
                     var role = sakai_global.group.groupId + "-" + roles[i].id;
                     var el = $("select[data-roleid='" + roles[i].id + "']");
                     var selectedPermission = el.val();
                     var parameters = {
                         ":viewer@Delete": role,
                         ":manager@Delete": role
                     };
                     var aclParameters = {
                        "principalId": role,
                        "privilege@jcr:write": "denied",
                        "privilege@jcr:read": "denied"
                     };
                     if (selectedPermission === "edit"){
                         parameters = {
                             ":viewer@Delete": role,
                             ":manager": role
                         }
                         aclParameters = {
                             "principalId": role,
                             "privilege@jcr:write": "granted",
                             "privilege@jcr:read": "granted"
                         }
                     } else if (selectedPermission === "view"){
                         parameters = {
                             ":viewer": role,
                             ":manager@Delete": role
                         }
                         aclParameters = {
                             "principalId": role,
                             "privilege@jcr:write": "denied",
                             "privilege@jcr:read": "granted"
                         }
                     };
                     permissionsBatch.push({
                         "url": contextData.pageSavePath + ".members.json",
                         "method": "POST",
                         "parameters": parameters
                     });
                     permissionsBatch.push({
                            "url": contextData.pageSavePath + ".modifyAce.html",
                            "method": "POST",
                            "parameters": aclParameters
                     });
                 }

                 // Send requests
                 sakai.api.Server.batch(permissionsBatch, function(success, data){
                     if (generalPermission) {
                         sakai.api.Content.setFilePermissions([{
                             "hashpath": contextData.pageSavePath.substring(3),
                             "permissions": generalPermission
                         }]);
                     }
                 });
             }

             $("#areapermissions_container").jqmHide();

             // Show gritter notification
             sakai.api.Util.notification.show($("#areapermissions_notification_title").text(), $("#areapermissions_notification_body").text());

         } */

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

         //$("#areapermissions_apply_permissions").live("click", function(){
         //    applyPermissions();
         //});

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
