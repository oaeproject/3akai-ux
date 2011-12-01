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

        var $rootel = $("#" + tuid);
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
            creatorRole : "",
            defaultaccess: "public",
            defaultjoin: "yes",
            excludeSearch: true
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        var handleSentMessage = function(success) {
            if (success) {
                sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_EXPORT_SUCCES", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);
                templategeneratorData.generatingTemplate = false;
            } else {
                sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_EXPORT_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);
            }
            $templategeneratorDialog.jqmHide();
        };

        var bindEvents = function() {
            $templategeneratorDialog.jqm({
                modal : true,
                overlay : 20,
                toTop : true
            });

            var validateOpts = {
                submitHandler: function() {
                    $templategeneratorExportButton.attr( "disabled", "disabled" );
                    generateTemplateFromData();
                }
            };
            sakai.api.Util.Forms.validate( $templategeneratorForm, validateOpts, true );
        };

        var generateTemplateFromData = function() {
            if (templategeneratorData.templatesLoaded && !templategeneratorData.generatingTemplate) {
                templategeneratorData.generatingTemplate = true;
                templategeneratorData.exportData = $.extend({}, templategeneratorDataTemplate);

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
                    var pid = '${pid}' + pageId;
                    var page = {};
                    page[pid] = {};
                    page[pid].structure0 = $.extend(true, {}, templategeneratorData.pages[pageId].structure);
                    delete page[pid].structure0._pid;
                    delete page[pid].structure0._poolpath;

                    // Create the individual pages and add all the content
                    $.each(page[pid].structure0, function(pageIndex, pageElement) {
                        var oldRef = pageElement._ref;

                        var newRef = '${refid}' + refId;
                        pageElement._ref = newRef;
                        pageElement.main._ref = newRef;

                        delete pageElement._poolpath;
                        delete pageElement._id;
                        delete pageElement._elements;
                        delete pageElement.main._id;
                        delete pageElement.main._poolpath;
                        delete pageElement.main._elements;

                        page[pid][newRef] = {};

                        // Extract the HTML data for each page so we can look for widgets
                        var myPageContent = $(templategeneratorData.pages[pageId].pageData[oldRef].page);
                        $templategeneratorExport.append(myPageContent);

                        // Look for the widgets within the HTML data
                        var widgetElements = $templategeneratorExport.find(".widget_inline");
                        $(widgetElements).each(function(widgetIndex, widgetElement) {
                            refId++;
                            var widgetRef = '${refid}' + refId;
                            var oldWidgetReference = $(widgetElement).attr('id');
                            page[pid][widgetRef] = {};
                            oldWidgetReference = oldWidgetReference.split('_');
                            $(widgetElement).attr('id', 'widget_' + oldWidgetReference[1] + '_' + widgetRef);
                            page[pid][widgetRef][oldWidgetReference[1]] = {};

                            if (templategeneratorData.pages[pageId].pageData[oldWidgetReference[(oldWidgetReference.length) - 1]]) {
                                var oldWidgetData = templategeneratorData.pages[pageId].pageData[oldWidgetReference[(oldWidgetReference.length) - 1]][oldWidgetReference[1]];
                                var newWidgetData = page[pid][widgetRef][oldWidgetReference[1]];

                                // Only copy data for certain widgets
                                var uniqueDataWidget = $.inArray(oldWidgetReference[1], sakai.widgets.templategenerator.defaultConfiguration.templategenerator.uniqueDataWidgets);

                                if (oldWidgetData && uniqueDataWidget === -1) {
                                    $.each(oldWidgetData, function(widgetPropertyKey, widgetPropertyElement) {
                                        var firstCharacter = widgetPropertyKey.charAt(0);
                                        if (firstCharacter !== '_') {
                                            newWidgetData[widgetPropertyKey] = widgetPropertyElement;
                                        }
                                    });
                                } else {
                                    newWidgetData.groupid = "${groupid}";
                                }
                            }
                        });
                        var generatedHTML = $templategeneratorExport.empty().append(myPageContent).html().trim().replace(/"/g, '\'').replace(/\n/g, "");
                        page[pid][newRef].page = generatedHTML;
                        $templategeneratorExport.empty();
                        refId++;
                    });

                    pageId++;
                    $.extend(true, templategeneratorData.exportData.docs, page);
                });

                // 4. Generate the structure
                var pageIndex = 0;
                var structure = $.extend(true, {}, templategeneratorData.docstructure.structure);
                $.each(structure, function(structureIndex, structureElement) {
                    structureElement['_docref'] = '${pid}' + pageIndex;
                    pageIndex++;
                    delete structureElement._poolpath;
                    delete structureElement._elements;
                    delete structureElement._id;
                    delete structureElement._pid;
                });
                templategeneratorData.exportData.structure = structure;
                templategeneratorData.output = JSON.stringify(templategeneratorData.exportData, null, 4);
                templategeneratorData.output = templategeneratorData.output.replace(/\\/g, '');
                createTemplateFile();
            }
        };

        var createTemplateFile = function() {
            var body = "--AAAAA\r\n";
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
                    xmlReq.setRequestHeader("Content-type", "multipart/form-data; boundary=AAAAA");
                },
                success : function(data) {
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
                                        var userDisplayName = sakai.api.User.getDisplayName(sakai.data.me.profile);
                                        var msg = sakai.api.Util.TemplateRenderer("templategenerator_admin_message_template", {
                                            "system": sakai.api.i18n.getValueForKey("SAKAI"),
                                            "user": userDisplayName
                                        });
                                        sakai.api.Communication.sendMessage(sakai.widgets.templategenerator.defaultConfiguration.templategenerator.targetUser,
                                            sakai.data.me,
                                            userDisplayName + " " + sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_ADMIN_MESSAGE_SUBJECT", "templategenerator"), msg + "\n\n" + filePath, "message", false, handleSentMessage, true, "new_message");

                                        // Sends a message to the user that created the template
                                        sakai.api.Communication.sendMessage(sakai.data.me.user.userid, sakai.data.me, sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_USER_MESSAGE_SUBJECT", "templategenerator"), sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_USER_MESSAGE", "templategenerator"), "message", false, null, true, "new_message");
                                    },
                                    error : function() {
                                        sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_DELETE_FILE_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);
                                        $templategeneratorDialog.jqmHide();
                                    }
                                });
                            },
                            error : function() {
                                sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_PERMISSION_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);
                                $templategeneratorDialog.jqmHide();
                            }
                        });
                    });
                },
                error : function(error) {
                    sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_FILE_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);
                    $templategeneratorDialog.jqmHide();
                }
            });
        };

        /**
         * Retrieve all the data from the server and prepare for the templateGenerating process
         */
        var getTemplateData = function( callback ) {
            templategeneratorData.templateName = sakai_global.group.groupData.name;
            templategeneratorData.docstructureUrl = "~" + templategeneratorData.templateName + "/docstructure.infinity.json";
            templategeneratorData.rolesUrl = "/system/userManager/group/" + templategeneratorData.templateName + ".infinity.json";
            $templategeneratorTitle.val(templategeneratorData.templateName);

            var batchRequests = [];
            batchRequests.push({
                "url" : templategeneratorData.docstructureUrl,
                "method" : "GET"
            });
            batchRequests.push({
                "url" : templategeneratorData.rolesUrl,
                "method" : "GET"
            });
            sakai.api.Server.batch(batchRequests, function(success, data) {

                if (success && data.results && data.results[0] && data.results[0].body && data.results[1] && data.results[1].body) {
                    templategeneratorData.docstructure.docstructureData = $.parseJSON(data.results[0].body);
                    templategeneratorData.docstructure.structure = $.parseJSON(templategeneratorData.docstructure.docstructureData.structure0);

                    // Get the urls for each page in the docstructure and convert the elements within the structure to json
                    templategeneratorData.pageUrls = [];
                    $.each(templategeneratorData.docstructure.structure, function(docstructureIndex, docstructureElement) {
                        docstructureElement._view = $.parseJSON(docstructureElement._view);
                        docstructureElement._edit = $.parseJSON(docstructureElement._edit);
                        templategeneratorData.pageUrls.push({
                            "url" : "/p/" + docstructureElement._pid + ".infinity.json",
                            "method" : "GET"
                        });

                    });
                    templategeneratorData.pages = [];
                    templategeneratorData.pageStructures = [];

                    sakai.api.Server.batch(templategeneratorData.pageUrls, function(success, data) {
                        if (success) {
                            $.each(data.results, function(pageIndex, pageElement) {
                                var page = {};
                                page.pageData = $.parseJSON(pageElement.body);
                                page.structure = $.parseJSON(page.pageData.structure0);

                                templategeneratorData.pages.push(page);
                                templategeneratorData.pageStructures.push(page.structure);
                                if ( $.isFunction( callback ) ) {
                                    callback( true );
                                }
                            });
                        } else {
                            if ( $.isFunction( callback ) ) {
                                callback( false );
                            }
                        }
                    });
                    // 2. Roles
                    var roleData = $.parseJSON(data.results[1].body);
                    templategeneratorData.roles.roleData = $.parseJSON(roleData.properties["sakai:roles"]);
                    templategeneratorData.roles.joinRole = roleData.properties["sakai:joinRole"];
                    templategeneratorData.roles.creatorRole = roleData.properties["sakai:creatorRole"];

                } else {
                    if ( $.isFunction( callback ) ) {
                        callback( false );
                    }
                    sakai.api.Util.notification.show("", sakai.api.i18n.getValueForKey("TEMPLATEGENERATOR_LOAD_ERROR", "templategenerator"), sakai.api.Util.notification.type.INFORMATION);
                }
            });
        };

        var init = function() {
            $templategeneratorExportButton.removeAttr("disabled");
            templategeneratorData.templatesLoaded = false;
            getTemplateData(function(success) {
                templategeneratorData.templatesLoaded = true;
            });
            $templategeneratorDialog.jqmShow();
        };
        bindEvents();

        $(window).bind("init.templategenerator.sakai", function(e) {
            init();
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("templategenerator");
});
