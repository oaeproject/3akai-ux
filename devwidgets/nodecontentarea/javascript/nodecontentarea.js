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

/*global $ */

var sakai = sakai || {};

/**
 * @name sakai.sitespages
 *
 * @class sitespages
 *
 * @description
 * Initialize the sitespages widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.nodecontentarea = function(tuid,showSettings){

    //////////////////////////
    // CONFIG and HELP VARS //
    //////////////////////////
    var doInit = function() {
        bindEvents();
    };
    
    var bindEvents = function(){
        // Bind Edit page link click event
        $("#edit_page").bind("click", function(ev){
            if (tinyMCE.activeEditor === null) {
                init_tinyMCE();
            }
            else {
                if (tinyMCE.activeEditor.id !== "elm1" && didInit === false) {
                    tinyMCE.remove(tinyMCE.activeEditor.id);
                    init_tinyMCE();
                    didInit = true;
                }
            }
            
            $("#edit_page").hide();
            $("#main-content-div").show();
        });
        
        // Bind Save button click
        $(".save_button").live("click", function(ev){
            saveEdit();
        });

        // Bind cancel button click
        $(".cancel-button").live("click", function(ev){
            cancelEdit();
        });

    }

    var cancelEdit = function() {
        $("#main-content-div").hide();
        $("#edit_page").show();        
    };    

    var saveEdit = function(){
        var newcontent = getContent();
        //TODO call save description function
        $("#main-content-div").hide();
        $("#edit_page").show();
        $("#main-content-div-preview").html(newcontent);
    }

    /////////////////////////////
    // tinyMCE FUNCTIONS
    /////////////////////////////
    /**
     * Get the content inside the TinyMCE editor
     */
    var getContent = function(){
        return tinyMCE.get("elm1").getContent({format : 'raw'}).replace(/src="..\/devwidgets\//g, 'src="/devwidgets/');
    };


    /**
     * Initialise tinyMCE and run sakai.sitespages.startEditPage() when init is complete
     * @return void
     */

    function init_tinyMCE() {
        // Init tinyMCE
        tinyMCE.init({
            // General options
            mode : "textareas",
            elements : "elm1",
            theme: "advanced",

            // Context Menu
            theme_advanced_buttons1: "formatselect,fontselect,fontsizeselect,|,forecolor,backcolor",
            theme_advanced_buttons2: "bold,italic,underline,|,numlist,bullist,|,outdent,indent,|,link,|,image,|",
            theme_advanced_buttons3:"",
            
            // set this to external|top|bottom
            theme_advanced_toolbar_location: "top",
            theme_advanced_toolbar_align: "left",
            theme_advanced_statusbar_location: "none",
        });


    }


    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("nodecontentarea");
