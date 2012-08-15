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

require(['jquery', 'sakai/sakai.api.core', 'underscore'], function($, sakai, _) {

    /**
     * @name sakai_global.newsharecontent
     *
     * @class newsharecontent
     *
     * @description
     * Content Share widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.newsharecontent = function(tuid, showSettings) {

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var $newsharecontentContainer = $('#newsharecontent_widget');
        var $newsharecontentCanShareContainer = $('#newsharecontent_canshare_container');
        var $newsharecontentCantShareContainer = $('#newsharecontent_cantshare_container');
        var $newsharecontentMessageContainer = $('#newsharecontent_message_container');

        // Elements
        var $newsharecontentLinkURL = $('#newsharecontent_linkurl');
        var $newsharecontentSharelist = $('#newsharecontent_sharelist');
        var $newsharecontentMessage = $('#newsharecontent_message');
        var $newsharecontentSendButton = $('#sharecontent_send_button');
        var newsharecontentListItem = '.as-selection-item';
        var newsharecontentShareListContainer = '#newsharecontent_sharelist_container';
        var $newsharecontentMessageToggle = $('label.toggletext',$newsharecontentContainer);
        var $newsharecontentMessageArrow = $('#newsharecontent_message_arrow');
        var $newsharecontentHeading = $('#newsharecontent_heading');
        var $newsharecontentAnon = $('.newsharecontent_anon_function');
        var $newsharecontentUser = $('.newsharecontent_user_function');
        var $newsharecontent_form = $('#newsharecontent_form');
        var $newsharecontentTitle = $('#newsharecontent_title');

        // Templates
        var $newsharecontentCantShareTemplate = $('#newsharecontent_cantshare_template');

        // Classes
        var newsharecontentRequiredClass = 'newsharecontent_required';

        // Content object
        var contentObj = {};


        ///////////////
        // RENDERING //
        ///////////////


        /**
         * Render the list of files that we can't share
         * @param {Object} cantShareFiles A list of all the files that we can't share
         */
        var renderCantShare = function(cantShareFiles) {
            $newsharecontentCantShareContainer.html(
                sakai.api.Util.TemplateRenderer($newsharecontentCantShareTemplate, {
                    'files': cantShareFiles
                })
            );
        };

        /**
         * Get all the files you can share with other people
         * @param {Object} files A list of all the files
         * @return {Object} A list of the files you can share with other people
         */
        var getCanShareFiles = function(files) {
            return _.filter(files, function(file) {
                return sakai.api.Content.canCurrentUserShareContent(file.body);
            });
        };

        /**
         * Add validation
         */
        var addShareValidation = function() {
            var validateOpts = {
                'methods': {
                    'requiredsuggest': {
                        'method': function(value, element) {
                            return $.trim($(element).next('input.as-values').val()).replace(/,/g, '') !== '';
                        },
                        'text': sakai.api.i18n.getValueForKey('AUTOSUGGEST_REQUIRED_ERROR')
                    }
                },
                submitHandler: doShare
            };
            sakai.api.Util.Forms.validate($newsharecontent_form, validateOpts, true);
        };

        var fillShareData = function(hash) {
            addShareValidation();

            $newsharecontentLinkURL.val(contentObj.shareUrl);

            var cantShareFiles = _.filter(contentObj.data, function(file) {
                return !sakai.api.Content.canCurrentUserShareContent(file.body);
            });
            var shareFiles = getCanShareFiles(contentObj.data);
            var filenames = sakai.api.Util.TemplateRenderer('newsharecontent_filenames_template', {
                'files': shareFiles
            });
            var shareURLs = sakai.api.Util.TemplateRenderer('newsharecontent_fileURLs_template', {
                'files': shareFiles,
                'sakai': sakai
            });
            var shareData = {
                'filename': filenames,
                'data': shareFiles,
                'path': shareURLs,
                'user': sakai.api.User.getFirstName(sakai.data.me.profile)
            };
            $newsharecontentMessage.html(sakai.api.Util.TemplateRenderer('newsharecontent_share_message_template', shareData));

            renderCantShare(cantShareFiles);

            if (shareFiles.length) {
                $newsharecontentCanShareContainer.show();
                $newsharecontentTitle.show();
            } else {
                $newsharecontentCanShareContainer.hide();
                $newsharecontentTitle.hide();
            }

            if (hash) {
                hash.w.show();
            }
            var tbx = $('#toolbox');
            if (tbx.find('a').length) {
                tbx.find('a').remove();
            }
            var svcs = {facebook: 'Facebook', twitter: 'Twitter', delicious:'Delicious', stumbleupon: 'StumbleUpon', blogger:'Blogger', wordpress:'Wordpress', google:'Google', expanded: 'More'};
            var addThisTitle ='';
            for (var s in svcs) {
                if (s==='twitter') {
                    addThisTitle = sakai.api.i18n.getValueForKey('SHARE_EXT_MSG1','newsharecontent')+shareData.filename.replace(/'/gi,'')+' '+sakai.api.i18n.getValueForKey('SHARE_EXT_MSG2','newsharecontent')+' ' +sakai.api.i18n.getValueForKey('TITLE_PLAIN');
                }
                else{
                    addThisTitle =  shareData.filename.replace(/"/gi,'')+' '+sakai.api.i18n.getValueForKey('SHARE_EXT_MSG2','newsharecontent')+' ' + sakai.api.i18n.getValueForKey('TITLE_PLAIN');
                }
                tbx.append('<a class="addthis_button_'+s+'" addthis:url="'+shareData.path+'" addthis:title="'+addThisTitle+'"></a>');
            }
            addthis.toolbox('#toolbox');
        };

        var resetWidget = function(hash) {
            $newsharecontentMessageContainer.hide();
            $newsharecontentMessageArrow.removeClass('arrow_down');
            $newsharecontentMessage.removeClass(newsharecontentRequiredClass);
            $(newsharecontentShareListContainer).removeClass(newsharecontentRequiredClass);
            sakai.api.Util.AutoSuggest.reset($newsharecontentSharelist);
            $(window).trigger('hiding.newsharecontent.sakai');
            hash.w.hide();
        };

        ///////////
        // SHARE //
        ///////////

        var getSelectedList = function() {
            var list = $('#as-values-' + tuid).val();
            // this value is a comma-delimited list
            // split it and get rid of any empty values in the array
            list = list.split(',');
            var removed = 0;
            $(list).each(function(i, val) {

               if (val === '') {
                   list.splice(i - removed, 1);
                   removed += 1;
               }
            });

            // Create list to show in the notification
            var toAddNames = [];
            $('#newsharecontent_container .as-selection-item').each(function() {
                // In IE 7 </A> is returned and in firefox </a>
                toAddNames.push($(this).html().split(/<\/[aA]?>/g)[1]);
            });
            var returnValue = {'list':list, 'toAddNames':toAddNames};

            return returnValue;
        };

        var createActivity = function(activityMessage, canShareFiles) {
            var activityData = {
                'sakai:activityMessage': activityMessage
            };
            $.each(canShareFiles, function(i, content) {
                sakai.api.Activity.createActivity('/p/' + content.body['_path'], 'content', 'default', activityData);
            });
            $(window).trigger('load.content_profile.sakai', function() {
                $(window).trigger('render.entity.sakai', ['content', contentObj]);
            });
        };

        var doShare = function(event, userlist, message, contentobj, role) {
            var userList = userlist || getSelectedList();
            var messageText = message || $.trim($newsharecontentMessage.val());
            var shareMessage = $('#newsharecontent_users_added_text').text() + ' ';

            contentObj = contentobj || contentObj;
            var canShareFiles = getCanShareFiles(contentObj.data);
            $newsharecontentMessage.removeClass(newsharecontentRequiredClass);
            $(newsharecontentShareListContainer).removeClass(newsharecontentRequiredClass);
            if (userList && userList.list && userList.list.length && messageText && canShareFiles) {
                var toAddList = userList.list.slice();
                userList.list = toAddList;
                if (toAddList.length) {
                    sakai.api.Communication.sendMessage(userList.list,
                        sakai.data.me,
                        sakai.api.i18n.getValueForKey('I_WANT_TO_SHARE', 'newsharecontent') + sakai.api.Util.TemplateRenderer('newsharecontent_filenames_template', {
                            'files': canShareFiles
                        }), messageText, 'message', false, false, true, 'shared_content'
                    );
                    $.each(canShareFiles, function(i, content) {
                        if (sakai.api.Content.Collections.isCollection(content.body)) {
                            sakai.api.Content.Collections.shareCollection(content.body['_path'], toAddList, role, function() {
                                createActivity('ADDED_A_MEMBER', canShareFiles);
                            });
                        } else {
                            sakai.api.Content.addToLibrary(content.body['_path'], toAddList, role, function() {
                                createActivity('ADDED_A_MEMBER', canShareFiles);
                            });
                        }
                    });
                    // Formulate content shared message with list of users
                    if (userList.toAddNames.length > 1) {
                        shareMessage += _.initial(userList.toAddNames).join(', ') + ' ' + sakai.api.i18n.getValueForKey('AND') + ' ' + _.last(userList.toAddNames);
                    } else {
                        shareMessage += userList.toAddNames[0];
                    }

                    sakai.api.Util.notification.show(false, shareMessage, '');
                    $newsharecontentContainer.jqmHide();
                }
            } else {
                if (!messageText) {
                    $newsharecontentMessage.addClass(newsharecontentRequiredClass);
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('NO_MESSAGE_PROVIDED', 'newsharecontent'), sakai.api.i18n.getValueForKey('A_MESSAGE_SHOULD_BE_PROVIDED_TO_SHARE', 'newsharecontent'));
                }
                if (!userList.list.length) {
                    $(newsharecontentShareListContainer).addClass(newsharecontentRequiredClass);
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('NO_USERS_SELECTED', 'newsharecontent'), sakai.api.i18n.getValueForKey('NO_USERS_TO_SHARE_FILE_WITH', 'newsharecontent'));
                }
                if (!contentObj || !canShareFiles) {
                    $(newsharecontentShareListContainer).addClass(newsharecontentRequiredClass);
                    sakai.api.Util.notification.show(sakai.api.i18n.getValueForKey('SHARING_FAILED', 'newsharecontent'), sakai.api.i18n.getValueForKey('SHARING_FAILED_FULL_MESSAGE', 'newsharecontent'));
                }
            }
        };

        //////////////
        // BINDINGS //
        //////////////

        var addBinding = function() {
            $newsharecontentContainer.jqm({
                modal: false,
                overlay: 0,
                toTop: true,
                zIndex: 3000,
                onShow: fillShareData,
                onHide: resetWidget
            });

            $(document).on('click', '.share_trigger_click', function() {
                if ($newsharecontentContainer.is(':visible')) {
                    $newsharecontentContainer.jqmHide();
                }
                sakai.api.Util.Forms.clearValidation($newsharecontent_form);
                var idArr = $(this).attr('data-entityid');
                if (idArr && idArr.length) {
                    if (!$.isArray(idArr)) {
                        idArr = idArr.split(',');
                    }
                    var $this = $(this);
                    $newsharecontentContainer.css({
                        'top':$this.offset().top + $this.height(),
                        'left':$this.offset().left + $this.width() / 2 - 119
                    });
                    // Fetch data for content items
                    var batchRequests = [];
                    $.each(idArr, function(i, id) {
                        batchRequests.push({
                            'url': '/p/' + id + '.json',
                            'method': 'GET'
                        });
                    });
                    sakai.api.Server.batch(batchRequests, function(success, data) {
                        if (success && data) {
                            if (data.results) {
                                $.each(data.results, function(i, result) {
                                    data.results[i].body = $.parseJSON(data.results[i].body);
                                });
                                contentObj = {
                                    data: data.results,
                                    shareUrl: sakai.api.Content.createContentURL(data.results[0].body)
                                };
                            } else if (data.url) {
                                contentObj = {
                                    data: [data],
                                    shareUrl:  sakai.api.Content.createContentURL(data)
                                };
                            }
                            require(['//s7.addthis.com/js/250/addthis_widget.js?%23pubid=' + sakai.widgets.newsharecontent.defaultConfiguration.newsharecontent.addThisAccountId + '&domready=1'], function() {
                                $newsharecontentContainer.jqmShow();
                            });
                        }
                    });
                }
            });
        };

        $newsharecontentMessageToggle.add($newsharecontentMessageArrow).on('click',function() {
            $newsharecontentMessageArrow.toggleClass('arrow_down');
            $newsharecontentMessageContainer.stop(true, true).slideToggle();
        });

        sakai.api.Util.hideOnClickOut('.newsharecontent_dialog', '.share_trigger_click', function() {
            $newsharecontentContainer.jqmHide();
        });

        $(window).on('finished.sharecontent.sakai', doShare);

        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var init = function() {
            if (!sakai.data.me.user.anon) {
                $newsharecontentAnon.hide();
                $newsharecontentUser.show();
            } else {
                $newsharecontentContainer.addClass('anon');
            }
            addBinding();
            sakai.api.Util.AutoSuggest.setup( $newsharecontentSharelist, {
                asHtmlID: tuid,
                scrollHeight: 120
            });
            $('label#newsharecontent_autosuggest_for').attr('for', tuid);
        };

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('newsharecontent');
});
