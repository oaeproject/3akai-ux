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

require(["jquery", "sakai/sakai.api.core"], function($, sakai) {

    /**
     * @name sakai_global.recentcontactsnew
     *
     * @class recentcontactsnew
     *
     * @description
     * The 'recentcontactsnew' widget shows the most recent contact, 
     * including its latest content and connection.
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.recentcontactsnew = function(tuid, showSettings) {


        /////////////////////////////
        // Configuration variables //
        /////////////////////////////

        // DOM identifiers
        var rootel = $("#" + tuid);
        var recentcontactsnewItemTemplate = "#recentcontactsnew_item_template";
        var recentcontactsnewItem = ".recentcontactsnew_item";

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Parses an individual JSON search result to be displayed in recentcontactsnew.html
         * 
         * @param {Object} result - individual result object from JSON data feed
         * @return {Object} object containing item.name, item.path, item.type (mimetype)
         *   and item.type_img_url (URL for mimetype icon) for the given result
         */
        var parseDataResult = function(result) {
            // initialize parsed item with default values
            var item = {
                name: result["sakai:pooled-content-file-name"],
                commentCount: sakai.api.Content.getCommentCount(result),
                placeCount: sakai.api.Content.getPlaceCount(result),
                path: "/p/" + result["_path"],
                type: sakai.api.i18n.General.getValueForKey(sakai.config.MimeTypes.other.description),
                type_img_url: sakai.config.MimeTypes.other.URL,
                thumbnail: sakai.api.Content.getThumbnail(result),
                size: "",
                _mimeType: sakai.api.Content.getMimeType(result),
                "_mimeType/page1-small": result["_mimeType/page1-small"],
                "_path": result["_path"]
            };
            // set the mimetype and corresponding image
            if(item._mimeType) {
                // we have a recognized file type - set the description and img URL
                item.type = sakai.api.i18n.General.getValueForKey(sakai.config.MimeTypes[item._mimeType].description);
                item.type_img_url = sakai.config.MimeTypes[item._mimeType].URL;
            }

            // set file name without the extension
            // be aware that links don't have an extension
            var lastDotIndex = result["sakai:pooled-content-file-name"].lastIndexOf(".");
            if(lastDotIndex !== -1) {
                if (item["_mimeType"] !== "x-sakai/link") {
                    // extension found
                    item.name = result["sakai:pooled-content-file-name"].slice(0, lastDotIndex);
                }
            }
            item.name = sakai.api.Util.applyThreeDots(item.name, $(".mycreatecontent_widget .s3d-widget-createcontent").width() - 80, {max_rows: 1,whole_word: false}, "s3d-bold");

            // set the file size
            if(result.hasOwnProperty("_length") && result["_length"]) {
                item.size = "(" + sakai.api.Util.convertToHumanReadableFileSize(result["_length"]) + ")";
            }

            return item;
        };

        /**
         * Callback function to sort contacts
         */
        var sortContacts = function(a, b){
            return a.details._lastModified > b.details._lastModified ? -1 : 1;
        }

        /**
         * Gets a contact and displays info
         * @param {Object} data - contact data
         */
        var handlerecentcontactsnewData = function(data) {
            if(data && data.length > 0) {
                var contactArray = []
                for (var i in data){
                    if (data.hasOwnProperty(i) && data[i].details && data[i].details["sakai:state"] === "ACCEPTED") {
                        contactArray.push(data[i]);
                    }
                }
                // sort contacts to get the most recent
                contactArray.sort(sortContacts);
                if (contactArray.length > 0){
                    getContactInfo(contactArray[0]);
                } else {
                    $(".recentcontactsnew_main").hide();
                }
            } else {
                $(".recentcontactsnew_main").hide();
            }
        };

        /**
         * This function will replace all
         * @param {String} term The search term that needs to be converted.
         */
        var prepSearchTermForURL = function(term) {
            // Filter out http:// as it causes the search feed to break
            term = term.replace(/http:\/\//ig, "");
            // taken this from search_main until a backend service can get related content
            var urlterm = "";
            var split = $.trim(term).split(/\s/);
            if (split.length > 1) {
                for (var i = 0; i < split.length; i++) {
                    if (split[i]) {
                        urlterm += split[i] + " ";
                        if (i < split.length - 1) {
                            urlterm += "OR ";
                        }
                    }
                }
            }
            else {
                urlterm = "*" + term + "*";
            }
            return urlterm;
        };

        /**
         * Retrieve the recent connection render it.
         */
        var getRecentConnection = function (newjson){
            sakai.api.Server.loadJSON("/system/me", function(success, data){
                for (var i = 0; i < data.groups.length; i++){
                    if (!data.groups[i]["sakai:excludeSearch"] && data.groups[i]["sakai:group-title"]) {
                        var connection = data.groups[i];
                        var id, name, picture;
                        if (connection.userid) {
                            id = connection.userid;
                            name = sakai.api.User.getDisplayName(connection);
                            picture = sakai.api.User.getProfilePicture(connection);
                        } else if (connection.groupid) {
                            id = connection.groupid;
                            name = connection["sakai:group-title"];
                            picture = sakai.api.Groups.getProfilePicture(connection);
                        }
                        newjson.connection = {
                            connectionId: id,
                            connectionName: name,
                            connectionPicture: picture
                        }
                        $("#recentcontactsnew_recent_connection_container").html(sakai.api.Util.TemplateRenderer("#recentcontactsnew_recent_connection_template", newjson));
                        break;
                    }
                }
            }, {uid: newjson.profile.userid});
        };

        /**
         * Fetches the related content
         */
        var getContactInfo = function(newjson){
            newjson.displayName = sakai.api.User.getDisplayName(newjson.profile);
            newjson.profilePicture = sakai.api.User.getProfilePicture(newjson.profile);
            var fname = sakai.api.User.getFirstName(newjson.profile);
            if (fname.substring(fname.length-1, fname.length).toLowerCase() === "s"){
                fname = fname + "'"
            } else {
                fname = fname + "'s"
            }
            newjson.firstName = fname;
            $(recentcontactsnewItem, rootel).html(sakai.api.Util.TemplateRenderer(recentcontactsnewItemTemplate,newjson));

            // get related content for group
            var params = {
                "userid" : newjson.profile.userid,
                "page" : 0,
                "items" : 1,
                "sortOn" :"_lastModified",
                "sortOrder":"desc"
            };
            $.ajax({
                url: sakai.config.URL.POOLED_CONTENT_SPECIFIC_USER,
                data: params,
                success: function(latestContent){
                    if(latestContent.results.length > 0){
                        newjson.latestContent = parseDataResult(latestContent.results[0]);
                        // render latest content template
                        var item = {
                            author: {
                                authorId: newjson.profile.userid,
                                authorName: newjson.firstName
                            },
                            content: newjson.latestContent,
                            sakai: sakai
                        };

                        $("#recentcontactsnew_latest_content_container").html(sakai.api.Util.TemplateRenderer("#recentcontactsnew_latest_content_template",item));
                    }
                }
            });

            // get connection information and render recent connection template
            getRecentConnection(newjson);
        };

        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initiates fetching recentcontactsnew data to be displayed in the My recentcontactsnew widget
         * @return None
         */
        var init = function() {
            sakai.api.User.getContacts(function(){
                handlerecentcontactsnewData(sakai.data.me.mycontacts);
            });
        };

        // run init() function when sakai.recentcontactsnew object loads
        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("recentcontactsnew");
});
