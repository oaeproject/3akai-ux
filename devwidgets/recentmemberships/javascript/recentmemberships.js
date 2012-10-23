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
 * /dev/lib/jquery/plugins/jquery.threedots.js (ThreeDots)
 */

require(['jquery', 'sakai/sakai.api.core'], function($, sakai) {

    /**
     * @name sakai_global.recentmemberships
     *
     * @class recentmemberships
     *
     * @description
     * The 'recentmemberships' widget shows the most recent recentmemberships item,
     * including its latest comment and one related recentmemberships item
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.recentmemberships = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // DOM identifiers
        var rootel = $('#' + tuid);
        var recentmembershipsItemTemplate = '#recentmemberships_item_template';
        var recentmembershipsItem = '.recentmemberships_item';

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Parses an individual JSON search result to be displayed in recentmemberships.html
         *
         * @param {Object} result - individual result object from JSON data feed
         * @return {Object} object containing item.name, item.path, item.type (mimetype)
         *   and item.type_img_url (URL for mimetype icon) for the given result
         */
        var parseDataResult = function(result) {
            // initialize parsed item with default values
            var item = {
                name: result['sakai:pooled-content-file-name'],
                path: '/p/' + result['_path'],
                type: sakai.api.i18n.getValueForKey(sakai.config.MimeTypes.other.description),
                type_img_url: sakai.config.MimeTypes.other.URL,
                thumbnail: sakai.api.Content.getThumbnail(result),
                size: '',
                _mimeType: sakai.api.Content.getMimeType(result),
                '_mimeType/page1-small': result['_mimeType/page1-small'],
                '_path': result['_path'],
                canShare: sakai.api.Content.canCurrentUserShareContent(result)
            };
            // set the mimetype and corresponding image
            if (item._mimeType && sakai.config.MimeTypes[item._mimeType]) {
                // we have a recognized file type - set the description and img URL
                item.type = sakai.api.i18n.getValueForKey(sakai.config.MimeTypes[item._mimeType].description);
                item.type_img_url = sakai.config.MimeTypes[item._mimeType].URL;
            } else {
                item.type = sakai.api.i18n.getValueForKey(sakai.config.MimeTypes['other'].description);
                item.type_img_url = sakai.config.MimeTypes['other'].URL;
            }

            item.name = sakai.api.Util.applyThreeDots(item.name, $('.mycreatecontent_widget .s3d-widget-createcontent').width() - 80, {max_rows: 1,whole_word: false}, 's3d-bold');

            // set the file size
            if (result.hasOwnProperty('_length') && result['_length']) {
                item.size = '(' + sakai.api.Util.convertToHumanReadableFileSize(result['_length']) + ')';
            }

            return item;
        };

        /**
         * This AJAX callback function handles the search result data returned from
         * /var/search/pool/me/manager.json.  If the call was successful, up to 5 of
         * the most recently created files are presented to the user.
         * @param {Object} success - indicates the status of the AJAX call
         * @param {Object} data - JSON data from /var/search/pool/me/manager.json
         * @return None
         */
        var handlerecentmembershipsData = function(success, groups) {
            if (success && groups && groups.length > 0) {
                $('#recentmemberships_no_results_container').hide();
                getGroupInfo(groups);
            } else {
                $('#recentmemberships_no_results_container').show();
                $('.recentmemberships_main').hide();
            }
        };

        /*
         * Bind Events
         */
        var addBinding = function() {
            $('.recentmemberships_button', rootel).off('click');
            $('.recentmemberships_button', rootel).on('click', function(ev) {
                $(window).trigger('sakai.overlays.createGroup');
            });
        };

        /**
         * Retrieve the manager render it.
         */
        var getMembers = function(groups) {
            sakai.api.Groups.getMembers(groups[0].id, function(success, memberList) {
                memberList = memberList[groups[0].id];
                if (success) {
                    var id, name, picture;
                    for (var role in memberList) {
                        if (memberList[role].results.length > 0) {
                            var member = memberList[role].results[0];
                             if (member.userid && member.userid !== sakai.data.me.userId) {
                                id = member.userid;
                                name = sakai.api.User.getDisplayName(member);
                                linkTitle = sakai.api.i18n.getValueForKey('VIEW_USERS_PROFILE').replace('{user}', name);
                                picture = sakai.api.User.getProfilePicture(member);
                            } else if (member.groupid) {
                                id = member.groupid;
                                name = sakai.api.Security.safeOutput(member['name']);
                                linkTitle = sakai.api.i18n.getValueForKey('VIEW_USERS_PROFILE').replace('{user}', name);
                                picture = sakai.api.Groups.getProfilePicture(member);
                            }
                            if (id) {
                                newjson.entry[0].manager = member;
                                var item = {
                                    member: {
                                        memberId: id,
                                        memberName: name,
                                        memberLinkTitle: linkTitle,
                                        memberPicture: picture,
                                        roleName: role
                                    },
                                    group: groups[0],
                                    sakai: sakai
                                };
                                sakai.api.Util.TemplateRenderer('#recentmemberships_item_member_template', item, $('#recentmemberships_item_member_container'));
                                break;
                            }
                        }
                    }
                }
            });
        };

        /**
         * Fetches the related content
         */
        var getGroupInfo = function(groups) {
            groups[0].displayLinkTitle = sakai.api.i18n.getValueForKey('VIEW_USERS_PROFILE').replace('{user}', groups[0]['name']);
            sakai.api.Util.TemplateRenderer(recentmembershipsItemTemplate,{
                'groups': groups,
                'sakai': sakai
            }, $(recentmembershipsItem, rootel));

            // get related content for group
            var url = sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER.replace('__USERID__', groups[0].id);
            $.ajax({
                url: url,
                success: function(latestContent) {
                    if (latestContent.results.length > 0) {
                        groups[0].latestContent = parseDataResult(latestContent.results[0]);
                        // get latest content author and render latest content template
                        sakai.api.User.getUser(latestContent.results[0]['sakai:pool-content-created-for'],function(success, data) {
                            var item = {
                                author: {
                                    authorId: data.userid,
                                    authorName: sakai.api.User.getDisplayName(data)
                                },
                                content: newjson.entry[0].latestContent,
                                group: newjson.entry[0],
                                sakai: sakai
                            };
                            sakai.api.Util.TemplateRenderer('#recentmemberships_latest_content_template',item, $('#recentmemberships_latest_content_container'));
                        });
                    }
                }
            });

            // get member information and render member template
            getMembers(groups);
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initiates fetching recentmemberships data to be displayed in the My recentmemberships widget
         * @return None
         */
        var init = function() {
            addBinding();
            var data = sakai.api.Groups.getMyMemberships(function(success, groups) {
                handlerecentmembershipsData(success, groups); 
            });
        };

        // run init() function when sakai.recentmemberships object loads
        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('recentmemberships');
});
