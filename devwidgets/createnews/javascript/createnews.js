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
 * @name sakai.createnews
 *
 * @class createnews
 *
 * @description
 * createnews widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.createnews = function(tuid, showSettings){

    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var MAX_LENGTH = 30;
    // - ID
    var createnews = "#createnews";
    // Container
    var createnewsContainer = createnews + "_container";
    // template containers
    var createnewsAddTemplate = "#noncourse_template_container";
    // Non course
    var createnewsAdd = createnews + "_add";    
    var createnewsAddContent = createnewsAdd + "_content";    
    var createnewsAddTitle = createnewsAdd + "_title";
    var createnewsAddProcess = createnewsAdd + "_process"; 
       
    var createnewsAddSave = createnewsAdd + "_save";
    var createnewsEditSave = createnewsAdd + "_save1";
    
    // CSS Classes
    var invalidFieldClass = "invalid";

    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * Public function that can be called from elsewhere
     * (e.g. chat and sites widget)
     * It initializes the createnews widget and shows the jqmodal (ligthbox)
     */
    sakai.createnews.initialise = function(){
        $(createnewsContainer).jqmShow();
    };

    var myClose = function(hash) {
        hash.o.remove();
        hash.w.hide();
    };
    
    var setNull = function(){
      $(createnewsAddDescription).html("");
      $(createnewsAddTitle).html("");
    }

    ///////////////////
    // Create a news//
    ///////////////////
    /**
     * Create the group.
     * @param {String} groupid the id of the group that's being created
     * @param {String} grouptitle the title of the group that's being created
     * @param {String} groupdescription the description of the group that's being created
     * @param {String} groupidManagers the id of the managers group for the group that's being created
    */
    
    var saveNewNews = function(){
        $.ajax({
            url: "",
            data: {
                "action":"add"
            },
            type: "POST",
            success: function(data){
                if(data.success == true){
                  $("#createnews_add_process").html("save ok!");
                }
            },
            error: function(data){
                alert("error");
            },
        });
    };
    
    var saveEditNews = function(){
        $.ajax({
            url: "",
            data: {
                "action":"edit",
            },
            type: "POST",
            success: function(data){
                if(data.success == true)
                {
                  $("#createnews_add_process").html("save ok!");
                }
            },
            error: function(data){
                alert("error");
            },
        });
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

    /*
     * Add jqModal functionality to the container.
     * This makes use of the jqModal (jQuery Modal) plugin that provides support
     * for lightboxes
     */
    $(createnewsContainer).jqm({
        modal: true,
        overlay: 20,
        toTop: true,
        onHide: myClose
    });

    /*
     * Add binding to the save button (create the group when you click on it)
     */
    $(createnewsAddSave).live("click", function(ev){
        saveNewNews();
    });
    
    $(createnewsEditSave).live("click", function(ev){
        saveEditNews();
    });

    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    var doInit = function(){
        setNull();
    };
    
    doInit();
};

sakai.api.Widgets.widgetLoader.informOnLoad("createnews");