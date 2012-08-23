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
require(['jquery', 'underscore', 'sakai/sakai.api.core'], function($, _, sakai) {

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

        var $rootel = $('#' + tuid);
        var $templategeneratorContainer = $('#templategenerator_container', $rootel);
        var $templategeneratorDialog = $('.templategenerator_dialog', $rootel);
        var $templategeneratorForm = $('#templategenerator_form', $rootel);
        var $templategeneratorExportButton = $('#templategenerator_export_button');
        var $templategeneratorTitle = $('#templategenerator_title');
        var $templategeneratorUsedFor = $('#templategenerator_used_for');
        var $templategeneratorExport = $('#templategenerator_export');

        // Main data storage, used to store the generated or collected data within the widget
        var templategeneratorData = {
            roles : {},
            docstructure : {},
            pages : [],
            output : '',
            generatingTemplate : false
        };

        // Main template structure
        var templategeneratorDataTemplate = {
            id : '',
            title : '',
            img : '',
            fullImg : '',
            perfectFor : '',
            roles : [],
            docs : {},
            structure : [],
            joinRole : '',
            creatorRole : '',
            defaultaccess: 'public',
            defaultjoin: 'yes'
        };

        ////////////////////
        // Event Handlers //
        ////////////////////

        var handleSentMessage = function(success) {
            if (success) {
                sakai.api.Util.notification.show('', sakai.api.i18n.getValueForKey('TEMPLATEGENERATOR_EXPORT_SUCCES', 'templategenerator'), sakai.api.Util.notification.type.INFORMATION);
                templategeneratorData.generatingTemplate = false;
            } else {
                sakai.api.Util.notification.show('', sakai.api.i18n.getValueForKey('TEMPLATEGENERATOR_EXPORT_ERROR', 'templategenerator'), sakai.api.Util.notification.type.INFORMATION);
            }
            sakai.api.Util.Modal.close($templategeneratorDialog);
        };

        var bindEvents = function() {
            sakai.api.Util.Modal.setup($templategeneratorDialog, {
                modal : true,
                overlay : 20,
                toTop : true
            });

            var validateOpts = {
                submitHandler: function() {
                    $templategeneratorExportButton.attr( 'disabled', 'disabled' );
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
                templategeneratorData.exportData.structure = templategeneratorData.docstructure.structure;

                var refIndex = 0;

                // 3. Docs
                $.each(templategeneratorData.pageStructures, function(index, item) {
                    var pidIndex = '${pid}' + index;
                    // Get the first page
                    var firstPage = _.keys(item)[0];

                    // Set the docref and delete the pid if is hanging around
                    templategeneratorData.exportData.structure[firstPage]._docref = pidIndex;
                    delete templategeneratorData.exportData.structure[firstPage]._pid;

                    // Add the documents for the page
                    templategeneratorData.exportData.docs['${pid}' + index] = {
                        'excludeSearch': true,
                        'structure0': {}
                    };
                    // Add structure0 inside of that page
                    var pageRefs = [];
                    $.each(templategeneratorData.pages[index].structure, function(pageid, pagedata) {
                        templategeneratorData.exportData.docs[pidIndex].structure0[pageid] = {
                            '_ref': '${refid}' + refIndex,
                            '_title': pagedata._title,
                            '_order': pagedata._order,
                            '_nonEditable': pagedata._nonEditable || false,
                            'main': {
                                '_ref': '${refid}' + refIndex,
                                '_order': pagedata.main._order,
                                '_title': pagedata.main._title,
                                '_nonEditable': pagedata.main._nonEditable || false
                            }
                        };
                        pageRefs.push({ pageRef: pagedata._ref, index: refIndex });
                        if (_.keys(templategeneratorData.pages[index].structure).length > 1) {
                            refIndex += 1;
                        }
                    });

                    $.each(pageRefs, function(i, pageObj) {
                        var pageRef = pageObj.pageRef;
                        var pageRefIndex = '${refid}' + pageObj.index;
                        // Add the content for the page (rows, cells,...)
                        templategeneratorData.exportData.docs[pidIndex][pageRefIndex] = {
                            'rows': []
                        };
                        // Rows on the page
                        $.each(templategeneratorData.pages[index].pageData[pageRef].rows, function(rowIndex, row) {
                            if (_.isString(row)) {
                                try {
                                    row = $.parseJSON(row);
                                } catch (e) {
                                    // This string was not JSON, continue
                                    return true;
                                }
                            }
                            if ($.isPlainObject(row)) {
                                refIndex += 1;
                                var rowRef = '${refid}' + refIndex;
                                templategeneratorData.exportData.docs[pidIndex][pageRefIndex].rows[rowIndex] = {
                                    'id': rowRef,
                                    'columns': []
                                };
                                // Columns in the rows
                                $.each(row.columns, function(columnIndex, column) {
                                    if ($.isPlainObject(column)) {
                                        templategeneratorData.exportData.docs[pidIndex][pageRefIndex].rows[rowIndex].columns[columnIndex] = {
                                            'width': column.width,
                                            'elements': []
                                        };
                                        // Cells in the column
                                        $.each(column.elements, function(cellIndex, cell) {
                                            if ($.isPlainObject(cell)) {
                                                refIndex += 1;
                                                var cellRef = '${refid}' + refIndex;
                                                templategeneratorData.exportData.docs[pidIndex][pageRefIndex].rows[rowIndex].columns[columnIndex].elements[cellIndex] = {
                                                    'id': cellRef,
                                                    'type': cell.type
                                                };
                                                if (templategeneratorData.pages[index].pageData[pageRef][cell.id]) {
                                                    templategeneratorData.exportData.docs[pidIndex][pageRefIndex][cellRef] = {};
                                                    templategeneratorData.exportData.docs[pidIndex][pageRefIndex][cellRef][cell.type] = {};
                                                    var thisWidgetData = sakai.api.Server.removeServerCreatedObjects(templategeneratorData.pages[index].pageData[pageRef][cell.id][cell.type], '_');
                                                    $.extend(templategeneratorData.exportData.docs[pidIndex][pageRefIndex][cellRef][cell.type], thisWidgetData);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });

                        refIndex += 1;
                    });
                });

                templategeneratorData.output = JSON.stringify(templategeneratorData.exportData, null, 4);
                templategeneratorData.output = templategeneratorData.output.replace(/\\/g, '');

                createTemplateFile();
            }
        };

        var createTemplateFile = function() {
            var body = '--AAAAA\r\n';
            body = body + 'Content-Disposition: form-data; name=\'*\'; filename="' + templategeneratorData.exportData.id + '.txt" \r\n';
            body = body + 'Content-Type: text/plain \r\n';
            body = body + 'Content-Transfer-Encoding: binary\r\n\r\n';
            body = body + templategeneratorData.output + '\r\n';
            body = body + '--AAAAA--\r\n';

            $.ajax({
                url : '/system/pool/createfile',
                data : body,
                type : 'POST',
                beforeSend : function(xmlReq) {
                    xmlReq.setRequestHeader('Content-type', 'multipart/form-data; boundary=AAAAA');
                },
                success : function(data) {
                    var fileData = $.parseJSON(data);
                    fileData = fileData[templategeneratorData.exportData.id + '.txt'];

                    // Set the permissions of the file to private
                    sakai.api.Content.setFilePermissions([{
                        'hashpath' : fileData.poolId,
                        'permissions' : 'private'
                    }], function() {
                        // Remove the file from the user's library and move it to the admin user
                        $.ajax({
                            url : '/p/' + fileData.poolId + '.members.json',
                            type : 'POST',
                            data : {
                                ':manager' : sakai.widgets.templategenerator.defaultConfiguration.templategenerator.targetUser
                            },
                            success : function() {
                                $.ajax({
                                    url : '/p/' + fileData.poolId + '.members.json',
                                    type : 'POST',
                                    data : {
                                        ':manager@Delete' : sakai.data.me.user.userid
                                    },
                                    success : function() {

                                        // Get the link to our generated file
                                        var filePath = 'http://' + window.location.host + '/p/' + fileData.poolId + '/' + fileData.item['sakai:pooled-content-file-name'];

                                        // Sends a link with the template file to the admin user
                                        var userDisplayName = sakai.api.User.getDisplayName(sakai.data.me.profile);
                                        var msg = sakai.api.Util.TemplateRenderer('templategenerator_admin_message_template', {
                                            'system': sakai.api.i18n.getValueForKey('SAKAI'),
                                            'user': userDisplayName
                                        });
                                        sakai.api.Communication.sendMessage(sakai.widgets.templategenerator.defaultConfiguration.templategenerator.targetUser,
                                            sakai.data.me,
                                            userDisplayName + ' ' + sakai.api.i18n.getValueForKey('TEMPLATEGENERATOR_ADMIN_MESSAGE_SUBJECT', 'templategenerator'), msg + '\n\n' + filePath, 'message', false, handleSentMessage, true, 'new_message');

                                        // Sends a message to the user that created the template
                                        sakai.api.Communication.sendMessage(sakai.data.me.user.userid, sakai.data.me, sakai.api.i18n.getValueForKey('TEMPLATEGENERATOR_USER_MESSAGE_SUBJECT', 'templategenerator'), sakai.api.i18n.getValueForKey('TEMPLATEGENERATOR_USER_MESSAGE', 'templategenerator'), 'message', false, null, true, 'new_message');
                                    },
                                    error : function() {
                                        sakai.api.Util.notification.show('', sakai.api.i18n.getValueForKey('TEMPLATEGENERATOR_DELETE_FILE_ERROR', 'templategenerator'), sakai.api.Util.notification.type.INFORMATION);
                                        sakai.api.Util.Modal.close($templategeneratorDialog);
                                    }
                                });
                            },
                            error : function() {
                                sakai.api.Util.notification.show('', sakai.api.i18n.getValueForKey('TEMPLATEGENERATOR_PERMISSION_ERROR', 'templategenerator'), sakai.api.Util.notification.type.INFORMATION);
                                sakai.api.Util.Modal.close($templategeneratorDialog);
                            }
                        });
                    });
                },
                error : function(error) {
                    sakai.api.Util.notification.show('', sakai.api.i18n.getValueForKey('TEMPLATEGENERATOR_FILE_ERROR', 'templategenerator'), sakai.api.Util.notification.type.INFORMATION);
                    sakai.api.Util.Modal.close($templategeneratorDialog);
                }
            });
        };

        /**
         * Retrieve all the data from the server and prepare for the templateGenerating process
         */
        var getTemplateData = function(callback) {
            templategeneratorData.templateName = sakai_global.group.groupData.name;
            templategeneratorData.docstructureUrl = '~' + templategeneratorData.templateName + '/docstructure.infinity.json';
            templategeneratorData.rolesUrl = '/system/userManager/group/' + templategeneratorData.templateName + '.infinity.json';
            $templategeneratorTitle.val(templategeneratorData.templateName);

            var batchRequests = [];
            batchRequests.push({
                'url' : templategeneratorData.docstructureUrl,
                'method' : 'GET'
            });
            batchRequests.push({
                'url' : templategeneratorData.rolesUrl,
                'method' : 'GET'
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
                            'url' : '/p/' + docstructureElement._pid + '.infinity.json',
                            'method' : 'GET'
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

                                templategeneratorData.pages.push(sakai.api.Server.cleanUpSakaiDocObject(page));
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
                    }, false);
                    // 2. Roles
                    var roleData = $.parseJSON(data.results[1].body);
                    templategeneratorData.roles.roleData = $.parseJSON(roleData.properties['sakai:roles']);
                    templategeneratorData.roles.joinRole = roleData.properties['sakai:joinRole'];
                    templategeneratorData.roles.creatorRole = roleData.properties['sakai:creatorRole'];

                } else {
                    if ( $.isFunction( callback ) ) {
                        callback( false );
                    }
                    sakai.api.Util.notification.show('', sakai.api.i18n.getValueForKey('TEMPLATEGENERATOR_LOAD_ERROR', 'templategenerator'), sakai.api.Util.notification.type.INFORMATION);
                }
            });
        };

        /**
         * Initializes the template generator
         */
        var init = function() {
            $templategeneratorExportButton.removeAttr('disabled');
            templategeneratorData.templatesLoaded = false;
            getTemplateData(function(success) {
                templategeneratorData.templatesLoaded = true;
            });
            sakai.api.Util.Modal.open($templategeneratorDialog);
        };
        bindEvents();

        $(window).on('init.templategenerator.sakai', function(e) {
            init();
        });
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('templategenerator');
});
