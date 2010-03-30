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

/*global Config, $, sdata, window */

var sakai = sakai || {};
sakai.tangler = function(tuid, placement, showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var rootel = $("#" + tuid);
    var argumentsCalleeDone = false;

    // ID's
    var tangler = "#tangler";

    // Button
    var tanglerSave = tangler + "_save";
    var tanglerCancel = tangler + "_cancel";

    // Container
    var tanglerOutput = tangler + "_output";
    var tanglerSettings = tangler + "_settings";

    // Textarea
    var tanglerCode = tangler + "_code";


    ///////////////////////
    // Utility functions //
    ///////////////////////

    /**
     * This function is executed after you deleted or saved a tangler forum widget.
     * It lets the sdata container know they you finished editing/saving the widget
     * and it will close the pop-up (lightbox).
     */
    var finishNewSettings = function(){
        sdata.container.informFinish(tuid);
    };

    /**
     * Show the forum widget in the main view after the request to get the data and
     * check if it exists or not.
     * @param {String} response The response that should contain a string that contains
     *     the information about the tangler forum.
     *     Response example:
     *     <p style="width:410px;height:480px" id="tangler-embed-topic-59940"></p>
     *     <script src="http://tangler.com:80/widget/embedtopic.js?id=59940&gId=38587"></script>
     * @param {String} exists
     *     true: If the the tangler forum widget exists.
     *     false: The tangler forum widget doesn't exist.
     */
    var showForum = function(response, exists){
        if (exists){
            // We put everything inside a try block so when we encounter an error, we
            // just show an error message.
            try {
                // All the code you find beneath is not from Sakai!
                // It is a copy paste from http://www.tangler.com/widget/embedtopic.js with some modifications

                // Split the response in 2 major parts: the paragraph and the script part
                var split = response.split("<script");

                // The first part (inside the p tags) from the response
                var paragraph = split[0];
                // The second part that contains the script tag
                var script = split[1];

                // Extract the ID & gID from the response
                var start = script.split("embedtopic.js?id=");
                var start2 = script.split("&gId=");
                var id = start[1].split("&")[0];
                var gid = start2[1].split("\"")[0];

                // Put the paragraph in the output container in the main view.
                $(tanglerOutput,rootel).html(paragraph);

                // Quit if this function already has been called.
                // We do this before executing the javascript and after adding
                // the paragraph.
                if (argumentsCalleeDone) {
                    return;
                }

                // Flag this function so we don't do the same thing twice.
                argumentsCalleeDone = true;

                var eleId = "tangler-embed-topic-" + id;
                var embedElement = $("#" + eleId, rootel)[0];

                var contextUrl = false;

                var width = "410px";
                var height = "480px";

                if( embedElement.style )
                {
                    width = embedElement.style.width?embedElement.style.width:'410px';
                    height = embedElement.style.height?embedElement.style.height:'480px';
                }
                var iframeSrc = 'http://www.tangler.com/embed/topic/' + id;
                if( contextUrl ){
                    iframeSrc = contextUrl + "/embed/topic/" + id;
                }

                var iframe = document.createElement("iframe");
                iframe.src = iframeSrc;
                iframe.width = width;
                iframe.height = height;
                iframe.scolling = 'no';
                iframe.marginwidth = '0';
                iframe.marginheight = '0';
                iframe.frameBorder = '0';
                iframe.style.border = 0;
                var isIE = window.ActiveXObject?true:false;
                if( !isIE )
                {
                    var a = document.createElement("a");
                    a.href = sakai.config.SakaiDomain + '/forum/id-' + gid + '/topic/' + id;
                    a.target = "_blank";
                    a.appendChild(document.createTextNode("Join this disucssion"));
                    iframe.appendChild(a);
                }

                embedElement.appendChild(iframe);
            }catch (err){
                $(tanglerOutput, rootel).text("No valid Tangler forum found");
            }
        } else {
            $(tanglerOutput, rootel).text("No valid Tangler forum found");
        }
    };

    /**
     * Function that is executed after clicking the save button. We also check if the
     * textarea contains anything. If it doesn't we delete the file inside jcr.
     */
    var saveNewSettings = function(){
        var val = $(tanglerCode, rootel).val();

        // To check if the textarea contains anything, we use regular expressions.
        // The reason we don't use the length method for the string is that a space " "
        // is in fact also a character. More validation happens when the string is parsed

        if (!val || val.replace(/ /g, "%20") === "") {

            sakai.api.Widgets.removeWidgetData("tangler", tuid, placement, finishNewSettings);

        }
        else {
            sakai.api.Widgets.saveWidgetData("tangler", val, tuid, placement, finishNewSettings);
        }
    };


    ////////////////////
    // Event Handlers //
    ////////////////////

    /*
     * Save the settings of the widget when you click the save button
     */
    $(tanglerSave, rootel).bind("click", saveNewSettings);

    /*
     * Close the settings pop-up (lightbox) when you hit the cancel button
     */
    $(tanglerCancel, rootel).bind("click",function(){

        // This lets the sdata container know that the current settings view
        // of the widget should be closed. We pass the tuid of the widget to
        // let the container know which widget it should close.
        sdata.container.informCancel(tuid);
    });


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Fill in the unique id for a specific tangler object.
     * The process to get an id is the same in 2 situations: when you show the
     * settings view and when you load the widget in main view.
     * The only difference is the function they need to execute when they received or
     * didn't receive the data from the server.
     * That is the reason why we combined both functionalities in this one method
     */
    var fillInUniqueId = function(){
        sakai.api.Widgets.loadWidgetData("tangler", tuid, placement, function(success, data) {

            if (success) {
                if(showSettings){
                    // Fill in the textarea that contains the tangler code you have to
                    // get from the tangler website
                    $(tanglerCode,rootel).val(data);
                } else {
                    showForum(data,true);
                }
            } else {
                // Only execute the function if you aren't in settings mode.
                if(!showSettings){
                    showForum(data,false);
                }
            }
        });
        
    };

    /**
     * Excecute this function when the widget is loaded.
     * We first execute the request and then hide/show different div containers
     */
    var doInit = function(){
        fillInUniqueId();

        // Show the settings view or the main view of the widget
        if (showSettings){
            $(tanglerOutput, rootel).hide();
            $(tanglerSettings, rootel).show();
        } else {
            $(tanglerSettings, rootel).hide();
            $(tanglerOutput, rootel).show();
        }
    };
    doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("tangler");
