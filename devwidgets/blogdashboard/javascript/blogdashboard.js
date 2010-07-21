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


/*global $, sdata, Config, jQuery */


var sakai = sakai || {};

/**
 * @name sakai.blogdashboard
 *
 * @class blogdashboard
 *
 * @description
 * Initialize the dashboard widget for a blog
 * This widget will be running in the dashboard.
 * It allows the user to make a post to a blog he has on a website.
 * If there is no blog found on the website, one will be created.
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.blogdashboard = function(tuid, showSettings){


    //////////////////////
    // Config variables //
    //////////////////////

    var rootel = $("#" + tuid);
    var me = sakai.data.me;


    //    CSS IDs

    var blogdashboard = "#blogdashboard";
    var blogdashboardName = "blogdashboard";

    //    buttons
    var buttonPublish = blogdashboard + "_Publish";
    var buttonReset = blogdashboard + "_Reset";

    //    The input fields
    var txtTitle = blogdashboard + "_title";
    var txtContent = blogdashboard + "_content";
    var txtTags = blogdashboard + "_tags";
    var cboSite = blogdashboard + "_site";

    //    Error messages + container
    var generalMessage = blogdashboard + "_general_message";
    var errorMessageClass = blogdashboardName + "_error_message";
    var normalMessageClass = blogdashboardName + "_normal_message";
    var errorClass = blogdashboardName + "_error";

    var siteTemplate = blogdashboardName + '_siteTemplate';


    ////////////////////
    // Util functions //
    ////////////////////

    /**
     * Will loop over an array and trim everything. Double values will be thrown out.
     * @param {String[]} arr
     * @return {String[]} Trimmed and cleaned array.
     */
    var trimArray = function(arr) {
        var toreturn = [];
        for (var i = 0, iMax = arr.length;i < iMax;i++) {
            var s = jQuery.trim(arr[i]);
            if (toreturn.indexOf(s) === -1 && s !== '') {
                toreturn.push(s);
            }
        }
        return toreturn;
    };

    /**
     * Resets the fields of the form.
     */
    var resetFields = function() {
        //    Clear the text fields.
        $(txtContent +  ", " + txtTags + ", " + txtTitle).val('');
    };

    /**
     * Shows errors on the supplied fields
     * @param {Object} fields: array of fields
     * @param {String} errorClass: name of the errorclass
     */
    var showErrors = function(fields, errorClass){
        var ok = true;
        for(var i=0, iMax=fields.length; i<iMax;i++){
            var sField = jQuery.trim($(fields[i], rootel).val());
            if(sField === ''){
                ok = false;
                $(fields[i], rootel).addClass(errorClass);
            }
            else{
                $(fields[i], rootel).removeClass(errorClass);
            }
        }
        return ok;
    };

    /**
     * Checks if the fields are filled in correctly.
     * Returns true of false;
     */
    var checkFields = function() {
        //    Get the values.
        var site =   $(cboSite + ' option:selected', rootel).val();
        var txts = [txtTitle, txtContent, txtTags];
        var ok = showErrors(txts, errorClass);
        $(cboSite, rootel).removeClass(errorClass);

        if (site === '') {
            ok = false;
            $(cboSite, rootel).addClass(errorClass);
        }

        return ok;
    };

    /**
     * Shows a general message on the top screen
     * @param {String} msg    the message you want to display
     * @param {Boolean} isError    true for error (red block)/false for normal message(green block)
     * @param {Number} timeout the amount of milliseconds you want the message to be displayed, 0 = always (till the next message)
     */
    var showGeneralMessage = function(msg, isError, timeout){
        // gets the errormessage
        // this is set in the html for i18n
        $(generalMessage).html(sakai.api.Security.saneHTML(msg));
        // show the error container
        $(generalMessage).show();
        // show error or warning
        if (isError) {
            $(generalMessage).addClass(errorMessageClass);
            $(generalMessage).removeClass(normalMessageClass);
        }
        else {
            $(generalMessage).addClass(normalMessageClass);
            $(generalMessage).removeClass(errorMessageClass);
        }
        // use a fadeout for the message
        if (typeof timeout !== "undefined" && timeout !== 0) {
            $(generalMessage).fadeOut(timeout);
        }
        // or just show it
        else {
            $(generalMessage).show();
        }
    };


    ///////////////
    // View mode //
    ///////////////

    /**
     * This will save data too the JCR.
     * @param {String} siteid: the site where the post needs to be saved
     * @param {String} sPreviousPosts A json string containing the previous posts.
     * @param {Boolean} bExists: does the blog already exist
     * @param {Object} post: the post made
     * @param {Object} callback The function that has to be called when the data is saved.
     */
    var savePostToJCR = function(siteid, sPreviousPosts, bExists, post, callback) {
        var json = {'items' : []};

        if (bExists) {
            // There are already some posts in the database, add them so we don't overwrite them.
            json.items = sPreviousPosts.items;
        }

        post.id = json.items.length;

        //    add our post to the list
        json.items.push(post);

        // Save it to jcr
        sakai.api.Widgets.saveWidgetData(tuid, json, callback);
    };


    /**
     * Start the creation proces of a new blogPost
     * @param {String} sSiteId        //    Id where you want to save to.
     * @param {String} sTitle        //    Title of the blog post
     * @param {String} sMessage
     * @param {String} sTags
     * @param {Object} callback The function that has to be called when the save is done.
     */
    var createNewBlogPost = function(sSiteId, sTitle, sMessage, sTags, callback) {

        //    Do a quick check to see if the user has entered all the fields.
        if (sTitle !== "" && sMessage !== "" && sTags !== "") {
            //    save the post to the JCR.

            //    Trim the array
            var arrTags = trimArray(sTags.split(','));
            sTags = arrTags.join(', ');
            var date = $.L10N.transformDate(new Date()) + "T" + $.L10N.transformTime(new Date()) + "Z";
            var json = {'id' : 0, 'title' : sTitle, 'message' : sMessage, 'tags' : sTags, 'arrTags' : arrTags, 'postDate' : date, 'poster' : me.preferences.uuid, 'comments' : [], 'blogpost' : true};

            //    We do a check to see if the node for this blog already exists
            //    If it exists we will have onSucces, if it fails we end up with an onFail.
            //    Since all the blogposts and comments are saved under one node we
            //    check this to make sure we don't overwrite any posts.

            sakai.api.Widgets.loadWidgetData(tuid,function(success, data) {
                if (success) {
                    // There are some posts in here. Pass them along.
                    savePostToJCR(sSiteId, data, true, json, callback);
                } else {
                    // This is the first post.
                    savePostToJCR(sSiteId, data, false, json, callback);
                }
            });

        }
        else {
            throw "Not all fields were defined.";
        }
    };

    /**
     * Called when a post is added.
     * Will display a message and reset the form fields.
     */
    var addedPost = function(success) {
        if (success) {
            showGeneralMessage('The post has been saved too the database.', false, 4000);
            resetFields();
        }
        else {
            showGeneralMessage('Failed to save the post too the database.', true, 4000);
        }
    };



    //////////////////
    //    SITES part    //
    //////////////////


    /**
     * Will compare site a to site b and sort it by name.
     * @param {Object} a
     * @param {Object} b
     * @return 1, 0 or -1
     */
    var doSort = function(a,b){
        if (a.name > b.name) {
            return 1;
        } else if (a.name === b.name) {
            return 0;
        } else {
            return -1;
        }
    };


    /**
     * Takes an array of sites objects and adds them to the select box.
     * @param {Object} newjson
     */
    var doRender = function(newjson){
        //    Loop the sites and add them in an array that can be used by trimpath
        for (var i = 0, iMax = newjson.entry.length; i < iMax; i++){
            newjson.entry[i].location = newjson.entry[i].location.substring(1);
        }
        newjson.entry = newjson.entry.sort(doSort);
        //    run trimpath and show the sites.
        $(cboSite, rootel).html($.TemplateRenderer(siteTemplate.replace(/#/gi,''), newjson));
    };

    /**
     * Will be called when the sites have loaded.
     * @param {Object} response    The response we got from the server
     */
    var loadSiteList = function(response){
        var newjson = {};
        newjson.entry = [];
        if (response.entry) {
            for (var i = 0, iMax =response.entry.length ; i < iMax; i++) {
                var site = response.entry[i];
                //    if we are an owner of this site, add it
                if (site.owners.indexOf(me.preferences.uuid) > -1) {
                    if (site.id.substring(0, 1) !== "~") {
                        newjson.entry[newjson.entry.length] = site;
                    }
                }
            }
        }
        //    This will render the sites that we are an owner of.
        doRender(newjson);
    };



    //////////////////////
    //    Init function    //
    //////////////////////



    var doInit = function() {
        //    We do a request to get all the sites.
        $.ajax({
            url: sakai.config.URL.SITES_SERVICE,
            cache: false,
            success: function(data){
                loadSiteList(data);
            },
            error: function(xhr, textStatus, thrownError) {
                showGeneralMessage("Failed to retrieve the sites.", true);
            }
        });
    };



    //////////////////
    //    Bind events    //
    //////////////////


    /*$(buttonReset).click(function(){
        resetFields();
    });

    $(buttonPublish).click(function(){
        //    start the process.
        if (checkFields()) {
            var sTitle = jQuery.trim($(txtTitle, rootel).val());
            var sMessage = jQuery.trim($(txtContent, rootel).val());
            var sTags = jQuery.trim($(txtTags, rootel).val());
            var site =   $(cboSite + ' option:selected', rootel).val();

            site = site + "/_widgets";
            createNewBlogPost(site, sTitle, sMessage, sTags, addedPost);
        }
    });*/


    //    Start the widgets functionality.
    doInit();

};
sakai.api.Widgets.widgetLoader.informOnLoad("blogdashboard");
