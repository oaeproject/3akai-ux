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
     * @name sakai.areapermissions
     *
     * @class areapermissions
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.areapermissions = function (tuid, showSettings) {
         
         //////////////////////////
         // Rendering group data //
         //////////////////////////
         
         var loadGroupData = function(){
             var groupData = sakai_global.group2.groupData;
             var roles = $.parseJSON(groupData["sakai:roles"]);
             
             // Calculate for each role what current permission is
             var currentArea = sakai_global.group2.pubdata.structure0[contextData.path];
             var editRoles = $.parseJSON(currentArea._edit);
             var viewRoles = $.parseJSON(currentArea._view);
             for (var i = 0; i < roles.length; i++){
                 var role = roles[i];
                 if ($.inArray("-" + role.id, editRoles) !== -1){
                     role.value = "edit";
                 } else if ($.inArray("-" + role.id, viewRoles) !== -1){
                     role.value = "view";
                 } else {
                     role.value = "hidden";
                 }
             }
             
             var visibility = "selected";
             if ($.inArray("anonymous", viewRoles) !== -1){
                 visibility = "everyone";
             } else if ($.inArray("everyone", viewRoles) !== -1){
                 visibility = "loggedin";
             }
             
             // Fill in area title
             $("#areapermissions_area_title").text(currentArea._title);
             
             // Render the list
             $("#areapermissions_content_container").html(sakai.api.Util.TemplateRenderer("areapermissions_content_template", {
                 "roles": roles,
                 "visibility": visibility
             }));
         };
         
         var determineContentManager = function(contextData){
             $.ajax({
                 url: contextData.pageSavePath + ".infinity.json",
                 success: function(data){
                     
                 }, error: function(data){
                     contextData.isManager = false;
                 }
             });
                             for (var ii in contentMembers.managers) {
                                if (contentMembers.managers.hasOwnProperty(ii)) {
                                    if (contentMembers.managers[ii].hasOwnProperty("rep:userId")) {
                                        if (contentMembers.managers[ii]["rep:userId"] === sakai.data.me.user.userid) {
                                            manager = true;
                                        }
                                    } else if (contentMembers.managers[ii].hasOwnProperty("sakai:group-id")) {
                                        if (sakai.api.Groups.isCurrentUserAMember(
                                            contentMembers.managers[ii]["sakai:group-id"],
                                            sakai.data.me)) {
                                            manager = true;
                                        }
                                    }
                                }
                            }
                            for (var jj in contentMembers.viewers) {
                                if (contentMembers.viewers.hasOwnProperty(jj)) {
                                    if (contentMembers.viewers[jj].hasOwnProperty("rep:userId")) {
                                        if (contentMembers.viewers[jj]["rep:userId"] === sakai.data.me.user.userid) {
                                            viewer = true;
                                        }
                                    } else if (contentMembers.viewers[jj].hasOwnProperty("sakai:group-id")) {
                                        if (sakai.api.Groups.isCurrentUserAMember(
                                            contentMembers.viewers[jj]["sakai:group-id"],
                                            sakai.data.me)) {
                                            viewer = true;
                                        }
                                    }
                                }
                            }*/
         };
         
         ////////////////////
         // Checkbox logic //
         ////////////////////
         
         var checkUncheckAll = function($el){
             if ($el.is(':checked')){
                 // Check all
                 $("#areapermission_roles input").attr("checked", true);
             } else {
                 // Uncheck all
                 $("#areapermission_roles input").attr("checked", false);
             }
         };
         
         var batchChangeSelection = function($el){
             // Get value of current element
             var changeValue = $el.val();
             // Get checked items
             var $els = $("#areapermission_roles input").filter(":checked");
             $.each($els, function(index, el) { 
                 var role = $(el).data("roleid");
                 $("select[data-roleid='" + role + "']").val(changeValue);
             });
         };
         
         /////////////////////////////////
         // Modal dialog initialization //
         /////////////////////////////////
         
         var initializeOverlay = function(contextData){
             loadGroupData(contextData);
             $("#areapermissions_container").jqmShow();
         };
         
         $("#areapermissions_container").jqm({
             modal: true,
             overlay: 20,
             toTop: true,
             zIndex: 3000
         });
         
         /////////////////////
         // Internal events //
         /////////////////////
         
         $("#areapermissions_check_uncheck_all").live("change", function(){
             checkUncheckAll($(this));
         });
         
         $("#areapermissions_change_selected").live("change", function(){
             batchChangeSelection($(this));
         });
         
         /////////////////////
         // External events //
         /////////////////////
         
         $(window).bind("permissions.area.trigger", function(ev, contextData){
             determineContentManager(contextData);
         });

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("areapermissions");
});
