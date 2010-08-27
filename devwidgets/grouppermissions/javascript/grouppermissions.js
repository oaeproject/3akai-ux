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
/*global $, Config, jQuery, sakai */

/**
 * @name sakai.grouppermissions
 *
 * @class grouppermissions
 *
 * @description
 * The Group Permissions widget currently allows users to edit permission
 * properties on their groups. This widget is currently intended to be used
 * on the group_edit.html page only. 
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.grouppermissions = function(tuid, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    // DOM identifiers
    var $rootel = $("#grouppermissions_widget");
    var template = "#grouppermissions_template";
    var dataError = "#grouppermissions_data_error";
    var selectJoinable = "#grouppermissions_joinable";
    var selectVisible = "#grouppermissions_visible";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Checks whether the given value is a valid permissions property value.
     * 
     * @param {Object} configObj - Configuration object
     *   (i.e. sakai.config.Permissions.Groups.joinable) to check against
     * @param {Object} value - Value to investigate
     * @return true if the value has a valid property value, false otherwise
     */
    var isValidPermissionsProperty = function(configObj, value) {
        if(!value || value === "") {
            // value is empty - not valid
            return false;
        }
        for(index in configObj) {
            if(value === configObj[index]) {
                // value is valid
                return true;
            }
        }
        // value is not valid
        return false;
    };

    /**
     * Checks to make sure the correct data is available and then renders the
     * Group Permissions widget.
     * @param None
     * @return None
     */
    var render = function() {
        var joinable = sakai.currentgroup.data.authprofile["sakai:group-joinable"];
        var visible = sakai.currentgroup.data.authprofile["sakai:group-visible"];

        if(isValidPermissionsProperty(sakai.config.Permissions.Groups.joinable, joinable) &&
            isValidPermissionsProperty(sakai.config.Permissions.Groups.visible, visible)) {
            var gp_data = {
                "joinable": joinable,
                "visible": visible
            };
            // pass data to HTML view
            $rootel.html($.TemplateRenderer($(template), gp_data));
            $(template, $rootel).show();
        } else {
            fluid.log("grouppermissions.js - ERROR getting permissions properties from sakai.currentgroup context: " + xhr.status + " " + xhr.statusText);
            $(dataError).show();
        }
    };

    var updateGroupPermissions = function() {
        // get current input values
        var joinable = $(selectJoinable, $rootel).val();
        var visible = $(selectVisible, $rootel).val();

        // only POST if user has changed values
        if(joinable !== sakai.currentgroup.data.authprofile["sakai:group-joinable"] ||
            visible !== sakai.currentgroup.data.authprofile["sakai:group-visible"]) {
            // update group context
            sakai.currentgroup.data.authprofile["sakai:group-joinable"] = joinable;
            sakai.currentgroup.data.authprofile["sakai:group-visible"] = visible;

            // update group on the server
            $.ajax({
                url: "/~" + sakai.currentgroup.id + "/public/authprofile",
                data: {
                    "sakai:group-joinable": joinable,
                    "sakai:group-visible": visible
                },
                type: "POST",
                success: function(data, textStatus){
                    $(window).trigger("sakai.grouppermissions.updateFinished");
                },
                error: function(xhr, textStatus, thrownError){
                    fluid.log("grouppermissions.js - ERROR updating group data: " + xhr.status + " " + xhr.statusText);
                }
            });
        }
    };


    //////////////
    // Bindings //
    //////////////
    
    $(window).bind("sakai.grouppermissions.update", function() {
        updateGroupPermissions();
    });


    /////////////////////////////
    // Initialization function //
    /////////////////////////////

    /**
     * Renders group permissions data
     * @return None
     */
    var init = function() {
        render();
    };

    // run init() function when sakai.content object loads
    init();
};

sakai.api.Widgets.widgetLoader.informOnLoad("grouppermissions");