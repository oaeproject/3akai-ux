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
 * /dev/lib/jquery/plugins/jquery.json.js (toJSON)
 * /dev/lib/jquery/plugins/jqmodal.sakai-edited.js
 * /dev/lib/misc/trimpath.template.js (TrimpathTemplates)
 * /dev/lib/jquery/plugins/jquery.autoSuggest.sakai-edited.js (autoSuggest)
 */
/*global $ */

// Namespaces
require(["jquery", "sakai/sakai.api.core"], function($, sakai){

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
    sakai_global.newsharecontent = function(tuid, showSettings){

        /////////////////////////////
        // CONFIGURATION VARIABLES //
        /////////////////////////////

        // Containers
        var $newsharecontentContainer = $("#newsharecontent_widget");
        var $newsharecontentMessageContainer = $("#newsharecontent_message_container");

        // Elements
        var $newsharecontentLinkURL = $("#newsharecontent_linkurl");
        var $newsharecontentSharelist = $("#newsharecontent_sharelist");
        var $newsharecontentMessage = $("#newsharecontent_message");
        var $newsharecontentSendButton = $("#sharecontent_send_button");
        var newsharecontentListItem = ".as-selection-item";
        var newsharecontentShareListContainer = "#newsharecontent_sharelist_container";
        var $newsharecontentMessageToggle = $('label.toggletext',$newsharecontentContainer);
        var $newsharecontentMessageArrow = $('#newsharecontent_message_arrow');
        var $newsharecontentHeading = $('#newsharecontent_heading');

        // Classes
        var newsharecontentRequiredClass = "newsharecontent_required";

        // Content object
        var contentObj = {};

        ///////////////
        // RENDERING //
        ///////////////

        var fillShareData = function(hash){
            $newsharecontentLinkURL.val(contentObj.shareUrl);
            var shareData = {
                "filename": "\"" + contentObj.data["sakai:pooled-content-file-name"] + "\"",
                "path": contentObj.shareUrl,
                "user": sakai.data.me.profile.basic.elements.firstName.value
            };

            $newsharecontentMessage.val(sakai.api.Util.TemplateRenderer("newsharecontent_share_message_template", shareData));

            if (hash) {
                hash.w.show();
            }
            var tbx = $('#toolbox');
            if(tbx.find('a').length===0){
                var svcs = {facebook: 'Facebook', twitter: 'Twitter', delicious:'Delicious', stumbleupon: 'StumbleUpon', blogger:'Blogger', wordpress:'Wordpress', google:'Google', expanded: 'More'};
                for (var s in svcs) {
                    tbx.append('<a class="addthis_button_'+s+'" addthis:url="'+contentObj.shareUrl+'"></a>');
                }
                addthis.toolbox("#toolbox");
            }
        };

        var resetWidget = function(hash){
            hash.o.remove();
            $newsharecontentMessage.removeClass(newsharecontentRequiredClass);
            $(newsharecontentShareListContainer).removeClass(newsharecontentRequiredClass);
            $(".as-close").click();
            $(newsharecontentListItem).remove();
        };

        ////////////
        // SEARCH //
        ////////////
        
        var initAutosuggest = function(){
            $newsharecontentSharelist.autoSuggest("", {
                selectedItemProp: "name",
                searchObjProps: "name",
                startText: "Enter name here",
                asHtmlID: tuid,
                scrollresults:true,
                source: function(query, add) {
                    var q = sakai.api.Server.createSearchString(query);
                    var options = {"page": 0, "items": 15};
                    var searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS;
                    if (q === '*' || q === '**') {
                        searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS_ALL;
                    } else {
                        options['q'] = q;
                    }
                    sakai.api.Server.loadJSON(searchUrl.replace(".json", ""), function(success, data){
                        if (success) {
                            var suggestions = [];
                            $.each(data.results, function(i) {
                                if (data.results[i]["rep:userId"] && data.results[i]["rep:userId"] !== sakai.data.me.user.userid) {
                                    suggestions.push({"value": data.results[i]["rep:userId"], "name": sakai.api.Security.saneHTML(sakai.api.User.getDisplayName(data.results[i])), "type": "user"});
                                } else if (data.results[i]["sakai:group-id"]) {
                                    suggestions.push({"value": data.results[i]["sakai:group-id"], "name": data.results[i]["sakai:group-title"], "type": "group"});
                                }
                            });
                            add(suggestions);
                        }
                    }, options);
                }
            });
        };


        ///////////
        // SHARE //
        ///////////

        var getSelectedList = function() {
            var list = $("#as-values-" + tuid).val();
            // this value is a comma-delimited list
            // split it and get rid of any empty values in the array
            list = list.split(",");
            var removed = 0;
            $(list).each(function(i, val) {

               if (val === "") {
                   list.splice(i - removed, 1);
                   removed += 1;
               }
            });

            // Create list to show in the notification
            var toAddNames = [];
            $("#newsharecontent_container .as-selection-item").each(function(){
                // In IE 7 </A> is returned and in firefox </a>
                toAddNames.push($(this).html().split(/<\/[aA]?>/g)[1]);
            });
            var returnValue = {"list":list, "toAddNames":toAddNames};

            return returnValue;
        };

        var createActivity = function(activityMessage){
            var activityData = {
                "sakai:activityMessage": activityMessage
            };
            sakai.api.Activity.createActivity("/p/" + contentObj.data["_path"], "content", "default", activityData, function(){
                $(window).trigger("load.content_profile.sakai", function(){
                    $(window).trigger("render.entity.sakai", ["content", contentObj]);
                });
            });
        };

        var doShare = function(){
            var userList = getSelectedList();
            var messageText = $.trim($newsharecontentMessage.val());
            $newsharecontentMessage.removeClass(newsharecontentRequiredClass);
            $(newsharecontentShareListContainer).removeClass(newsharecontentRequiredClass);
            if (userList.list.length && messageText) {
                var toAddList = userList.list.slice();
                userList.list = toAddList;
                if (toAddList.length) {
                    sakai.api.Communication.sendMessage(userList.list, sakai.data.me, sakai.api.i18n.Widgets.getValueForKey("newsharecontent", "", "I_WANT_TO_SHARE") + " \"" + contentObj.data["sakai:pooled-content-file-name"] + "\"", messageText, "message", false, false, true, "shared_content");
                    sakai.api.Content.addToLibrary(contentObj.data["_path"], toAddList);
                    sakai.api.Util.notification.show(false, sakai.api.Security.saneHTML($("#newsharecontent_users_added_text").text()) + " " + userList.toAddNames.join(", "), "");
                    createActivity("__MSG__ADDED_A_MEMBER__");
                    $newsharecontentContainer.hide();
                }
            } else {
                if (!messageText) {
                    $newsharecontentMessage.addClass(newsharecontentRequiredClass);
                    sakai.api.Util.notification.show(sakai.api.i18n.Widgets.getValueForKey("newsharecontent", "", "NO_MESSAGE_PROVIDED"), sakai.api.i18n.Widgets.getValueForKey("newsharecontent", "", "A_MESSAGE_SHOULD_BE_PROVIDED_TO_SHARE"));
                }
                if (!userList.list.length) {
                    $(newsharecontentShareListContainer).addClass(newsharecontentRequiredClass);
                    sakai.api.Util.notification.show(sakai.api.i18n.Widgets.getValueForKey("newsharecontent", "", "NO_USERS_SELECTED"), sakai.api.i18n.Widgets.getValueForKey("newsharecontent", "", "NO_USERS_TO_SHARE_FILE_WITH"));
                }
            }
        };

        //////////////
        // BINDINGS //
        //////////////

        var addBinding = function(){
            $newsharecontentContainer.jqm({
                modal: false,
                overlay: 1,
                toTop: true,
                zIndex: 3000,
                onShow: fillShareData,
                onHide: resetWidget
            });

            $('#newsharecontent_cancel').bind('click',function(){
            	$(".as-close").click();
            	$(".as-input",$newsharecontentContainer).val("").trigger("keydown");
                $newsharecontentContainer.hide();
            });

            $('.share_trigger_click').live('click',function(){
                var contentId = $(this).data("entityid");
                var $this = $(this);
                sakai.api.Server.loadJSON("/p/" + contentId + ".json", function(success, data){
                    if (success) {
                        contentObj = {
                            "data": data,
                            "shareUrl": sakai.config.SakaiDomain + "/content#p=" + data["_path"] + "/" + encodeURI(data["sakai:pooled-content-file-name"])
                        };
                        if (window["addthis"]) {
                            $newsharecontentContainer.css({'top':$this.offset().top + $this.height() - 5,'left':$this.offset().left + $this.width() / 2 - 125});
                            $newsharecontentContainer.jqmShow();
                        }
                    }
                });
            });

            $newsharecontentSendButton.unbind("click", doShare);
            $newsharecontentSendButton.bind("click", doShare);
        };

        $newsharecontentMessageToggle.add($newsharecontentMessageArrow).bind('click',function(){
            $newsharecontentMessageArrow.toggleClass('arrow_down');
            $newsharecontentMessageContainer.stop(true, true).slideToggle();
        });


        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var init = function(){
            addBinding();
            var ajaxcache = $.ajaxSettings.cache;
            $.ajaxSettings.cache = true;
            $.getScript('http://s7.addthis.com/js/250/addthis_widget.js?%23pubid=xa-4db72a071927628b&domready=1');
            $.ajaxSettings.cache = ajaxcache;
            initAutosuggest();
        };

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("newsharecontent");
});
