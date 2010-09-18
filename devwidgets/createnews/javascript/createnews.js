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
    var createnewsAddSuccess = createnewsAdd + "_success";
       
    var createnewsAddSave = createnewsAdd + "_save";
    var createnewsAddSaveNew = createnewsAddSave + "_new";
    var createnewsAddSaveCancel = createnewsAddSave + "_cancel";
    
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
    
    var showProcess = function(show){
        if(show){
            $(createnewsAddSaveNew).hide();
            $(createnewsAddSaveCancel).hide();
            $(createnewsAddProcess).show();
        } else {
            $(createnewsAddProcess).hide();
            $(createnewsAddSaveNew).show();
            $(createnewsAddSaveCancel).show();
        }
    };
    
    var showSuccess = function(show){
        if(show){
            $(createnewsAddSuccess).show();
        } else {
            $(createnewsAddSuccess).hide();
        }
    };
    
    var myClose = function(hash) {
        hash.o.remove();
        hash.w.hide();
        showSuccess(false);
        showProcess(false);
    };

    var setNull = function(){
      $(createnewsAddContent).val("");
      $(createnewsAddTitle).val("");
    }

    ///////////////////
    // Create a news//
    ///////////////////
    var saveNewNews = function(title,content,pictureURI){
        $.ajax({
            url: "/system/news",
            data: {
                "action":"add",
                "title":title,
                "content":content,
                "pictureURI":pictureURI,
            },
            type: "POST",
            success: function(data){
                showProcess(false);
                if(data.success === true){
                   showSuccess(true);
                   window.location.reload();
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
    $(createnewsAddSaveNew).live("click", function(ev){
        var newTitle = $(createnewsAddTitle).val();
        var newContent = $(createnewsAddContent).val();
        var pictureURI = "";
        showProcess(true);
        saveNewNews(newTitle,newContent,pictureURI);
        setNull();
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