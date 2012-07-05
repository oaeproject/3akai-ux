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
     * @name sakai_global.recentchangedcontent
     *
     * @class recentchangedcontent
     *
     * @description
     * The 'recentchangedcontent' widget shows the most recent recentchangedcontent item, 
     * including its latest comment and one related recentchangedcontent item
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.recentchangedcontent = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // DOM identifiers
        var rootel = $('#' + tuid);
        var recentchangedcontentItemTemplate = '#recentchangedcontent_item_template';
        var recentchangedcontentItem = '.recentchangedcontent_item';

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Parses an individual JSON search result (returned from the
         * /var/search/pool/me/manager.json data feed) to be displayed in
         * myrecentchangedcontent.html.
         * @param {Object} result - individual result object from JSON data feed
         * @return {Object} object containing item.name, item.path, item.type (mimetype)
         *   and item.type_img_url (URL for mimetype icon) for the given result
         */
        var parseDataResult = function(result, isRelatedContent) {
            if (result['sling:resourceType'] !== 'sakai/pooled-content') {
                return false;
            }
            // initialize parsed item with default values
            var mimeType = sakai.api.Content.getMimeType(result);
            var mimeTypeDescription = sakai.api.i18n.getValueForKey(sakai.config.MimeTypes['other'].description);
            if (sakai.config.MimeTypes[mimeType]) {
                mimeTypeDescription = sakai.api.i18n.getValueForKey(sakai.config.MimeTypes[mimeType].description);
            }
            var item = {
                name: result['sakai:pooled-content-file-name'],
                path: '/p/' + result['_path'],
                link: result['_path'],
                filename: result['sakai:pooled-content-file-name'],
                type_img_url: sakai.config.MimeTypes.other.URL,
                size: '',
                mimeType: mimeType,
                mimeTypeDescription: mimeTypeDescription,
                usedin: sakai.api.Content.getPlaceCount(result),
                thumbnail: sakai.api.Content.getThumbnail(result),
                totalcomment: sakai.api.Content.getCommentCount(result),
                '_mimeType/page1-small': result['_mimeType/page1-small'],
                '_path': result['_path'],
                canShare: sakai.api.Content.canCurrentUserShareContent(result)
            };

            item.nameShort = sakai.api.Util.applyThreeDots(item.name, $('.recentchangedcontent').width() - 50, {max_rows: 1,whole_word: false}, 's3d-bold');
            item.nameShorter = sakai.api.Util.applyThreeDots(item.name, $('.recentchangedcontent').width() - 150, {max_rows: 1,whole_word: false}, 's3d-bold');
            item.nameRelatedShort = sakai.api.Util.applyThreeDots(item.name, $('.recentchangedcontent').width() - 100, {max_rows: 1,whole_word: false}, 's3d-bold');

            // set the file size
            if(result.hasOwnProperty('_length') && result['_length']) {
                item.size = '(' + sakai.api.Util.convertToHumanReadableFileSize(result['_length']) + ')';
            }

            var path = result['_path'];
            if (result['comments']) {
                var commentpath = ''; // store the path of the comment to display
                var latestDate = 0; // store the latest date of the comment
                for (var obj in result['comments']) {
                    // if the object is comment
                    if (obj.substring(0,1) !== '-1') {
                        // check if the comment is latest comment
                        if (result['comments'][obj]['_created'] > latestDate) {
                            commentpath = obj;
                            latestDate = result['comments'][obj]['_created'];
                        }
                    }
                }
                item.comment = result['comments'][commentpath];

                if (item.comment.comment) {
                    item.comment.comment = sakai.api.Util.applyThreeDots(item.comment.comment, $('.recentchangedcontent_widget').width() / 2, {
                        max_rows: 5,
                        whole_word: false
                    });
                }

                // get the user name from userid and render it
                sakai.api.User.getUser(item.comment.author, function(success, data) {
                    var json = {
                        author:{
                            authorId: data.userid,
                            authorName: sakai.api.User.getDisplayName(data),
                            authorPicture: sakai.api.Util.constructProfilePicture(data)
                        },
                        sakai: sakai
                    };
                    if (item.comment) {
                        json.commentCreated = new Date(item.comment._created);
                    }

                    sakai.api.Util.TemplateRenderer('#recentchangedcontent_item_comment_author_template', json, $('#recentchangedcontent_item_comment_author'));

                    if (item.comment) {
                        $('#recentchangedcontent_item_comment_author_picture img').attr('src', json.author.authorPicture);
                        $('#recentchangedcontent_item_comment_author_picture').show();
                    }
                });
            }

            if(isRelatedContent) {
                // get realted content author name from the author id and rendertemplate
                sakai.api.User.getUser(result['sakai:pool-content-created-for'], renderRelatedContentTemplate);
            }

            return item;
        };

        var renderRecentComment = function(success, data) {
            var item = {
                author:{
                    authorId: data.userid,
                    authorName: sakai.api.User.getDisplayName(data),
                    authorPicture: sakai.api.Util.constructProfilePicture(data)
                }
            };
            $('#recentchangedcontent_item_comment_author').html(sakai.api.Util.TemplateRenderer('#recentchangedcontent_item_comment_author_template',item));
            $('#recentchangedcontent_item_comment_author_picture img').attr('src', item.author.authorPicture);
            $('#recentchangedcontent_item_comment_author_picture').show();
        };

        var renderRelatedContentTemplate = function(success, data) {
            var item = {
                author:{
                    authorId: data.userid,
                    authorName: sakai.api.User.getDisplayName(data)
                }
            };
            $('#recentchangedcontent_related_content_author').html(sakai.api.Util.TemplateRenderer('#recentchangedcontent_item_related_content_author_template',item));
        };


        /**
         * This AJAX callback function handles the search result data returned from
         * /var/search/pool/me/manager.json.  If the call was successful, up to 5 of
         * the most recently created files are presented to the user.
         * @param {Object} success - indicates the status of the AJAX call
         * @param {Object} data - JSON data from /var/search/pool/me/manager.json
         * @return None
         */
        var handleRecentChangedContentData = function(success, data) {
            if(success && data.results && data.results.length > 0) {
                getRelatedContent(data.results[0]);
                $('#recentchangedcontent_no_results_container').hide();
                $('.recentchangedcontent_main').show();
            } else {
                $('.recentchangedcontent_main').hide();
                $('#recentchangedcontent_no_results_container').show();
            }
        };

        /*
         * Bind Events
         */
        var addBinding = function () {
            $(document).on('done.newaddcontent.sakai', function(e, newContent) {
                if (newContent && newContent.length) {
                    handleRecentChangedContentData(true, {results:newContent});
                }
            });
        };

        /**
         * This function will replace all
         * @param {String} term The search term that needs to be converted.
         */
        var prepSearchTermForURL = function(term) {
            // Filter out http:// as it causes the search feed to break
            term = term.replace(/http:\/\//ig, '');
            // taken this from search_main until a backend service can get related content
            var urlterm = '';
            var split = $.trim(term).split(/\s/);
            if (split.length > 1) {
                for (var i = 0; i < split.length; i++) {
                    if (split[i]) {
                        urlterm += split[i] + ' ';
                        if (i < split.length - 1) {
                            urlterm += 'OR ';
                        }
                    }
                }
            }
            else {
                urlterm = split[0];
                if (urlterm === '') {
                    urlterm = '*';
                }
            }
            return urlterm;
        };

        /**
         * Fetches the related content
         */
        var getRelatedContent = function(contentData){
            var searchterm = contentData["sakai:pooled-content-file-name"].substring(0,400);
            searchquery = prepSearchTermForURL(searchterm);

            // get related content for contentData
            // return some search results for now
            var params = {
                'items' : '2'
            };
            var url = sakai.config.URL.SEARCH_ALL_FILES.replace('.json', '.0.json');
            if (searchquery === '*' || searchquery === '**') {
                url = sakai.config.URL.SEARCH_ALL_FILES_ALL;
            } else {
                params['q'] = searchquery;
            }
            $.ajax({
                url: url,
                data: params,
                success: function(relatedContent) {
                    var recentchangedcontentjson = {items: []};
                    var item = parseDataResult(contentData);
                    var isRelatedContent = false;
                    for (var i = 0; i < relatedContent.results.length; i++) {
                        if (relatedContent.results[i]['_path'] !== contentData['_path']) {
                            isRelatedContent = relatedContent.results[i];
                            break;
                        }
                    }
                    if(isRelatedContent) {
                        item.relatedContent = parseDataResult(isRelatedContent, true);
                    }
                    recentchangedcontentjson.items.push(item);
                    // pass the array to HTML view
                    recentchangedcontentjson.sakai = sakai;
                    sakai.api.Util.TemplateRenderer(recentchangedcontentItemTemplate, recentchangedcontentjson, $(recentchangedcontentItem, rootel));
                }
            });
            
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initiates fetching recentchangedcontent data to be displayed in the My recentchangedcontent widget
         * @return None
         */
        var init = function() {
            sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
            addBinding();

            // get list of recentchangedcontent items
            $.ajax({
                url: sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
                cache: false,
                data: {
                    userid: sakai.data.me.user.userid,
                    page: 0,
                    items: 1,
                    sortOn: '_lastModified',
                    sortOrder: 'desc'
                },
                success: function(data) {
                    data.results = $.merge(sakai.api.Content.getNewList(sakai.data.me.user.userid), data.results);
                    handleRecentChangedContentData(true, data);
                },
                error: function(data) {
                    $('#recentchangedcontent_no_content').show();
                    handleRecentChangedContentData(false);
                }
            });
        };

        // run init() function when sakai.recentchangedcontent object loads
        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad('recentchangedcontent');
});
