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
     * @name sakai.templategenerator
     *
     * @class templategenerator
     *
     * @description
     * WIDGET DESCRIPTION
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.templategenerator = function(tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        var $rootel = $("#" + tuid);

        // Data Items in the Form
        var $templategeneratorTitle = $('#templategenerator', $rootel);

        // Page Structure Elements
        var $templategeneratorContainer = $('#templategenerator_container', $rootel);
        var $templategeneratorDialog = $('.templategenerator_dialog', $rootel);
        var $templategeneratorForm = $("#templategenerator_form", $rootel);
        var $templategeneratorExportButton = $("#templategenerator_export_button");
        var $templategeneratorTitle = $('#templategenerator_title');
        var $templategeneratorUsedFor = $('#templategenerator_used_for');
        var $templategeneratorExport = $('#templategenerator_export');

        // Main data storage, used to store the generated or collected data within the widget
        var templategeneratorData = {
            roles : {},
            docstructure : {},
            pages : [],
            output : "",
            generatingTemplate : false
        };

        // Main template structure
        var templategeneratorDataTemplate = {
            id : "",
            title : "",
            img : "",
            fullImg : "",
            perfectFor : "",
            roles : [],
            docs : {},
            structure : [],
            joinRole : "",
            creatorRole : ""
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        /**
         * Event handler fired when a message has been send to the user
         */
        var handleSentMessage = function(success) {
            if(success) {

                // Show a notification when the message has been send to the user
                sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_EXPORT_SUCCES", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);

                // Flag the generating as false to indicate that the process has been completed
                templategeneratorData.generatingTemplate = false;

            } else {

                // Show annotification when something when an error has occurred while sending the message
                sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_EXPORT_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);
            }

            // Hide the widget
            $templategeneratorDialog.jqmHide();
        };
        /**
         * Bind the event handlers
         */
        var bindEvents = function() {

            // Bind jqmodal
            $templategeneratorDialog.jqm({
                modal : true,
                overlay : 20,
                toTop : true
            });

            // Bind form validation
            $templategeneratorForm.validate({

                // Submit handler, fired when the input form has been validated
                submitHandler : function(form, validator) {

                    // Disable submit button
                    $templategeneratorExportButton.attr("disabled", "disabled");

                    // Generate the template
                    generateTemplateFromData();
                }
            });
        };
        /**
         * Generates the template
         */
        var generateTemplateFromData = function() {

            // Only start generating when all data has been loaded and the previous process has been completed
            if(templategeneratorData.templatesLoaded && !templategeneratorData.generatingTemplate) {

                // Indicate that the gerating process has been started
                templategeneratorData.generatingTemplate = true;

                // Create a new empty template structure for export
                templategeneratorData.exportData = $.extend({}, templategeneratorDataTemplate);

                /**
                 * The actual process starts here
                 */
                // 1. Heading
                templategeneratorData.exportData.title = $templategeneratorTitle.val();
                templategeneratorData.exportData.perfectFor = $templategeneratorUsedFor.val();
                templategeneratorData.exportData.id = templategeneratorData.exportData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

                // 2. Roles
                templategeneratorData.exportData.roles = templategeneratorData.roles.roleData;
                templategeneratorData.exportData.joinRole = templategeneratorData.roles.joinRole;
                templategeneratorData.exportData.creatorRole = templategeneratorData.roles.creatorRole;

                // 3. Docs
                var pageId, refId;
                pageId = refId = 0;

                // Create the root structure for the docs by going through each pageStructure
                $.each(templategeneratorData.pageStructures, function(docstructureIndex, docstructureElement) {

                    // Create a unique page id
                    var pid = '${pid}' + pageId;

                    // Create the general page structure
                    var page = {};
                    page[pid] = {};
                    page[pid].structure0 = $.extend(true, {}, templategeneratorData.pages[pageId].structure);

                    // Delete the _pid and the _poolpath key, because we dont want this in the docStructure
                    delete page[pid].structure0._pid; 
                    delete page[pid].structure0._poolpath;

                    // Create the individual pages and add all the content
                    $.each(page[pid].structure0, function(pageIndex, pageElement) {

                        // Store the old reference so we use its id to trace the excisting data
                        var oldRef = pageElement._ref;

                        // Create the structure for the reference
                        var newRef = '${refid}' + refId;
                        pageElement._ref = newRef;
                        pageElement.main._ref = newRef;

                        // Delete unwanted keys
                        delete pageElement._poolpath; 
                        delete pageElement._id; 
                        delete pageElement._elements; 
                        delete pageElement.main._id; 
                        delete pageElement.main._poolpath; 
                        delete pageElement.main._elements;

                        // Create a new unique reference for each page
                        page[pid][newRef] = {};

                        // Extract the HTML data for each page so we can look for widgets
                        var myPageContent = $(templategeneratorData.pages[pageId].pageData[oldRef].page);
                        $templategeneratorExport.append(myPageContent);

                        // Look for the widgets within the HTML data
                        var widgetElements = $templategeneratorExport.find(".widget_inline");
                        $(widgetElements).each(function(widgetIndex, widgetElement) {

                            // We need a new reference id
                            refId++;

                            // Create a unique reference for each widget
                            var widgetRef = '${refid}' + refId;

                            // Store the old widget and add the new reference id
                            var oldWidgetReference = $(widgetElement).attr('id');

                            // Create the basic structure for the widget
                            page[pid][widgetRef] = {};

                            // Get the widget name and content id
                            oldWidgetReference = oldWidgetReference.split('_');

                            // Replace the widget's reference
                            $(widgetElement).attr('id', 'widget_' + oldWidgetReference[1] + '_' + widgetRef);

                            // Create our new widget object
                            page[pid][widgetRef][oldWidgetReference[1]] = {};

                            if(templategeneratorData.pages[pageId].pageData[oldWidgetReference[(oldWidgetReference.length) - 1]]) {

                                // Store the old and new widgetdata (just to make things more clear)
                                var oldWidgetData = templategeneratorData.pages[pageId].pageData[oldWidgetReference[(oldWidgetReference.length) - 1]][oldWidgetReference[1]];
                                var newWidgetData = page[pid][widgetRef][oldWidgetReference[1]];

                                // Check all properties within the widget and copy the right ones
                                if(oldWidgetData) {
                                    $.each(oldWidgetData, function(widgetPropertyKey, widgetPropertyElement) {

                                        var firstCharacter = widgetPropertyKey.charAt(0);

                                        if(firstCharacter !== '_') {
                                            // The actual data keys
                                            newWidgetData[widgetPropertyKey] = widgetPropertyElement;
                                        }
                                    });
                                }
                            }
                        });
                        // Extract our updated HTML structure
                        var generatedHTML = $templategeneratorExport.empty().append(myPageContent).html().trim().replace(/"/g, '\'').replace(/\n/g, "");

                        // Insert the updated HTML structure into the page
                        page[pid][newRef].page = generatedHTML;
                        $templategeneratorExport.empty();
                        refId++;
                    });
                    // Increase the pageID for the iteration
                    pageId++;

                    // Add our generated page to the docStructure
                    $.extend(true, templategeneratorData.exportData.docs, page);
                });
                // 4. Generate the structure
                var pageIndex = 0;
                var structure = $.extend(true, {}, templategeneratorData.docstructure.structure);
                $.each(structure, function(structureIndex, structureElement) {

                    // Update the pageId in the _docref
                    structureElement['_docref'] = '${pid}' + pageIndex;
                    pageIndex++;

                    // Remove unwanted keys
                    delete structureElement._poolpath; 
                    delete structureElement._elements; 
                    delete structureElement._id;
                });
                // Add our updated structure
                templategeneratorData.exportData.structure = structure;

                // Stringify the created javascript object (this creates the actual string and manipulates the escaping)
                templategeneratorData.output = $.toJSON(templategeneratorData.exportData, null, "\t");
                templategeneratorData.output = templategeneratorData.output.replace(/\\/g, '');
                
                // Create a file from the generated string
                createTemplateFile();
            }
        }
        /**
         * Uploads the created template as a file on the fileSystem and sends a notification to the user
         */
        var createTemplateFile = function() {

            // Upload our template file to the server
            var body = "--AAAAA\r\n"
            body = body + "Content-Disposition: form-data; name=\"*\"; filename=\"" + templategeneratorData.exportData.id + ".txt\" \r\n";
            body = body + "Content-Type: text/plain \r\n";
            body = body + "Content-Transfer-Encoding: binary\r\n\r\n";
            body = body + templategeneratorData.output + "\r\n";
            body = body + "--AAAAA--\r\n";

            $.ajax({
                url : "/system/pool/createfile",
                data : body,
                type : "POST",
                beforeSend : function(xmlReq) {

                    // Set the headers
                    xmlReq.setRequestHeader("Content-type", "multipart/form-data; boundary=AAAAA");
                },
                success : function(data) {

                    // After uploading the file, permissions must be set
                    var fileData = $.parseJSON(data);
                    fileData = fileData[templategeneratorData.exportData.id + '.txt'];

                    // Set the permissions of the file to private
                    sakai.api.Content.setFilePermissions([{
                        "hashpath" : fileData.poolId,
                        "permissions" : "private"
                    }], function() {

                        // Remove the file from the user's library and move it to the admin user
                        $.ajax({
                            url : "/p/" + fileData.poolId + ".members.json",
                            type : "POST",
                            data : {
                                ":manager" : sakai.widgets.templategenerator.defaultConfiguration.templategenerator.targetUser
                            },
                            success : function() {
                                $.ajax({
                                    url : "/p/" + fileData.poolId + ".members.json",
                                    type : "POST",
                                    data : {
                                        ":manager@Delete" : sakai.data.me.user.userid
                                    },
                                    success : function() {

                                        // Get the link to our generated file
                                        var filePath = 'http://' + window.location.host + '/p/' + fileData.poolId + '/' + fileData.item['sakai:pooled-content-file-name'];

                                        // Sends a link with the template file to the admin user
                                        sakai.api.Communication.sendMessage(sakai.widgets.templategenerator.defaultConfiguration.templategenerator.targetUser, sakai.data.me, sakai.api.User.getDisplayName(sakai.data.me.profile) + " " + sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_ADMIN_MESSAGE_SUBJECT", "templategenerator"), sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_ADMIN_MESSAGE", "templategenerator") + "\n\n" + filePath, "message", false, handleSentMessage, true, "new_message");

                                        // Sends a message to the user that created the template
                                        sakai.api.Communication.sendMessage(sakai.data.me.user.userid, sakai.data.me, sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_USER_MESSAGE_SUBJECT", "templategenerator"), sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_USER_MESSAGE", "templategenerator"), "message", false, null, true, "new_message");
                                    },
                                    error : function() {
                                        // Show specific error notification
                                        sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_DELETE_FILE_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);

                                        // Hide the widget
                                        $templategeneratorDialog.jqmHide();
                                    }
                                });
                            },
                            error : function() {
                                // Show specific error notification
                                sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_PERMISSION_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);

                                // Hide the widget
                                $templategeneratorDialog.jqmHide();
                            }
                        });
                    });
                },
                error : function(error) {
                    // Show specific error notification
                    sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_FILE_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);

                    // Hide the widget
                    $templategeneratorDialog.jqmHide();
                }
            });
        }
        /**
         * Retrieve all the data from the server and prepare for the templateGenerating process
         */
        var getTemplateData = function() {

            // Get the id our our current site/group/...
            templategeneratorData.templateName = sakai_global.group.groupData.name;

            // Create the url to the dosctructure
            templategeneratorData.docstructureUrl = "~" + templategeneratorData.templateName + "/docstructure.infinity.json";

            // Create the url to the roles
            templategeneratorData.rolesUrl = "/system/userManager/group/" + templategeneratorData.templateName + ".infinity.json";

            // Show the current title in the input field
            $templategeneratorTitle.val(templategeneratorData.templateName);

            // Create our requests
            var batchRequests = [];
            batchRequests.push({
                "url" : templategeneratorData.docstructureUrl,
                "method" : "GET"
            });
            batchRequests.push({
                "url" : templategeneratorData.rolesUrl,
                "method" : "GET"
            });

            // Process the requests to collect both the docstructure and roles
            sakai.api.Server.batch(batchRequests, function(success, data) {

                if(success && data.results && data.results[0] && data.results[0].body && data.results[1] && data.results[1].body) {

                    // Parse the docstructure data
                    templategeneratorData.docstructure.docstructureData = $.parseJSON(data.results[0].body);
                    templategeneratorData.docstructure.structure = $.parseJSON(templategeneratorData.docstructure.docstructureData.structure0);

                    // Get the urls for each page in the docstructure and convert the elements within the structure to json
                    templategeneratorData.pageUrls = [];
                    $.each(templategeneratorData.docstructure.structure, function(docstructureIndex, docstructureElement) {
                        docstructureElement._view = $.parseJSON(docstructureElement._view);
                        docstructureElement._edit = $.parseJSON(docstructureElement._edit);

                        // Create a Request for each page so we can process this as a batch
                        templategeneratorData.pageUrls.push({
                            "url" : "/p/" + docstructureElement._pid + ".infinity.json",
                            "method" : "GET"
                        });

                    });
                    // Grab the data for each page
                    templategeneratorData.pages.structures = [];
                    templategeneratorData.pageStructures = [];

                    // Process the batchRequest for all the pages
                    sakai.api.Server.batch(templategeneratorData.pageUrls, function(success, data) {
                        if(success) {
                            // Create a dataObject for each page
                            $.each(data.results, function(pageIndex, pageElement) {
                                var page = {};
                                page.pageData = $.parseJSON(pageElement.body);
                                page.structure = $.parseJSON(page.pageData.structure0);

                                templategeneratorData.pages.push(page);
                                templategeneratorData.pageStructures.push(page.structure);

                                // Extra check to make sure that the pageData is loaded
                                templategeneratorData.templatesLoaded = true;
                            });
                        } else {
                            templategeneratorData.templatesLoaded = false;
                        }
                    });
                    // 2. Roles
                    var roleData = $.parseJSON(data.results[1].body);
                    templategeneratorData.roles.roleData = $.parseJSON(roleData.properties["sakai:roles"]);
                    templategeneratorData.roles.joinRole = roleData.properties["sakai:joinRole"];
                    templategeneratorData.roles.creatorRole = roleData.properties["sakai:creatorRole"];

                } else {
                    templategeneratorData.templatesLoaded = false;

                    // Show error notification
                    sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_LOAD_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);
                }
            });
        };
        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function
         */
        var init = function() {
            // Make sure the exportButton is enabled
            $templategeneratorExportButton.removeAttr("disabled");

            // Get the template data
            getTemplateData();

            // Show the widget's modal
            $templategeneratorDialog.jqmShow();
        };
        // Bind the events
        bindEvents();

        // Run the initialization function when the widget object loads
        $(window).bind("init.templategenerator.sakai", function(e) {
            init();
        });
    };
    // Inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad("templategenerator");
});
