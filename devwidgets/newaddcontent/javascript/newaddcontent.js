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
/*
 * Dependencies
 *
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 */
/*global $ */

require(['jquery', 'sakai/sakai.api.core', 'underscore', 'jquery-fileupload', 'jquery-iframe-transport', 'jquery-pager'], function($, sakai, _) {

    /**
     * @name sakai_global.newaddcontent
     *
     * @class newaddcontent
     *
     * @description
     * Initialize the add content widget - This widget adds content to a site
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.newaddcontent = function(tuid, showSettings) {

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var $newaddcontentContainer = $('#newaddcontent_container');
        var $newaddcontentContainerNewItem = $('#newaddcontent_container_newitem');
        var $newaddcontentContainerSelectedItemsContainer = $('#newaddcontent_container_selecteditems_container');
        var $newaddcontentSelecteditemsEditDataContainer = $('#newaddcontent_selecteditems_edit_data_container');
        var newaddcontentSelecteditemsEditDataContainer = '#newaddcontent_selecteditems_edit_data_container';
        var $newaddcontentSelectedItemsEditPermissionsContainer = $('#newaddcontent_selecteditems_edit_permissions_container');
        var newaddcontentSelectedItemsEditPermissionsContainer = '#newaddcontent_selecteditems_edit_permissions_container';
        var $newaddcontentNewItemContainer = $('.newaddcontent_newitem_container');

        // Templates
        var newaddcontentUploadContentTemplate = '#newaddcontent_upload_content_template';
        var newaddcontentAddDocumentTemplate = '#newaddcontent_add_document_template';
        var newaddcontentExistingItemsListContainerList = '#newaddcontent_existingitems_list_container_list';
        var newaddcontentAddLinkTemplate = '#newaddcontent_add_link_template';
        var newaddcontentAddExistingTemplate = '#newaddcontent_add_existing_template';
        var newaddcontentSelectedItemsTemplate = 'newaddcontent_selecteditems_template';
        var newaddcontentSelectedItemsEditPermissionsTemplates = 'newaddcontent_selecteditems_edit_permissions_template';
        var newaddcontentSelectedItemsEditDataTemplate = 'newaddcontent_selecteditems_edit_data_template';
        var newaddcontentExistingItemsTemplate = 'newaddcontent_existingitems_template';

        // Elements
        var $newaddcontentContainerLHChoiceItem = $('.newaddcontent_container_lhchoice_item');
        var newaddcontentContainerLHChoiceSelectedSubitem = '.newaddcontent_container_lhchoice_selected_subitem';
        var $newaddcontentContainerLHChoiceSubItem = $('.newaddcontent_container_lhchoice_subitem');
        var $newaddcontentContainerNewItemAddToList = $('.newaddcontent_container_newitem_add_to_list');
        var newaddcontentContainerStartUploadButton = '.newaddcontent_container_start_upload';
        var newaddcontentSelectedItemsRemove = '.newaddcontent_selecteditems_remove';
        var newaddcontentSelectedItemsActionsEdit = '.newaddcontent_selecteditems_actions_edit';
        var newaddcontentSelectedItemsActionsPermissions = '.newaddcontent_selecteditems_actions_permissions';
        var newaddcontentSelectedItemsEditDataClose = '.newaddcontent_selecteditems_edit_data_close';
        var newaddcontentContainerNewItemSaveChanges = '.newaddcontent_container_newitem_save_changes';
        var newaddcontentSelectedItemsEditIndex = '.newaddcontent_selecteditems_edit_index';
        var $newaddcontentContainerNewItemRaquoRight = $('#newaddcontent_container_newitem_raquo_right');
        var $newaddcontentExistingItemsSearch = $('.newaddcontent_existingitems_search');
        var newaddcontentAddLinkURL = '#newaddcontent_add_link_url';
        var newaddcontentAddLinkTitle = '#newaddcontent_add_link_title';
        var newaddcontentAddLinkDescription = '#newaddcontent_add_link_description';
        var newaddcontentAddLinkTags = '#newaddcontent_add_link_tags';
        var newaddcontentUploadContentOriginalTitle = '.newaddcontent_upload_content_originaltitle';
        var newaddcontentUploadContentTitle = '#newaddcontent_upload_content_title';
        var newaddcontentUploadContentDescription = '#newaddcontent_upload_content_description';
        var newaddcontentUploadContentTags = '#newaddcontent_upload_content_tags';
        var newaddcontentUploadContentPermissions = '#newaddcontent_upload_content_permissions';
        var newaddcontentAddDocumentTitle = '#newaddcontent_add_document_title';
        var newaddcontentAddDocumentPermissions = '#newaddcontent_add_document_permissions';
        var newaddcontentAddDocumentDescription = '#newaddcontent_add_document_description';
        var newaddcontentAddDocumentTags = '#newaddcontent_add_document_tags';
        var newaddcontentExistingItemsListContainerListItemIcon = '.newaddcontent_existingitems_list_container_list_item_icon';
        var newaddcontentExistingItemsListContainerActionsSort = '#newaddcontent_existingitems_list_container_actions_sort';
        var newaddcontentExistingItemsListContainerCheckboxes = '#newaddcontent_existingitems_list_container input[type=\'checkbox\']';
        var newaddcontentSelectedItemsEditDataTitle = '#newaddcontent_selecteditems_edit_data_title';
        var newaddcontentSelectedItemsEditDataDescription = ' #newaddcontent_selecteditems_edit_data_description';
        var newaddcontentSelectedItemsEditDataTags = ' #newaddcontent_selecteditems_edit_data_tags';
        var newaddcontentSelectedItemsEditPermissionsPermissions = '#newaddcontent_selecteditems_edit_permissions_permissions';
        var newaddcontentSelectedItemsEditPermissionsCopyright = '#newaddcontent_selecteditems_edit_permissions_copyright';
        var newaddcontentUploadContentFields = '#newaddcontent_upload_content_fields';
        var newaddcontentSaveTo = '#newaddcontent_saveto';
        var newaddcontentAddExistingSearchButton = '#newaddcontent_add_existing_template .s3d-search-button';
        var newaddcontentSelectedItemsEditDataForm = '#newaddcontent_selecteditems_edit_data_form';

        // Classes
        var newaddcontentContainerLHChoiceSelectedItem = 'newaddcontent_container_lhchoice_selected_item';
        var newaddcontentContainerLHChoiceItemClass = 'newaddcontent_container_lhchoice_item';
        var newaddcontentContainerNewItemExtraRoundedBorderClass = 'newaddcontent_container_newitem_extraroundedborder';
        var newaddcontentContainerLHChoiceSelectedSubitemClass = 'newaddcontent_container_lhchoice_selected_subitem';
        var newaddcontentContainerNewItemRaquoRightDocumentsposition = 'newaddcontent_container_newitem_raquo_right_documentsposition';
        var newaddcontentContainerNewItemAddToListDocumentsposition = 'newaddcontent_container_newitem_add_to_list_documentsposition';
        var newaddcontentContainerNewItemAddToListExistingContentposition = 'newaddcontent_container_newitem_add_to_list_existingcontentposition';
        var newaddcontentContainerNewItemAddToListUploadNewContent = 'newaddcontent_container_newitem_add_to_list_upload_new_content';
        var newaddcontentContainerNewItemAddToListAddLink = 'newaddcontent_container_newitem_add_to_list_add_link';
        var newaddcontentExistingItemsListContainerDisabledListItem = 'newaddcontent_existingitems_list_container_disabled_list_item';

        // List Variables
        var itemsToUpload = [];
        var itemsUploaded = 0;
        var brandNewContent = {};
        var allNewContent = [];
        var lastUpload = [];
        var existingAdded = [];
        var libraryToUploadTo = '';
        // Keep track of number of files in the upload list selected by browsing the OS
        // This number will later be used to check against the multifile list of uploads to avoid bug (https://jira.sakaiproject.org/browse/SAKIII-3269)
        var numberOfBrowsedFiles = 0;
        var $autoSuggestElt = false,
            $autoSuggestListCatElt = false,
            autoSuggestElts = {},
            $editAutoSuggestElt = false,
            $editAutoSuggestListCatElt = false;

        // Paths
        var uploadPath = '/system/pool/createfile';

        // Forms
        var $newaddcontentUploadContentForm = $('#newaddcontent_upload_content_form');
        var newAddContentForm = '.newaddcontent_form';
        var newaddcontentAddLinkForm = '#newaddcontent_add_link_form';
        var $newaddcontentAddLinkForm = $('#newaddcontent_add_link_form');
        var newaddcontentExistingContentForm = '#newaddcontent_existing_content_form';
        var newaddcontentAddDocumentForm = '#newaddcontent_add_document_form';
        var newaddcontentExistingCheckAll = '#newaddcontent_existingitems_list_container_actions_checkall';

        var multifileQueueAddAllowed = true;
        var contentUploaded = false;
        var hideAfterContentUpload = false;
        var currentExistingContext = false;

        var currentSelectedLibrary = sakai.data.me.user.userid;

        // jquery fileupload related variables
        var tmpBrowsedFile = {};
        var filesList = [];
        var contentDataBatch = [];
        // IE does not support XHR file uploads so we fallback to the iframe transport for uploads
        var useIframeTransport = !$.support.xhrFileUpload && !$.support.xhrFormDataFileUpload;
        // When a file is added using the iframe transport, store the submit function
        var fileUploadForms = {};

        ////////////////////////////////
        // Get newly uploaded content //
        ////////////////////////////////

        sakai_global.newaddcontent.getNewContent = function(library) {
            var newContentLibrary = [];
            // grab all of the newly uploaded content, regardless of target library
            if (!library) {
                newContentLibrary = allNewContent;
            } else if (brandNewContent[library]) {
                newContentLibrary = brandNewContent[library];
            }
            // return a copy
            return $.merge([], newContentLibrary);
        };

        var deleteContent = function(e, paths) {
            if (paths && paths.length) {
                $.each(paths, function(i, path) {
                    $.each(allNewContent, function(j, newContent) {
                        if (newContent && newContent._path === path) {
                            allNewContent.splice(j,1);
                        }
                    });
                    $.each(brandNewContent, function(lib, items) {
                        $.each(items, function(k, item) {
                            if (item && item._path === path) {
                                items.splice(k,1);
                            }
                        });
                    });
                });
            }
        };

        /////////////////
        // ITEMS QUEUE //
        /////////////////

        /**
         * Following 4 functions enable or disable the buttons that
         *  - add items to the queue
         *  - upload items to the repository
         */
        var enableAddToQueue = function() {
            $newaddcontentContainerNewItemAddToList.removeAttr('disabled');
        };

        var disableAddToQueue = function() {
            $newaddcontentContainerNewItemAddToList.attr('disabled','disabled');
        };

        var enableStartUpload = function() {
            $(newaddcontentContainerStartUploadButton).removeAttr('disabled');
        };

        var disableStartUpload = function() {
            $(newaddcontentContainerStartUploadButton).attr('disabled','disabled');
        };

        /**
         * Checks if any content items to add are already associated with the selected library
         * @param {Function} callback Callback function
         */
        var markLibraryHasContentItems = function(callback) {
            var collectionGroupIds = [];
            // check if any items are collections
            $.each(itemsToUpload, function(index, item) {
                item.currentSelectedLibraryHasItem = false;
                if (sakai.api.Content.Collections.isCollection(item)) {
                    var collectionGroupId = sakai.api.Content.Collections.getCollectionGroupId(item);
                    collectionGroupIds.push(collectionGroupId);
                    item.collectionGroupId = collectionGroupId;
                } else if (item.type === 'existing' &&
                    ($.inArray(currentSelectedLibrary, item["sakai:pooled-content-viewer"]) !== -1 ||
                    $.inArray(currentSelectedLibrary, item["sakai:pooled-content-manager"]) !== -1)) {
                    item.currentSelectedLibraryHasItem = true;
                }
            });

            sakai.api.Groups.getMembers(collectionGroupIds, function(success, data) {
                // loop through each collection group
                $.each(data, function(groupRolesKey, groupRoles) {
                    // loop through each group role
                    $.each(groupRoles, function(roleMembersKey, roleMembers) {
                        if (roleMembers.results && roleMembers.results.length) {
                            // loop through members in the role
                            $.each(roleMembers.results, function(memberKey, member) {
                                var authId = false;
                                if (member.groupid) {
                                    authId = member.groupid;
                                } else if (member.userid) {
                                    authId = member.userid;
                                }
                                // loop through each item to see if the collection is already associated with the selected library
                                $.each(itemsToUpload, function(itemsToUploadIdx, item) {
                                    if (item.collectionGroupId === groupRolesKey && currentSelectedLibrary === authId) {
                                        item.currentSelectedLibraryHasItem = true;
                                    }
                                });
                            });
                        }
                    });
                });
                if ($.isFunction(callback)) {
                    callback();
                }
            }, true);
        };

        /**
         * Checks if all the items are in the selected library already
         */
        var libraryHasAllItems = function() {
            var hasAllItems = true;
            $.each(itemsToUpload, function(i, content) {
                if (!content.currentSelectedLibraryHasItem) {
                    hasAllItems = false;
                    return false;
                }
            });
            return hasAllItems;
        };

        /**
         * Render the queue
         * @param {Boolean} append Append added content to the exisitng queue, rather than re-rending the entire content list to upload.
         * @param {Array} contentToAdd Array of objects containing data about the content to be appended to the queue
         */
        var renderQueue = function(append, contentToAppend) {
            markLibraryHasContentItems(function() {
                var templateData = {
                    'append': false,
                    'items': itemsToUpload,
                    'sakai': sakai,
                    'me': sakai.data.me,
                    'groups': sakai.api.Groups.getMemberships(sakai.data.me.groups, true),
                    'currentSelectedLibrary': currentSelectedLibrary
                };

                var $queueList = $newaddcontentContainerSelectedItemsContainer.children('ul');

                if (append && $queueList.length) {
                    templateData.append = true;
                    templateData.items = contentToAppend;
                    $queueList.append(
                        sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsTemplate, templateData)
                    );
                } else {
                    $newaddcontentContainerSelectedItemsContainer.html(
                        sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsTemplate, templateData)
                    );
                }
            });
        };

        var greyOutExistingInLibrary = function() {
            currentSelectedLibrary = $(newaddcontentSaveTo).val();
            renderQueue();

            if (itemsToUpload) {
                var disableUpload = libraryHasAllItems();
                if (disableUpload) {
                    disableStartUpload();
                } else {
                    enableStartUpload();
                }
            }
        };

        var resetQueue = function() {
            itemsToUpload = [];
            existingAdded = [];
            itemsUploaded = 0;
            disableAddToQueue();
            renderQueue();
            $('#newaddcontent_container input, #newaddcontent_container textarea').val('');
            tmpBrowsedFile = {};
            filesList = [];
            contentDataBatch = [];
        };

        /**
         * Add an item to the queue
         * @param {Object/Array} contentToAdd Object or array of objects containing data about the object to be added to the queue
         * @param {Boolean} disableRender Disable rendering of the queue.
         */
        var addContentToQueue = function(contentToAdd, disableRender, append) {
            if ($.isArray(contentToAdd)) {
                itemsToUpload = itemsToUpload.concat(contentToAdd);
            } else {
                itemsToUpload.push(contentToAdd);
            }

            disableAddToQueue();
            enableStartUpload();

            if (!disableRender) {
                renderQueue(append, contentToAdd);
            }
        };

        /**
         * Remove an item from the queue
         */
        var removeItemToAdd = function() {
            $newaddcontentSelectedItemsEditPermissionsContainer.hide();
            $newaddcontentSelecteditemsEditDataContainer.hide();

            var index = $(this).parent()[0].id.split('newaddcontent_selecteditems_')[1];
            var obj = itemsToUpload[index];

            var filename = obj['sakai:originaltitle'];

            if (filename) {
                // Remove item from the file upload list
                filesList = $.grep(filesList, function(val) {
                    return filename !== val.name;
                });
            }

            switch (obj.type) {
                case 'content':
                    var $found = $('*:contains(\'' + obj.originaltitle + '\')');
                    $found.last().prev('a').click();
                    // If the user removes an item that was selected through browsing the OS reduce the file count to avoid bug (https://jira.sakaiproject.org/browse/SAKIII-3269)
                    if (obj.origin === 'user') {
                        numberOfBrowsedFiles--;
                    }
                    break;
                case 'existing':
                    var $existing = $('input#' + obj['_path']);
                    $existing.removeAttr('disabled');
                    $existing.removeAttr('checked');
                    $existing.parent().removeClass(newaddcontentExistingItemsListContainerDisabledListItem);
                    break;
            }

            itemsToUpload.splice(index,1);

            if (!itemsToUpload.length) {
                disableStartUpload();
            } else {
                var disableUpload = libraryHasAllItems();
                if (disableUpload) {
                    disableStartUpload();
                }
            }

            renderQueue();
        };

        /**
         * Construct an item to add to the queue
         * Depending on the type of the item to add construct a different object
         */
        var constructItemToAdd = function() {
            var uniqueId = sakai.api.Util.generateWidgetId();
            var tags = sakai.api.Util.AutoSuggest.getTagsAndCategories($autoSuggestElt, true);
            var $thisForm = $(this).parents($newaddcontentNewItemContainer).children(newAddContentForm);
            if ($(this).attr('id') === 'newaddcontent_container_newitem_raquo_right') {
                $thisForm = $(this).prev().children(':visible').find(newAddContentForm);
            }

            switch ($thisForm.attr('id')) {

                //////////////////////////
                // Uploading a new file //
                //////////////////////////

                case 'newaddcontent_upload_content_form':
                    var originalTitle = $thisForm.find(newaddcontentUploadContentOriginalTitle)[0].id;

                    // Calculate the file extension
                    var splitOnDot = originalTitle.split('.');
                    var contentObj = {
                        'sakai:pooled-content-file-name': $thisForm.find(newaddcontentUploadContentTitle).val(),
                        'sakai:description': $thisForm.find(newaddcontentUploadContentDescription).val(),
                        'sakai:permissions': $thisForm.find(newaddcontentUploadContentPermissions).val(),
                        'sakai:copyright': $('#newaddcontent_upload_content_copyright').val(),
                        'sakai:originaltitle': originalTitle,
                        'sakai:tags': tags,
                        'sakai:fileextension': splitOnDot[splitOnDot.length - 1],
                        'css_class': sakai.config.MimeTypes[sakai.config.Extensions[(originalTitle).slice(originalTitle.lastIndexOf('.') + 1, originalTitle.length).toLowerCase()] || 'other'].cssClass || 's3d-icon-unknown',
                        'type': 'content',
                        'origin':'user' // 'origin' tells Sakai that this file was selected from the users hard drive
                    };
                    // Store the temporary browsed file in the upload array
                    filesList.push(tmpBrowsedFile);
                    addContentToQueue(contentObj);
                    multifileQueueAddAllowed = true;
                    $thisForm.find(newaddcontentUploadContentTitle + ', ' + newaddcontentUploadContentDescription + ', ' + newaddcontentUploadContentTags).val('');
                    // Increase the number of files that the user browsed for and added to the list
                    numberOfBrowsedFiles++;
                    break;

                ///////////////////
                // Adding a link //
                ///////////////////

                case 'newaddcontent_add_link_form':
                    var linkObj = {
                        'sakai:pooled-content-url': $thisForm.find(newaddcontentAddLinkURL).val(),
                        'sakai:pooled-content-file-name': $thisForm.find(newaddcontentAddLinkTitle).val() || $thisForm.find(newaddcontentAddLinkURL).val(),
                        'sakai:description': $thisForm.find(newaddcontentAddLinkDescription).val(),
                        'sakai:tags': tags,
                        'sakai:permissions': sakai.config.Permissions.Links.defaultaccess,
                        'sakai:copyright': sakai.config.Permissions.Copyright.defaults['links'],
                        'css_class': 's3d-icon-url',
                        'type':'link'
                    };
                    addContentToQueue(linkObj);
                    $thisForm[0].reset();
                    break;

                /////////////////////////////
                // Creating a new document //
                /////////////////////////////

                case 'newaddcontent_add_document_form':
                    if ($thisForm.valid()) {
                        var documentObj = {
                            'sakai:pooled-content-file-name': $thisForm.find(newaddcontentAddDocumentTitle).val(),
                            'sakai:permissions': $thisForm.find(newaddcontentAddDocumentPermissions).val(),
                            'sakai:description': $thisForm.find(newaddcontentAddDocumentDescription).val(),
                            'sakai:tags': tags,
                            'sakai:copyright': sakai.config.Permissions.Copyright.defaults['sakaidocs'],
                            'css_class': 's3d-icon-sakaidoc',
                            'type': 'document'
                        };
                        addContentToQueue(documentObj);
                        $thisForm[0].reset();
                    }
                    break;

                ///////////////////////////////
                // Re-using existing content //
                ///////////////////////////////

                case 'newaddcontent_existing_content_form':
                    var contentToAdd = [];
                    $.each($thisForm.find('.newaddcontent_existingitems_select_checkbox:checked'), function(index, item) {
                        if (!$(item).is(':disabled')) {
                            var viewers = [];
                            if ($(item).attr('data-sakai-pooled-content-viewer')) {
                                viewers = ('' + $(item).attr('data-sakai-pooled-content-viewer')).split(',');
                            }
                            var managers = [];
                            if ($(item).attr('data-sakai-pooled-content-manager')) {
                                managers = ('' + $(item).attr('data-sakai-pooled-content-manager')).split(',');
                            }
                            var contentObj = {
                                'sakai:pooled-content-file-name': $(item).next().text(),
                                'sakai:pooled-content-viewer': viewers,
                                'sakai:pooled-content-manager': managers,
                                '_path': item.id,
                                '_mimeType': $(item).data('mimetype'),
                                'canshare': $(item).attr('data-canshare'),
                                'type': 'existing',
                                'css_class': $(item).next().children(newaddcontentExistingItemsListContainerListItemIcon)[0].id
                            };
                            contentToAdd.push(contentObj);
                            $(item).attr('disabled', 'disabled');
                            $(item).parent().addClass(newaddcontentExistingItemsListContainerDisabledListItem);
                        }
                    });
                    addContentToQueue(contentToAdd, false, true);
                    break;

            }
            sakai.api.Util.AutoSuggest.reset( $autoSuggestElt );
            sakai.api.Util.AutoSuggest.setupTagAndCategoryAutosuggest( $autoSuggestElt, null, $autoSuggestListCatElt );
        };

        ////////////////////
        // D&D'ing a file //
        ////////////////////

       /**
        * This function is invoken when a file is dropped from the desktop into
        * the collection panel. The file is added to the list of items to upload.
        * @param {Object} file    File that has been dropped in from the desktop
        */
       var fileDropped = function(file) {
            filesList.push(file);
            var extension = file.name.split('.');
            extension = extension[extension.length - 1];
            var contentObj = {
                'sakai:originaltitle': file.name,
                'sakai:fileextension': extension,
                'sakai:pooled-content-file-name': file.name,
                'sakai:description': '',
                'sakai:tags': '',
                'sakai:permissions': sakai.config.Permissions.Content.defaultaccess,
                'sakai:copyright': sakai.config.Permissions.Copyright.defaults['content'],
                'css_class': sakai.api.Content.getMimeTypeData(file.type).cssClass,
                'type': 'content',
                'fileReader': file
            };
            // SAKIII-4264 - we need to disable the renderQueue function in here
            // so we don't get an unresponsive script error in Firefox
            addContentToQueue(contentObj, true);
        };

        ////////////////////////////////////////////////
        // Edit details and Add permissions pop-overs //
        ////////////////////////////////////////////////

        /**
         * Show the pop up to enable the user to edit the permissions of a file in queue (permissions and copyright)
         */
        var changePermissions = function() {
            $newaddcontentSelecteditemsEditDataContainer.hide();
            var index = $(this).parents('li')[0].id.split('_')[2];
            $newaddcontentSelectedItemsEditPermissionsContainer.html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsEditPermissionsTemplates,{item: itemsToUpload[index], i:index, copyright:sakai.config.Permissions.Copyright, sakai:sakai}));
            $newaddcontentSelectedItemsEditPermissionsContainer.show();
            $newaddcontentSelectedItemsEditPermissionsContainer.css('left', $(this).parents('li').position().left + 'px');
            $newaddcontentSelectedItemsEditPermissionsContainer.css('top', $(this).parents('li').position().top + 40 + 'px');
        };

        /**
         * Show the pop up to enable the user to edit the data of a file in queue (description, tags and title)
         */
        var editData = function() {
            $newaddcontentSelectedItemsEditPermissionsContainer.hide();
            var index = $(this).parents('li')[0].id.split('_')[2];
            $newaddcontentSelecteditemsEditDataContainer.html(sakai.api.Util.TemplateRenderer(newaddcontentSelectedItemsEditDataTemplate,{item: itemsToUpload[index], i:index}));
            $newaddcontentSelecteditemsEditDataContainer.show();
            $newaddcontentSelecteditemsEditDataContainer.css('left', $(this).parents('li').position().left + 'px');
            $newaddcontentSelecteditemsEditDataContainer.css('top', $(this).parents('li').position().top + 40 + 'px');

            var editValidateOpts = {
                onclick: true,
                onkeyup: function(element) {
                    $(element).valid();
                },
                onfocusout: true,
                success: function() {
                    $(newaddcontentContainerNewItemSaveChanges).removeAttr('disabled');
                },
                error: function() {
                    $(newaddcontentContainerNewItemSaveChanges).attr('disabled','disabled');
                }
            };

            sakai.api.Util.Forms.validate($(newaddcontentSelectedItemsEditDataForm), editValidateOpts, true);
            $editAutoSuggestElt = $( '#newaddcontent_selecteditems_edit_data_tags:visible', $newaddcontentSelecteditemsEditDataContainer );
            $editAutoSuggestListCatElt = $( '.list_categories', $newaddcontentSelecteditemsEditDataContainer );
            sakai.api.Util.AutoSuggest.setupTagAndCategoryAutosuggest( $editAutoSuggestElt, null, $editAutoSuggestListCatElt, itemsToUpload[index]['sakai:tags'] );
        };

        /**
         * Close the edit popup
         */
        var closeEditData = function() {
            $(this).parent().parent().hide();
        };

        /**
         * Save the changes made to a file in the queue
         */
        var saveEdit = function() {
            var index = $( newaddcontentSelectedItemsEditIndex ).attr( 'id' );
            if ( $newaddcontentSelecteditemsEditDataContainer.is( ':visible' ) ) {
                itemsToUpload[index]['sakai:pooled-content-file-name'] = $(newaddcontentSelecteditemsEditDataContainer + ' ' + newaddcontentSelectedItemsEditDataTitle).val();
                itemsToUpload[index]['sakai:description'] = $(newaddcontentSelecteditemsEditDataContainer + ' ' + newaddcontentSelectedItemsEditDataDescription).val();
                itemsToUpload[index]['sakai:tags'] = sakai.api.Util.AutoSuggest.getTagsAndCategories( $editAutoSuggestElt, true );
            } else {
                itemsToUpload[index]['sakai:permissions'] = $(newaddcontentSelectedItemsEditPermissionsContainer + ' ' + newaddcontentSelectedItemsEditPermissionsPermissions).val();
                itemsToUpload[index]['sakai:copyright'] = $(newaddcontentSelectedItemsEditPermissionsContainer + ' ' + newaddcontentSelectedItemsEditPermissionsCopyright).val();
            }
            $(this).parent().parent().hide();
            renderQueue();
        };

        var uncheckCheckboxes = function() {
            // We need to remove all the other checkboxes first in order to avoid a lag
            $(newaddcontentExistingItemsListContainerCheckboxes).removeAttr('checked');
            // Uncheck the check all checkbox
            $(newaddcontentExistingCheckAll).removeAttr('checked');
        };


        ///////////////////////
        // UPLOADING ACTIONS //
        ///////////////////////

        /**
         * Check if all items have been uploaded
         */
        var checkUploadCompleted = function(files, contentObj) {
            itemsUploaded++;
            if (itemsToUpload.length === itemsUploaded) {
                setDataOnContent(function() {
                    sakai.data.me.user.properties.contentCount += itemsUploaded - existingAdded.length;
                    var tmpItemsAdded = $.extend(true, [], existingAdded);
                    var itemsAdded = [];
                    $.merge(tmpItemsAdded, lastUpload);
                    // SAKIII-5583 Filter out items that cannot be shared (and were not shared)
                    $.each(tmpItemsAdded, function(index, item) {
                        if (sakai.api.Content.canCurrentUserShareContent(item)) {
                            itemsAdded.push(item);
                        }
                    });
                    $(document).trigger('done.newaddcontent.sakai', [itemsAdded, libraryToUploadTo]);
                    // If adding to a group library or collection, these will also still be added to my library
                    if (libraryToUploadTo !== sakai.data.me.user.userid) {
                        brandNewContent[sakai.data.me.user.userid] = brandNewContent[sakai.data.me.user.userid] || [];
                        _.uniq($.merge(brandNewContent[sakai.data.me.user.userid], lastUpload));
                    }
                    brandNewContent[libraryToUploadTo] = brandNewContent[libraryToUploadTo] || [];
                    _.uniq($.merge(brandNewContent[libraryToUploadTo], lastUpload));
                    _.uniq($.merge(allNewContent, lastUpload));
                    lastUpload = [];
                    sakai.api.Util.Modal.close($newaddcontentContainer);
                    sakai.api.Util.progressIndicator.hideProgressIndicator();
                    var librarytitle = $(newaddcontentSaveTo + ' option:selected').text();
                    if (sakai.api.Content.Collections.isCollection(libraryToUploadTo)) {
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('COLLECTION'), sakai.api.Util.TemplateRenderer('newaddcontent_notification_collection_finished_template', {
                            collectionid: libraryToUploadTo.substring(2),
                            collectiontitle: librarytitle
                        }));
                    } else {
                        sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('LIBRARY'), sakai.api.Util.TemplateRenderer('newaddcontent_notification_finished_template', {
                            sakai: sakai,
                            me: sakai.data.me,
                            libraryid: libraryToUploadTo,
                            librarytitle: librarytitle
                        }));
                    }
                });
            }
        };

        /////////////////////////
        // Uploading new files //
        /////////////////////////

        /**
         * Do processing on uploaded files
         * @param {Object} data The data returned from the createfile service
         */
        var postFileUpload = function(data) {
            for (var i in data) {
                if (data.hasOwnProperty(i)) {
                    for (var itemToUpload = 0; itemToUpload < itemsToUpload.length; itemToUpload++) {
                        if (itemsToUpload[itemToUpload]['sakai:originaltitle'] === i) {
                            itemsToUpload[itemToUpload] = $.extend({}, data[i].item, itemsToUpload[itemToUpload]);
                            if (data[i].type === 'imscp') {
                                setIMSCPContent(itemsToUpload[itemToUpload], data[i].item);
                            } else {
                                prepareSetDataOnContent(itemsToUpload[itemToUpload]);
                            }
                        }
                    }
                }
            }
        };

        /**
         * Execute the upload
         */
        var setXhrUpload = function() {
            var jqXHR = $('#newaddcontent_file_upload').fileupload('send', {
                files: filesList,
                success: function(data) {
                    data = $.parseJSON(data);
                    var extractedData = [];
                    postFileUpload(data);
                },
                error: function() {
                    checkUploadCompleted();
                }
            });
        };

        /////////////////////
        // IMS-CP Packages //
        /////////////////////

        /**
         * Run through the content of the IMS-CP package returned by the server
         * and store the page contents in proper Sakai Doc structure
         * @param {Object} documentObj    Content object that represents the original zip file upload
         * @param {Object} fileUploadObj  Content object that was returned when uploading the zip file
         */
        var setIMSCPContent = function(documentObj, fileUploadObj) {
            // Use the filename and description provided by the package
            documentObj['sakai:pooled-content-file-name'] = fileUploadObj['sakai:pooled-content-file-name'];
            documentObj['sakai:description'] = fileUploadObj['sakai:description'];
            // Set page content for all pages in the package
            var resources = $.parseJSON(documentObj.resources);
            var content = {};
            var resourceIds = {};
            for (var i = 0; i < resources.length; i++) {
                resourceIds[i] = resources[i]._id;
                var widgetId = sakai.api.Util.generateWidgetId();
                content[resourceIds[i]] = {
                    'rows': [{
                        'id': sakai.api.Util.generateWidgetId(),
                        'columns': [{
                            'width': 1,
                            'elements': [{
                                'id': widgetId,
                                'type': 'htmlblock'
                            }]
                        }]
                    }]
                };
                content[resourceIds[i]][widgetId] = {
                    'htmlblock': {
                        'content': resources[i].page
                    }
                };
            }
            finishSakaiDoc(documentObj, content);
        };

        //////////////////////////////
        // Creating a new Sakai Doc //
        //////////////////////////////

        /**
         * Creates a Sakai document
         * @param {Number} index    Index of the current Sakai Doc in the itemsToUpload array
         */
        var createDocument = function(index) {
            var documentObj = itemsToUpload[index];
            var refID = sakai.api.Util.generateWidgetId();
            var title = documentObj['sakai:pooled-content-file-name'];
            var doc = {
                'structure0': JSON.stringify({
                    'page1': {
                        '_ref': refID,
                        '_order': 0,
                        '_title': title,
                        'main': {
                            '_ref': refID,
                            '_order': 0,
                            '_title': title
                        }
                    }
                }),
                'mimeType': 'x-sakai/document',
                'sakai:schemaversion': sakai.config.schemaVersion
            };

            $.ajax({
                url: uploadPath,
                data: doc,
                type: 'POST',
                dataType: 'json',
                success: function(data) {
                    documentObj = $.extend({}, data['_contentItem'].item, documentObj);
                    itemsToUpload[index] = documentObj;
                    var content = {};
                    content[refID] = sakai.config.defaultSakaiDocContent;
                    finishSakaiDoc(documentObj, content);
                },
                error: function(err) {
                    checkUploadCompleted();
                }
            });
        };

        /**
         * Add the page content for each of the pages in the Sakai Doc
         * @param {Object} documentObj    Content object of the ZIP file that contained the package
         * @param {Object} content        Initial page content for the IMS-CP package
         */
        var finishSakaiDoc = function(documentObj, content) {
            sakai.api.Server.saveJSON('/p/' + documentObj._path, content, function() {
                var batchRequests = [];
                for (var i in content) {
                    if (content.hasOwnProperty(i)) {
                        batchRequests.push({
                            url: '/p/' + documentObj['_path'] + '/' + i + '.save.json',
                            parameters: {
                                'sling:resourceType': 'sakai/pagecontent',
                                'sakai:pagecontent': JSON.stringify(content[i]),
                                '_charset_': 'utf-8'
                            },
                            method: 'POST'
                        });
                    }
                }
                sakai.api.Server.batch(batchRequests, function(success, response) {
                     prepareSetDataOnContent(documentObj);
                });
            });
        };

        ///////////////////
        // Adding a link //
        ///////////////////

        /**
         * Upload a link
         * @param {Number} index   Index of the current link in the itemsToUpload array
         */
        var uploadLink = function(index) {
            var linkObj = itemsToUpload[index];
            var preview = sakai.api.Content.getPreviewUrl(linkObj['sakai:pooled-content-url']);
            var link = {
                'sakai:pooled-content-url': linkObj['sakai:pooled-content-url'],
                'mimeType': 'x-sakai/link',
                'sakai:preview-url': preview.url,
                'sakai:preview-type': preview.type,
                'sakai:preview-avatar': preview.avatar
            };

            $.ajax({
                url: uploadPath,
                data: link,
                type: 'POST',
                dataType: 'JSON',
                success: function(data) {
                    linkObj = $.extend({}, data['_contentItem'].item, linkObj);
                    itemsToUpload[index] = linkObj;
                    prepareSetDataOnContent(linkObj);
                },
                error: function() {
                    checkUploadCompleted();
                }
            });
        };

        //////////////////////////////
        // General metadata setting //
        //////////////////////////////

        var prepareLibraryDataForContent = function() {
            $.each(itemsToUpload, function(index, contentObj) {
                // Add this content to the selected library
                if (libraryToUploadTo !== sakai.data.me.user.userid) {
                    contentDataBatch.push({
                        url: '/p/' + contentObj['_path'] + '.members.json',
                        parameters: {
                            ':viewer': libraryToUploadTo
                        },
                        method: 'POST'
                    });
                    // Add the selected library as a viewer to the cached results
                    contentObj['sakai:pooled-content-viewer'] = contentObj['sakai:pooled-content-viewer'] || [];
                    contentObj['sakai:pooled-content-viewer'].push(libraryToUploadTo);
                    // If we are in the context of the group, make the group managers a manager of the
                    // content as well
                    if (sakai_global.group && sakai_global.group.groupData && sakai_global.group.groupData['sakai:group-id'] === libraryToUploadTo) {
                        // We only do this if the system is configured to support this
                        if (sakai.config.Permissions.Groups.addcontentmanagers) {
                            var roles = sakai.api.Groups.getRoles(sakai_global.group.groupData);
                            for (var role in roles) {
                                if (roles.hasOwnProperty(role) && roles[role].isManagerRole) {
                                    contentDataBatch.push({
                                        url: '/p/' + contentObj['_path'] + '.members.json',
                                        parameters: {
                                            ':manager': libraryToUploadTo + '-' + roles[role].id
                                        },
                                        method: 'POST'
                                    });
                                }
                            }
                        }
                    }
                }
            });
        };

        var prepareSetDataOnContent = function(contentObj) {
            var setContent = function(obj) {
                // Set general data
                contentDataBatch.push({
                    'url': '/p/' + obj['_path'],
                    'method': 'POST',
                    'parameters': {
                        'sakai:pooled-content-file-name': obj['sakai:pooled-content-file-name'],
                        'sakai:description': obj['sakai:description'],
                        'sakai:permissions': obj['sakai:permissions'],
                        'sakai:copyright': obj['sakai:copyright'],
                        'sakai:allowcomments': 'true',
                        'sakai:showcomments': 'true',
                        'sakai:fileextension': obj['sakai:fileextension']
                    }
                });

                // Set initial version
                if (obj['_mimeType'] !== 'x-sakai/document') {
                    contentDataBatch.push({
                        'url': '/p/' + obj['_path'] + '.save.json',
                        'method': 'POST'
                    });
                }

                // Tag the content
                sakai.api.Util.tagEntity('/p/' + (obj['_path']), obj['sakai:tags'], false, function() {
                    // Set the correct file permissions
                    sakai.api.Content.setFilePermissions([{'hashpath': obj['_path'], 'permissions': obj['sakai:permissions']}], function() {
                        checkUploadCompleted();
                    });
                });
            };

            if ($.isArray(contentObj)) {
                $.each(contentObj, function(index, obj) {
                    setContent(obj);
                    lastUpload.push(obj);
                });
            } else {
                setContent(contentObj);
                lastUpload.push(contentObj);
            }
        };

        /**
         * Set extra data (title, description,...) on a piece of uploaded content
         * @param {Object} data Contains ID's returned from the server to construct the POST URL and title with
         */
        var setDataOnContent = function(callback) {
            prepareLibraryDataForContent();
            sakai.api.Server.batch(contentDataBatch, function(success, response) {
                if ($.isFunction(callback)) {
                    callback();
                }
            });

        };

        /**
         * Add an already existing item to your own library
         * @param {Object} item Item to be added to your own library
         */
        var addToLibrary = function(existingItem) {
            $.ajax({
                'url': '/p/' + existingItem['_path'] + '.json',
                'cache': false,
                'success': function(item) {
                    if (sakai.api.Content.Collections.isCollection(item)) {
                        sakai.api.Content.Collections.shareCollection(item['_path'], libraryToUploadTo, false, function() {
                            item['sakai:pooled-content-viewer'] = item['sakai:pooled-content-viewer'] || [];
                            item['sakai:pooled-content-viewer'].push(libraryToUploadTo);
                            lastUpload.push(item);
                            checkUploadCompleted(false, existingItem);
                        });
                    } else {
                        // Don't make the authorizable a viewer if it's already part of the library
                        if (!sakai.api.Content.isContentInLibrary(item, libraryToUploadTo) &&
                            (sakai.api.Content.canCurrentUserShareContent(item) ||
                            libraryToUploadTo === sakai.data.me.user.userid)) {
                            sakai.api.Content.addToLibrary(item['_path'], libraryToUploadTo, false, function() {
                                item['sakai:pooled-content-viewer'] = item['sakai:pooled-content-viewer'] || [];
                                item['sakai:pooled-content-viewer'].push(libraryToUploadTo);
                                lastUpload.push(item);
                                checkUploadCompleted(false, existingItem);
                            });
                        } else {
                            existingAdded.push(item);
                            checkUploadCompleted(false, existingItem);
                        }
                    }
                }
            });
        };

        /////////////////////////////////////////////
        // Add all collected content to the system //
        /////////////////////////////////////////////

        /**
         * Execute the upload of the files in the queue by calling the functions needed for the specific type of content
         */
        var doUpload = function() {
            sakai.api.Util.progressIndicator.showProgressIndicator(sakai.api.i18n.getValueForKey('UPLOADING_YOUR_CONTENT'), sakai.api.i18n.getValueForKey('PROCESSING_UPLOAD'));
            libraryToUploadTo = $(newaddcontentSaveTo).val();

            // If iframe transport is used we have to submit the file upload forms
            if (useIframeTransport) {
                $.each(filesList, function(i, val) {
                    if (fileUploadForms[val.name]) {
                        fileUploadForms[val.name].submit();
                    }
                });
            }

            $.each(itemsToUpload, function(index,item) {
                switch(item.type) {
                    case 'link':
                        uploadLink(index);
                        break;
                    case 'content':
                        if (!contentUploaded) {
                            if (!useIframeTransport) {
                                setXhrUpload();
                            }
                            contentUploaded = true;
                        }
                        break;
                    case 'document':
                        createDocument(index);
                        break;
                    case 'existing':
                        addToLibrary(item);
                        break;
                }
            });
        };

        /**
         * Prefill some of the extra data a file can have
         * @param {String} fileName Name of the selected file
         */
        var preFillContentFields = function(fileName) {
            if (fileName.indexOf('\\') !== -1) {
                fileName = fileName.split('\\')[fileName.split('\\').length - 1];
            }
            $(newaddcontentUploadContentFields + ' ' + newaddcontentUploadContentTitle).val(fileName);
            $(newaddcontentUploadContentFields + ' ' + newaddcontentUploadContentOriginalTitle)[0].id = fileName;
            $(newaddcontentUploadContentTitle).select();
        };


        ///////////////
        // RENDERING //
        ///////////////

        /**
         * Check if a field is valid and the button to add to the list should be enabled
         */
        var checkFieldValidToAdd = function() {
            if ($(this).attr('type') === 'text') {
                var val = $.trim($(this).val());
                if (val) {
                    enableAddToQueue();
                } else {
                    disableAddToQueue();
                }
            } else {
                if ($(newaddcontentExistingContentForm + ' input[type=checkbox]:checked:enabled').length) {
                    enableAddToQueue();
                } else {
                    disableAddToQueue();
                }
            }
        };

        /**
         * Show a selected navigation item
         * @param {Object} $selected Selected navigation item
         */
        var showSelectedItem = function($selected) {
            $newaddcontentNewItemContainer.hide();
            $selected.show();
        };

        /**
         * Show the interface to upload new content
         */
        var renderUploadNewContent = function() {
            showSelectedItem($(newaddcontentUploadContentTemplate));
            $('#newaddcontent_upload_content_copyright_container').html(sakai.api.Util.TemplateRenderer('newaddcontent_copyright_template', {
                copyright: sakai.config.Permissions.Copyright,
                copyright_default: sakai.config.Permissions.Copyright.defaults['content'],
                sakai: sakai
            }));
            if ( !autoSuggestElts[ 'new_content' ] ) {
                autoSuggestElts[ 'new_content' ] = $( newaddcontentUploadContentTags );
            }
            $autoSuggestElt = autoSuggestElts[ 'new_content' ];
            $autoSuggestListCatElt = $( '.list_categories', '#newaddcontent_upload_content_fields' );
            sakai.api.Util.AutoSuggest.setupTagAndCategoryAutosuggest( $autoSuggestElt, null, $autoSuggestListCatElt );
            $('#newaddcontent_container_lhchoice').find('a:first').focus();
        };

        /**
         * Show the interface to add a new document
         */
        var renderNewDocument = function() {
            if ($.trim($(newaddcontentAddDocumentTitle).val()) !== '') {
                enableAddToQueue();
            }
            showSelectedItem($(newaddcontentAddDocumentTemplate));

            if ( !autoSuggestElts[ 'new_document' ] ) {
                autoSuggestElts[ 'new_document' ] = $( newaddcontentAddDocumentTags );
            }
            $autoSuggestElt = autoSuggestElts[ 'new_document' ];
            $autoSuggestListCatElt = $( '.list_categories', '#newaddcontent_add_document_form' );
            sakai.api.Util.AutoSuggest.setupTagAndCategoryAutosuggest( $autoSuggestElt, null, $autoSuggestListCatElt );
        };

        var searchPaging = function(pagenum) {
            prepareContentSearch(pagenum);
        };

        var searchAndRenderExistingContent = function($container, q, pagenum) {
            pagenum = pagenum || 1;
            var searchURL = '';
            var sortOrder = $(newaddcontentExistingItemsListContainerActionsSort + ' option:selected').attr('data-sort-order');
            var sortOn = $(newaddcontentExistingItemsListContainerActionsSort + ' option:selected').attr('data-sort-on');
            switch(currentExistingContext) {
                case 'everything':
                    if (!q || (q === '*')) {
                        searchURL = '/var/search/pool/all-all.infinity.json?items=10&page=' + (pagenum - 1) + '&sortOrder=' + sortOrder + '&sortOn=' + sortOn;
                    } else {
                        searchURL = '/var/search/pool/all.infinity.json?items=10&page=' + (pagenum - 1) + '&sortOrder=' + sortOrder + '&sortOn=' + sortOn + '&q=' + q;
                    }
                    break;
                case 'my_library':
                    searchURL = sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER + '?userid=' + sakai.data.me.user.userid + '&items=10&page=' + (pagenum - 1) + '&sortOrder=' + sortOrder + '&sortOn=' + sortOn + '&q=' + q;
                    break;
            }
            uncheckCheckboxes();
            $.ajax({
                url: searchURL,
                type: 'GET',
                success: function(data) {
                    var existingIDs = [];
                    $.each(itemsToUpload, function(index, item) {
                        if (item.type === 'existing') {
                            existingIDs.push(item['_path']);
                        }
                    });
                    if (data && data.results) {
                        existingItems = data.results;
                    }
                    $container.html(sakai.api.Util.TemplateRenderer(newaddcontentExistingItemsTemplate, {'data': data, 'query':q, 'sakai':sakai, 'queue':existingIDs, 'context':currentExistingContext}));
                    // Disable the add button
                    disableAddToQueue();
                    var numberOfPages = Math.ceil(data.total / 10);
                    $('#newaddcontent_existingitems_paging').pager({
                        pagenumber: pagenum,
                        pagecount: numberOfPages,
                        buttonClickCallback: searchPaging
                    });
                    if (numberOfPages > 1) {
                        $('#newaddcontent_existingitems_paging').show();
                    } else {
                        $('#newaddcontent_existingitems_paging').hide();
                    }
                },
                error: function(err) {

                }
            });
        };

        /**
         * Decide what context to render to add existing content
         * @param {Object} context The context that will help decide what to render
         */
        var renderExistingContent = function(q, pagenum) {
            if (!q) {
                q = '';
            }
            switch(currentExistingContext) {
                case 'everything':
                    showSelectedItem($(newaddcontentAddExistingTemplate));
                    searchAndRenderExistingContent($(newaddcontentExistingItemsListContainerList), q, pagenum);
                    break;
                case 'my_library':
                    showSelectedItem($(newaddcontentAddExistingTemplate));
                    searchAndRenderExistingContent($(newaddcontentExistingItemsListContainerList), q, pagenum);
                    break;
            }
        };

        /**
         * Show the interface to add a link
         */
        var renderAddLink = function() {
            if ($.trim($(newaddcontentAddLinkURL).val()) !== '') {
                enableAddToQueue();
            }
            showSelectedItem($(newaddcontentAddLinkTemplate));

            if ( !autoSuggestElts[ 'new_link' ] ) {
                autoSuggestElts[ 'new_link' ] = $( newaddcontentAddLinkTags );
            }

            $autoSuggestElt = autoSuggestElts[ 'new_link' ];
            $autoSuggestListCatElt = $( '.list_categories', '#newaddcontent_add_link_form' );
            sakai.api.Util.AutoSuggest.setupTagAndCategoryAutosuggest( $autoSuggestElt, null, $autoSuggestListCatElt );
        };

        ////////////////////
        // CONTENT SEARCH //
        ////////////////////

        /**
         * Check/uncheck all of the displayed results
         */
        var checkUncheckAll = function() {
            if ($(newaddcontentExistingCheckAll).is(':checked')) {
                $('.newaddcontent_existingitems_select_checkbox:enabled', $(newaddcontentExistingItemsListContainerList)).attr('checked', 'checked');
            } else {
                $('.newaddcontent_existingitems_select_checkbox:enabled', $(newaddcontentExistingItemsListContainerList)).removeAttr('checked');
            }
            checkFieldValidToAdd();
        };

        /**
         * Prepare and call the function to render existing content in a list
         */
        var prepareContentSearch = function(pagenum) {
            var query = $.trim($newaddcontentExistingItemsSearch.val());
            renderExistingContent(query, pagenum);
        };

        /**
         * Do a search on existing content
         */
        var searchExistingContent = function(ev) {
            if (ev.keyCode === 13 || ev.currentTarget.id === 'newaddcontent_existing_search_button') {
                prepareContentSearch(1);
            }
        };

        ////////////////
        // NAVIGATION //
        ////////////////

        /**
         * Reset the menu to its original state
         */
        var resetMenu = function() {
            $newaddcontentContainerNewItem.removeClass(newaddcontentContainerNewItemExtraRoundedBorderClass);
            $newaddcontentContainerLHChoiceItem.removeClass(newaddcontentContainerLHChoiceSelectedItem);
            $('#newaddcontent_upload_content').addClass(newaddcontentContainerLHChoiceSelectedItem);

            if (sakai.config.Permissions.Content.defaultaccess) {
                $('#newaddcontent_upload_content_permissions [value=' + sakai.config.Permissions.Content.defaultaccess + ']').attr('selected', 'selected');
            }
            if (sakai.config.Permissions.Documents.defaultaccess) {
                $('#newaddcontent_add_document_permissions [value=' + sakai.config.Permissions.Documents.defaultaccess + ']').attr('selected', 'selected');
            }
        };

        /**
         * Decide what to render when the menu is navigated
         * Add/remove some CSS classes to show/hide rounded borders etc.
         */
        var navigateMenu = function() {
            disableAddToQueue();
            $newaddcontentContainerNewItemRaquoRight.removeClass(newaddcontentContainerNewItemRaquoRightDocumentsposition);
            $newaddcontentContainerNewItemAddToList.removeClass(newaddcontentContainerNewItemAddToListDocumentsposition);
            $newaddcontentContainerNewItemAddToList.removeClass(newaddcontentContainerNewItemAddToListExistingContentposition);
            $newaddcontentContainerNewItemAddToList.removeClass(newaddcontentContainerNewItemAddToListUploadNewContent);
            $newaddcontentContainerNewItemAddToList.removeClass(newaddcontentContainerNewItemAddToListAddLink);
            if ($(this).prev().hasClass(newaddcontentContainerLHChoiceItemClass)) {
                $newaddcontentContainerNewItem.addClass(newaddcontentContainerNewItemExtraRoundedBorderClass);
            }
            else {
                $newaddcontentContainerNewItem.removeClass(newaddcontentContainerNewItemExtraRoundedBorderClass);
            }
            $newaddcontentContainerLHChoiceItem.removeClass(newaddcontentContainerLHChoiceSelectedItem);
            $(this).addClass(newaddcontentContainerLHChoiceSelectedItem);

            switch ($(this)[0].id) {
                case 'newaddcontent_upload_content':
                    renderUploadNewContent();
                    $newaddcontentContainerNewItemAddToList.addClass(newaddcontentContainerNewItemAddToListUploadNewContent);
                    break;
                case 'newaddcontent_new_document':
                    renderNewDocument();
                    $newaddcontentContainerNewItemRaquoRight.addClass(newaddcontentContainerNewItemRaquoRightDocumentsposition);
                    $newaddcontentContainerNewItemAddToList.addClass(newaddcontentContainerNewItemAddToListDocumentsposition);
                    break;
                case 'newaddcontent_add_link':
                    renderAddLink();
                    $newaddcontentContainerNewItemAddToList.addClass(newaddcontentContainerNewItemAddToListAddLink);
                    break;
                default: // No ID found on class -> subnav present
                    switch ($(this).children('ul').children(newaddcontentContainerLHChoiceSelectedSubitem)[0].id) {
                        case 'newaddcontent_existing_content_everything':
                            currentExistingContext = 'everything';
                            renderExistingContent($newaddcontentExistingItemsSearch.val());
                            $newaddcontentContainerNewItemAddToList.addClass(newaddcontentContainerNewItemAddToListExistingContentposition);
                            break;
                        case 'newaddcontent_existing_content_my_library':
                            currentExistingContext = 'my_library';
                            renderExistingContent($newaddcontentExistingItemsSearch.val());
                            $newaddcontentContainerNewItemAddToList.addClass(newaddcontentContainerNewItemAddToListExistingContentposition);
                            break;
                    }
                    break;
            }
        };

        /**
         * Executed when a subitem in the navigation has been clicked
         */
        var navigateSubItem = function() {
            $(newaddcontentContainerLHChoiceSelectedSubitem).removeClass(newaddcontentContainerLHChoiceSelectedSubitemClass);
            $(this).addClass(newaddcontentContainerLHChoiceSelectedSubitemClass);
        };

        /////////////
        // BINDING //
        /////////////

        /**
         * Remove binding on all elements
         */
        var removeBinding = function() {
            $newaddcontentContainerLHChoiceItem.off('click', navigateMenu);
            $newaddcontentContainerLHChoiceSubItem.off('click', navigateSubItem);
            $newaddcontentContainerNewItemAddToList.off('click', constructItemToAdd);
            $(newaddcontentContainerStartUploadButton).off('click', doUpload);
            $(newaddcontentSelectedItemsEditDataClose).off('click', closeEditData);
            $(newaddcontentContainerNewItemSaveChanges).off('click', saveEdit);
            $(newaddcontentSelectedItemsRemove).off('click', removeItemToAdd);
            $(newaddcontentSelectedItemsActionsPermissions).off('click', changePermissions);
            $(newaddcontentSelectedItemsActionsEdit).off('click', editData);
            $(newaddcontentExistingItemsListContainerActionsSort).off('change');
            $newaddcontentContainer.off('click', '#newaddcontent_existingitems_paging .sakai_pager button');
            $(window).off('init.deletecontent.sakai', deleteContent);
        };

        /**
         * Add binding to all elements
         */
        var addBinding = function() {
            $newaddcontentContainerLHChoiceItem.on('click', navigateMenu);
            $newaddcontentContainerLHChoiceSubItem.on('click', navigateSubItem);
            $newaddcontentContainerNewItemAddToList.on('click', constructItemToAdd);
            $(newaddcontentContainerStartUploadButton).on('click', doUpload);
            $(newaddcontentSelectedItemsEditDataClose).on('click', closeEditData);
            $(newaddcontentContainerNewItemSaveChanges).on('click', saveEdit);
            $(newaddcontentSelectedItemsRemove).on('click', removeItemToAdd);
            $(newaddcontentSelectedItemsActionsPermissions).on('click', changePermissions);
            $(newaddcontentSelectedItemsActionsEdit).on('click', editData);
            $newaddcontentExistingItemsSearch.keydown(searchExistingContent);
            $(newaddcontentAddExistingSearchButton).click(searchExistingContent);
            $(newaddcontentExistingContentForm + ' input').on('click',checkFieldValidToAdd);
            $(newaddcontentExistingCheckAll).on('change', checkUncheckAll);
            $(newaddcontentExistingItemsListContainerActionsSort).on('change', function() {searchPaging(1);});
            $(newaddcontentSaveTo).on('change', greyOutExistingInLibrary);
            $newaddcontentContainer.on('click', '#newaddcontent_existingitems_paging .sakai_pager button', function() {
                return false;
            });
            sakai.api.Util.hideOnClickOut($newaddcontentSelecteditemsEditDataContainer, newaddcontentSelectedItemsActionsEdit + ', #assignlocation_container');
            sakai.api.Util.hideOnClickOut($newaddcontentSelectedItemsEditPermissionsContainer, newaddcontentSelectedItemsActionsPermissions);

            // Initialize the validate plug-in
            var linkValidateOpts = {
                onclick: true,
                onfocusout: true,
                success: enableAddToQueue,
                error: disableAddToQueue
            };

            sakai.api.Util.Forms.validate($newaddcontentAddLinkForm, linkValidateOpts, true);

            // Need to create one validation opts object per validation
            // I tried $.extend()'ing the previous one, but the callbacks won't fire
            var documentValidateOpts = {
                onclick: true,
                onkeyup: function(element) { $(element).valid(); },
                onfocusout: true,
                success: enableAddToQueue,
                error: disableAddToQueue
            };

            sakai.api.Util.Forms.validate($(newaddcontentAddDocumentForm), documentValidateOpts, true);

            var fileuploadOptions = {
                url: uploadPath,
                sequentialUploads: true,
                singleFileUploads: false,
                dropZone: $('#newaddcontent_container_selecteditems'),
                drop: function(ev, data) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    // We only support browsers that have XMLHttpRequest Level 2
                    if (!window.FormData) {
                        return false;
                    }
                    if ($(ev.target).is($('#newaddcontent_file_upload'))) {
                        var error = false;
                        $.each(data.files, function(index, file) {
                            if (file.size > 0) {
                                fileDropped(file);
                            } else {
                                error = true;
                            }
                        });
                        if (error) {
                            sakai.api.Util.notification.show(
                                sakai.api.i18n.getValueForKey('DRAG_AND_DROP_ERROR', 'newaddcontent'),
                                sakai.api.i18n.getValueForKey('ONE_OR_MORE_DROPPED_FILES_HAS_AN_ERROR', 'newaddcontent'));
                        }
                        renderQueue();
                    }
                },
                change: function(e, data) {
                    multifileQueueAddAllowed = false;
                    preFillContentFields(data.files[0].name);
                    enableAddToQueue();
                },
                add: function(e, data) {
                    tmpBrowsedFile = data.files[0];
                    if (useIframeTransport) {
                        fileUploadForms[data.files[0].name] = data;
                    }
                }
            };

            if (useIframeTransport) {
                fileuploadOptions.done = function(e, data) {
                    var result = {};
                    // In IE the result is inserted to the iframe
                    if ($('pre', data.result).length) {
                        result = $.parseJSON($('pre', data.result).text());
                    } else {
                        result = $.parseJSON(data.result);
                    }
                    postFileUpload(result);
                };
            }

            $('#newaddcontent_file_upload').fileupload(fileuploadOptions);

            $(document).on('done.deletecontent.sakai', deleteContent);
        };

        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var setCurrentlySelectedLibrary = function() {
            if (sakai_global.group && sakai_global.group.groupId) {
                currentSelectedLibrary = sakai_global.group.groupId;
            } else if (sakai_global.content_profile && sakai_global.content_profile.content_data && sakai_global.content_profile.content_data.data &&
                sakai.api.Content.Collections.isCollection(sakai_global.content_profile.content_data.data)) {
                currentSelectedLibrary = sakai.api.Content.Collections.getCollectionGroupId(sakai_global.content_profile.content_data.data);
            }
        };

        /**
         * Initialize the modal dialog
         */
        var initializeJQM = function() {
            sakai.api.Util.Modal.setup($newaddcontentContainer, {
                modal: true,
                overlay: 20,
                zIndex: 4001,
                toTop: true,
                onHide: function(hash) {
                    uncheckCheckboxes();
                    hash.o.remove();
                    hash.w.hide();
                }
            });
            sakai.api.Util.Modal.open($newaddcontentContainer);
        };

        /**
         * Call all functions and reset all variables needed to get the widget
         * into the original startup state
         */
        var resetWidget = function() {
            removeBinding();
            resetQueue();
            resetMenu();
            disableAddToQueue();
            disableStartUpload();
            multifileQueueAddAllowed = true;
            contentUploaded = false;
            hideAfterContentUpload = false;
            numberOfBrowsedFiles = 0;
            fileUploadForms = {};
        };

        /**
         * Initialize the widget
         */
        var initialize = function() {
            setCurrentlySelectedLibrary();
            initializeJQM();
            resetWidget();
            addBinding();
            renderUploadNewContent();
        };

        ////////////
        // EVENTS //
        ////////////

        $(document).on('init.newaddcontent.sakai', initialize);
        $(document).on('click', '.sakai_add_content_overlay', initialize);

    };
    sakai.api.Widgets.widgetLoader.informOnLoad('newaddcontent');
});
