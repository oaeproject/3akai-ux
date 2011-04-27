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
require(["jquery", "sakai/sakai.api.core", "/dev/javascript/content_profile.js"], function($, sakai){

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
        $newsharecontentSendButton = $("#sharecontent_send_button");
        var newsharecontentListItem = ".as-selection-item";
        var newsharecontentShareListContainer = "#newsharecontent_sharelist_container";
        var $newsharecontentMessageToggle = $('label.toggletext',$newsharecontentContainer);
        var $newsharecontentMessageArrow = $('#newsharecontent_message_arrow');
        var $newsharecontentHeading = $('#newsharecontent_heading');

        // Classes
        var newsharecontentRequiredClass = "newsharecontent_required";


        ///////////////
        // RENDERING //
        ///////////////

        var fillShareData = function(hash){
           $newsharecontentLinkURL.val(window.location);
            var shareData = {
                "filename": "\"" + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\"",
                "path": window.location,
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
                    tbx.append('<a class="addthis_button_'+s+'"></a>');
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

        var fetchUsersGroups = function(){
            var searchUrl = sakai.config.URL.SEARCH_USERS_GROUPS_ALL + "?q=*";

            sakai.api.Server.loadJSON(searchUrl.replace(".json", ".infinity.json"), function(success, data){
                if (success) {
                    var suggestions = [];
                    var name, value, type;
                    $.each(data.results, function(i){
                        if (data.results[i]["rep:userId"]) {
                            name = sakai.api.Security.saneHTML(sakai.api.User.getDisplayName(data.results[i]));
                            value = "user/" + data.results[i]["rep:userId"];
                            type = "user";
                        }  else if (data.results[i]["sakai:group-id"]) {
                                name = data.results[i]["sakai:group-title"];
                                value = "group/" + data.results[i]["sakai:group-id"];
                                type = "group";
                            }
                        suggestions.push({"value": value, "name": name, "type": type});
                    });
                    $newsharecontentSharelist.autoSuggest(suggestions, {
                        selectedItemProp: "name",
                        searchObjProps: "name",
                        startText: "Enter name here",
                        asHtmlID: tuid
                    });
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
            sakai.api.Activity.createActivity("/p/" + sakai_global.content_profile.content_data.data["jcr:name"], "content", "default", activityData, function(){
                $(window).trigger("load.content_profile.sakai", function(){
                    $(window).trigger("render.entity.sakai", ["content", sakai_global.content_profile.content_data]);
                });
            });
        };

        var doShare = function(){
            $newsharecontentMessage.removeClass(newsharecontentRequiredClass);
            $(newsharecontentShareListContainer).removeClass(newsharecontentRequiredClass);

            var userList = getSelectedList();

            var messageText = $.trim($newsharecontentMessage.val());
            var messageSubject = $.trim($newsharecontentHeading.val());
            if (userList.list.length && messageText) {
                if(messageSubject===''){
                    messageSubject = sakai.api.i18n.Widgets.getValueForKey("newsharecontent", "", "I_WANT_TO_SHARE") + " \"" + sakai_global.content_profile.content_data.data["sakai:pooled-content-file-name"] + "\"";
                }
                sakai.api.Communication.sendMessage(userList.list, sakai.data.me, messageSubject, messageText, "message", false, false, false, "shared_content");

                var toAddList = userList.list.slice();
                var removed = 0;
                for (var i in toAddList) {
                    if (toAddList.hasOwnProperty(i) && toAddList[i]) {
                        if (toAddList[i].substring(0, 5) === "user/") {
                            var user = toAddList[i].substring(5, toAddList[i].length);
                            if(!sakai.api.Content.isUserAManager(sakai_global.content_profile.content_data, user) && !sakai.api.Content.isUserAViewer(sakai_global.content_profile.content_data, user)){
                                toAddList[i - removed] = user;
                            } else {
                                toAddList.splice(i - removed, 1);
                                removed++;
                            }
                        }
                        else if (toAddList[i].substring(0, 6) === "group/") {
                            var group = toAddList[i].substring(6, toAddList[i].length);
                            if(!sakai.api.Content.isUserAManager(sakai_global.content_profile.content_data, group) && !sakai.api.Content.isUserAViewer(sakai_global.content_profile.content_data, group)){
                                toAddList[i - removed] = group;
                            } else {
                                toAddList.splice(i - removed, 1);
                                removed++;
                            }
                        }
                    }
                }

                userList.list = toAddList;

                if (toAddList.length) {
                    $(window).trigger("finished.sharecontent.sakai", {
                        "toAdd": toAddList,
                        "toAddNames": userList.toAddNames,
                        "mode": "viewer"
                    });
                }else {
                    sakai.api.Util.notification.show(sakai.api.Security.saneHTML($("#content_profile_text").text()), sakai.api.Security.saneHTML($("#content_profile_users_added_text").text()) + " " + userList.toAddNames.toString().replace(/,/g, ", "));
                }

                createActivity("__MSG__ADDED_A_MEMBER__");

                $newsharecontentContainer.jqmHide();
            }else{
                if(!messageText){
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

            
            $('#entity_content_share').live('click',function(){
                var $this = $(this);
                $newsharecontentContainer.css({'top':$this.offset().top + $this.height() - 5,'left':$this.offset().left + $this.width() / 2 - 125});
                $newsharecontentContainer.jqmShow(); 
            });
            //$(window).bind("init.sharecontent.sakai", function(e, config, callbackFn){});

            $newsharecontentSendButton.unbind("click", doShare);
            $newsharecontentSendButton.bind("click", doShare);

        };

    
        $newsharecontentMessageToggle.add($newsharecontentMessageArrow[0]).bind('click',function(){
            $newsharecontentMessageArrow.toggleClass('arrow_down');
            $newsharecontentMessageContainer.slideToggle();
        });
        

        ////////////////////
        // INITIALIZATION //
        ////////////////////

        var init = function(){
            addBinding();
            fetchUsersGroups();
			var ajaxcache = $.ajaxSettings.cache;
            $.ajaxSettings.cache = true;
            $.getScript('http://s7.addthis.com/js/250/addthis_widget.js?%23pubid=xa-4db72a071927628b&domready=1');
            $.ajaxSettings.cache = ajaxcache;
        };

        init();
    };

    sakai.api.Widgets.widgetLoader.informOnLoad("newsharecontent");
});
