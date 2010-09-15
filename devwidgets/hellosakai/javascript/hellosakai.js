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

/*global $, Config */

var sakai = sakai || {};

/**
 * @name sakai.helloworld
 *
 * @class hellosakai
 *
 * @description
 * Initialize the hellosakai widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.hellosakai = function(tuid,showSettings){
    
    var rootel = $("#" + tuid);

    var usernameContainer = "#hellosakai_username";


    ////////////////////
    // Main functions //
    ////////////////////

    ////////////////////
    // Event Handlers //
    ////////////////////

    /////////////////////////////
    // Initialisation function //
    /////////////////////////////


    var doInit = function(){
            var me = sakai.data.me;
            /*
            $(usernameContainer, rootel).text(sakai.api.Security.saneHTML(sakai.api.User.getProfileBasicElementValue(me.profile, "firstName")));
            */
            $.ajax({
                url: "/system/helloworld",
                type: "GET",
                /*
                data:{"operation":"list"},
                */
                success: function(data) {
                  /*
                  var JSONobj = $.parseJSON(data);
                  */
                  var JSONobj = $.parseJSON(data);
                  $("#hellosakai_username").html(JSONobj.message);
                },
                error: function() {
                    alert("error");
                }
            });
        }
    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("hellosakai");