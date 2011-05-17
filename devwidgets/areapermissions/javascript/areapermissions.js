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
         
         var loadGroupData = function(contextData){
             var groupData = sakai_global.group2.groupData;
             var roles = $.parseJSON(groupData["sakai:roles"]);
             $("#areapermissions_content_container").html(sakai.api.Util.TemplateRenderer("areapermissions_content_template", {}));
             debug.log(roles);
             debug.log(contextData);
             debug.log(sakai_global.group2.pubdata);
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
         // External events //
         /////////////////////
         
         $(window).bind("permissions.area.trigger", function(ev, contextData){
             initializeOverlay(contextData);
         });

    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("areapermissions");
});
