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
require(["jquery", "sakai/sakai.api.core", "/tests/qunit/js/jquery.mockjax.js"], function($, sakai) {

    sakai_global.newinbox = function(tuid, showSettings, widgetData, state) {
        var hoveringHover = false,
            $hoveredElt = false,
            messages = {};

        var $rootel = $("#"+tuid),
            $newinbox_items = $('#newinbox_message_list .newinbox_items_inner', $rootel),
            $newinbox_hover = $("#newinbox_hover", $rootel),
            $newinbox_hover_header = $("#newinbox_hover_header", $rootel),
            $newinbox_hover_content = $("#newinbox_hover_content", $rootel),
            $newinbox_hover_template = $("#newinbox_hover_template", $rootel),
            $newinbox_message_list = $("#newinbox_message_list", $rootel),
            $newinbox_show_message = $("#newinbox_show_message", $rootel),
            $newinbox_show_message_template = $("#newinbox_show_message_template", $rootel),
            $newinbox_select_all_messages = $("#newinbox_select_all_messages", $rootel),
            $newinbox_back_to_messages = $("#newinbox_back_to_messages", $rootel),
            $newinbox_create_new_message = $("#newinbox_create_new_message", $rootel),
            $newinbox_new_message = $("#newinbox_new_message", $rootel),
            $newinbox_message_list_item_template = $("#newinbox_message_list_item_template", $rootel); 

        /** Hover over the inbox list **/
        var hoverOver = function(e) {
            var $item = $(e.target);
            if (!hoveringHover) {

                $item = $item.parents('.newinbox_items_container');
                var messageID = $item.attr("id");
                var message = messages.results[messageID];
                sakai.api.Util.TemplateRenderer($newinbox_hover_template, {message:message}, $newinbox_hover);
                $newinbox_hover.css({
                    top: $item.offset().top,
                    left: $item.offset().left-5,
                    width: $item.width()
                }).show();
            }
        };

        var hoverOut = function(e) {
            var $item = $(e.target);
            if (!hoveringHover) {
                $newinbox_hover.hide();
            }
        };

        $newinbox_items.hoverIntent({
            sensitivity: 3,
            interval: 250,
            over: hoverOver,
            timeout: 0,
            out: hoverOut
        });

        $newinbox_hover.live("mouseenter", function(e) {
            hoveringHover = true;
        });

        $newinbox_hover.live("mouseleave", function(e) {
            $(".newinbox_items_inner.hover").removeClass("hover");
            hoveringHover = false;
            $newinbox_hover.hide();
        });

        /** Sending messages **/
        var sendMessageFinished = function() {
            $.bbq.removeState("newmessage");
        };

        /** History management **/

        var setInitialState = function() {
            $newinbox_back_to_messages.hide();
            $newinbox_show_message.hide();
            $newinbox_new_message.hide();
            $newinbox_message_list.show();
            $newinbox_select_all_messages.show();
        };

        var handleHashChange = function(e, changed, deleted, all, currentState, first) {
            if (!$.isEmptyObject(changed) || first) {
                if (changed.hasOwnProperty("message") || all.hasOwnProperty("message")) {
                    $newinbox_hover.hide();
                    $newinbox_message_list.hide();
                    $newinbox_select_all_messages.hide();
                    $newinbox_back_to_messages.show();
                    var message = messages.results[changed.message];
                    sakai.api.Util.TemplateRenderer($newinbox_show_message_template, {message:message}, $newinbox_show_message);
                    $newinbox_show_message.show();
                } else if (changed.hasOwnProperty("newmessage") || all.hasOwnProperty("newmessage")) {
                    $newinbox_hover.hide();
                    $(window).trigger("initialize.sendmessage.sakai", [null, $newinbox_new_message, sendMessageFinished]);
                    $newinbox_message_list.hide();
                    $newinbox_new_message.show();
                }
            } else if (!$.isEmptyObject(deleted)) {
                if (deleted.hasOwnProperty("message")) {
                    $newinbox_hover.hide();
                    $newinbox_back_to_messages.hide();
                    $newinbox_show_message.hide();
                    $newinbox_message_list.show();
                    $newinbox_select_all_messages.show();
                } else if (deleted.hasOwnProperty("newmessage")) {
                    setInitialState();
                }
            } else {
                setInitialState();
            }
        };

        $.mockjax({
            url: "/var/message/boxcategory.json?box=" + widgetData.box + "&category=" + widgetData.category + "&items=20&page=0&sortBy=sakai:created&sortOrder=desc",
            responseText: {"items":13,"results":[{"jcr:path":"/~croby/message/inbox/ac4a27abeb37527f8d18f17b697c81eff7e731e2","jcr:name":"ac4a27abeb37527f8d18f17b697c81eff7e731e2","sakai:category":"invitation","_charset_":"utf-8","sakai:created":"2011-04-04T23:36:24+00:00","_lastModifiedBy":"croby","sakai:type":"internal","sakai:to":"internal:croby","_createdBy":"admin","_copiedFrom":"a:dmadan/message/outbox/ac4a27abeb37527f8d18f17b697c81eff7e731e2","_copiedFromId":"G79gyYmwgKmuVqnwIbc","sakai:messagestore":"a:croby/message/","sling:resourceType":"sakai/message","_created":1301960184796,"_id":"GCzwkcRQUkyJMMYhZZc","sakai:sendstate":"notified","sakai:body":"Hi \n\n madan dorairaj has invited you to become a connection. \nHe/She has also left the following message: \n\n  I would like to invite you to become a member of my network on Sakai.\n\n- madan \n\nTo accept this invitation please click on the accept button. \n\nKind regards\n\nThe Sakai Team,","_copiedDeep":true,"_lastModified":1301960441657,"sakai:subject":"madan dorairaj has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:read":"true","sakai:messagebox":"inbox","sakai:id":"ac4a27abeb37527f8d18f17b697c81eff7e731e2","sakai:from":"dmadan","id":"ac4a27abeb37527f8d18f17b697c81eff7e731e2","userTo":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}],"userFrom":[{"hash":"dmadan","basic":{"access":"everybody","elements":{"picture":{"value":"{\"name\":\"256x256_tmp1301960273466.jpg\",\"_name\":\"tmp1301960273466.jpg\",\"_charset_\":\"utf-8\",\"selectedx1\":0,\"selectedy1\":0,\"selectedx2\":96,\"selectedy2\":96}"},"lastName":{"value":"dorairaj"},"email":{"value":"dmadan@hotmail.com"},"firstName":{"value":"madan"}}},"rep:userId":"dmadan","userid":"dmadan","user":"dmadan","sakai:status":"offline","sakai:location":"none"}]},{"jcr:path":"/~croby/message/inbox/76d9463065dfa308bd8085fe10092f2195f21e2f","jcr:name":"76d9463065dfa308bd8085fe10092f2195f21e2f","sakai:category":"invitation","_charset_":"utf-8","sakai:created":"2011-04-04T23:36:37+00:00","_lastModifiedBy":"admin","sakai:type":"internal","sakai:to":"internal:croby","_createdBy":"admin","_copiedFrom":"a:lance/message/outbox/76d9463065dfa308bd8085fe10092f2195f21e2f","_copiedFromId":"OiQaLIykGkM7SHumPh","sakai:messagestore":"a:croby/message/","sling:resourceType":"sakai/message","_created":1301960197358,"sakai:sendstate":"notified","_id":"OCWuhJWRKVKYD9z4ZZc","sakai:body":"Hi \n\n Lance Speelmon has invited you to become a connection. \nHe/She has also left the following message: \n\n  I would like to invite you to become a member of my network on Sakai.\n\n- Lance \n\nTo accept this invitation please click on the accept button. \n\nKind regards\n\nThe Sakai Team,","_copiedDeep":true,"_lastModified":1301960197371,"sakai:subject":"Lance Speelmon has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:id":"76d9463065dfa308bd8085fe10092f2195f21e2f","sakai:messagebox":"inbox","sakai:read":false,"sakai:from":"lance","id":"76d9463065dfa308bd8085fe10092f2195f21e2f","userTo":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}],"userFrom":[{"hash":"lance","basic":{"access":"everybody","elements":{"picture":{"value":"{\"name\":\"256x256_tmp1301960219230.jpg\",\"_name\":\"tmp1301960219230.jpg\",\"_charset_\":\"utf-8\",\"selectedx1\":0,\"selectedy1\":0,\"selectedx2\":300,\"selectedy2\":300}"},"lastName":{"value":"Speelmon"},"email":{"value":"lance@indiana.edu"},"firstName":{"value":"Lance"}}},"rep:userId":"lance","userid":"lance","user":"lance","sakai:status":"offline","sakai:location":"none"}]},{"jcr:path":"/~croby/message/inbox/3a39ba3db59dd2dffabc48381e2155469a21e8c6","jcr:name":"3a39ba3db59dd2dffabc48381e2155469a21e8c6","sakai:category":"invitation","_charset_":"utf-8","sakai:created":"2011-04-04T23:40:06+00:00","_lastModifiedBy":"admin","sakai:type":"internal","sakai:to":"internal:croby","_createdBy":"admin","_copiedFrom":"a:jsloane/message/outbox/3a39ba3db59dd2dffabc48381e2155469a21e8c6","_copiedFromId":"HoggyYmwgKmuVqnwIbc","sakai:messagestore":"a:croby/message/","sling:resourceType":"sakai/message","_created":1301960406893,"sakai:sendstate":"notified","_id":"HwogSMWRKVKYD9z4ZZc","sakai:body":"Hi \n\n James Sloane has invited you to become a connection. \nHe/She has also left the following message: \n\n  I would like to invite you to become a member of my network on Sakai.\n\n- James \n\nTo accept this invitation please click on the accept button. \n\nKind regards\n\nThe Sakai Team,","_copiedDeep":true,"_lastModified":1301960406900,"sakai:subject":"James Sloane has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:id":"3a39ba3db59dd2dffabc48381e2155469a21e8c6","sakai:messagebox":"inbox","sakai:read":false,"sakai:from":"jsloane","id":"3a39ba3db59dd2dffabc48381e2155469a21e8c6","userTo":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}],"userFrom":[{"hash":"jsloane","basic":{"access":"everybody","elements":{"picture":{"value":"{\"name\":\"256x256_tmp1301960299009.jpg\",\"_name\":\"tmp1301960299009.jpg\",\"_charset_\":\"utf-8\",\"selectedx1\":49,\"selectedy1\":7,\"selectedx2\":222,\"selectedy2\":180}"},"lastName":{"value":"Sloane"},"email":{"value":"jsloane@csu.edu.au"},"firstName":{"value":"James"}}},"rep:userId":"jsloane","userid":"jsloane","user":"jsloane","sakai:status":"offline","sakai:location":"none"}]},{"jcr:path":"/~croby/message/inbox/74de9b2264ecd0e4ad4907412de15d91080073f2","jcr:name":"74de9b2264ecd0e4ad4907412de15d91080073f2","_lastModifiedBy":"croby","sakai:type":"internal","sakai:messagestore":"a:croby/message/","sakai:sendstate":"notified","_id":"fSUCTuYRKVKYD9z4ZZc","sakai:body":"hi","sakai:id":"74de9b2264ecd0e4ad4907412de15d91080073f2","sakai:from":"mawalsh","sakai:category":"message","_charset_":"utf-8","sakai:created":"2011-04-04T23:41:04+00:00","sakai:to":"internal:croby","_createdBy":"admin","_copiedFrom":"a:mawalsh/message/outbox/74de9b2264ecd0e4ad4907412de15d91080073f2","_copiedFromId":"fGdakmoWWksmuVqnwIbc","sling:resourceType":"sakai/message","_created":1301960464027,"sakai:previousmessage":"bb84eff24c5edc9626873a425df8303249d75f24","_copiedDeep":true,"_lastModified":1301960499825,"sakai:subject":"Re: Chris Roby has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:messagebox":"inbox","sakai:read":"true","id":"74de9b2264ecd0e4ad4907412de15d91080073f2","userTo":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}],"userFrom":[{"hash":"mawalsh","basic":{"access":"everybody","elements":{"lastName":{"value":"walsh"},"email":{"value":"mawalsh@csu.edu.au"},"firstName":{"value":"mark"}}},"rep:userId":"mawalsh","userid":"mawalsh","user":"mawalsh","sakai:status":"offline","sakai:location":"none"}],"previousMessage":{"jcr:path":"/~croby/message/outbox/bb84eff24c5edc9626873a425df8303249d75f24","jcr:name":"bb84eff24c5edc9626873a425df8303249d75f24","sakai:category":"invitation","_charset_":"utf-8","sakai:created":"2011-04-04T23:36:27+00:00","_lastModifiedBy":"croby","sakai:type":"internal","sakai:to":"internal:mawalsh","_createdBy":"croby","sling:resourceType":"sakai/message","sakai:messagestore":"a:croby/message/","_created":1301960187740,"_id":"Iy0gyYmwgKmuVqnwIbc","sakai:sendstate":"notified","sakai:body":"Hi \n\n Chris Roby has invited you to become a connection. \nHe/She has also left the following message: \n\n  I would like to invite you to become a member of my network on Sakai.\n\n- Chris \n\nTo accept this invitation please click on the accept button. \n\nKind regards\n\nThe Sakai Team,","_lastModified":1301960187775,"sakai:subject":"Chris Roby has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:read":"true","sakai:messagebox":"outbox","sakai:id":"bb84eff24c5edc9626873a425df8303249d75f24","sakai:from":"croby","id":"bb84eff24c5edc9626873a425df8303249d75f24","userTo":[{"hash":"mawalsh","basic":{"access":"everybody","elements":{"lastName":{"value":"walsh"},"email":{"value":"mawalsh@csu.edu.au"},"firstName":{"value":"mark"}}},"rep:userId":"mawalsh","userid":"mawalsh","user":"mawalsh","sakai:status":"offline","sakai:location":"none"}],"userFrom":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}]}},{"jcr:path":"/~croby/message/inbox/eee2d76a39ecf68df401dabf7d9084793094c461","jcr:name":"eee2d76a39ecf68df401dabf7d9084793094c461","_lastModifiedBy":"admin","sakai:type":"internal","sakai:messagestore":"a:croby/message/","_id":"nMsyV8YQUkyJMMYhZZc","sakai:sendstate":"notified","sakai:body":"thanks","sakai:id":"eee2d76a39ecf68df401dabf7d9084793094c461","sakai:from":"mawalsh","sakai:category":"message","_charset_":"utf-8","sakai:created":"2011-04-04T23:43:02+00:00","sakai:to":"internal:croby","_createdBy":"admin","_copiedFrom":"a:mawalsh/message/outbox/eee2d76a39ecf68df401dabf7d9084793094c461","_copiedFromId":"nwwouyYRKVKYD9z4ZZc","sling:resourceType":"sakai/message","_created":1301960582332,"sakai:previousmessage":"e72fed0b29d29e230e31d9a690eee84b79ba7c27","_copiedDeep":true,"_lastModified":1301960582347,"sakai:subject":"Re: Re: Re: Chris Roby has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:messagebox":"inbox","sakai:read":false,"id":"eee2d76a39ecf68df401dabf7d9084793094c461","userTo":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}],"userFrom":[{"hash":"mawalsh","basic":{"access":"everybody","elements":{"lastName":{"value":"walsh"},"email":{"value":"mawalsh@csu.edu.au"},"firstName":{"value":"mark"}}},"rep:userId":"mawalsh","userid":"mawalsh","user":"mawalsh","sakai:status":"offline","sakai:location":"none"}],"previousMessage":{"jcr:path":"/~croby/message/outbox/e72fed0b29d29e230e31d9a690eee84b79ba7c27","jcr:name":"e72fed0b29d29e230e31d9a690eee84b79ba7c27","sakai:category":"message","_charset_":"utf-8","sakai:created":"2011-04-04T23:42:00+00:00","_lastModifiedBy":"croby","sakai:type":"internal","sakai:to":"internal:mawalsh","_createdBy":"croby","sling:resourceType":"sakai/message","sakai:messagestore":"a:croby/message/","_created":1301960520526,"_id":"MRq3SMYRKVKYD9z4ZZc","sakai:sendstate":"notified","sakai:previousmessage":"74de9b2264ecd0e4ad4907412de15d91080073f2","sakai:body":"Got the message","_lastModified":1301960520537,"sakai:subject":"Re: Re: Chris Roby has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:read":"true","sakai:messagebox":"outbox","sakai:id":"e72fed0b29d29e230e31d9a690eee84b79ba7c27","sakai:from":"croby","id":"e72fed0b29d29e230e31d9a690eee84b79ba7c27","userTo":[{"hash":"mawalsh","basic":{"access":"everybody","elements":{"lastName":{"value":"walsh"},"email":{"value":"mawalsh@csu.edu.au"},"firstName":{"value":"mark"}}},"rep:userId":"mawalsh","userid":"mawalsh","user":"mawalsh","sakai:status":"offline","sakai:location":"none"}],"userFrom":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}],"previousMessage":{"jcr:path":"/~croby/message/inbox/74de9b2264ecd0e4ad4907412de15d91080073f2","jcr:name":"74de9b2264ecd0e4ad4907412de15d91080073f2","_lastModifiedBy":"croby","sakai:type":"internal","sakai:messagestore":"a:croby/message/","sakai:sendstate":"notified","_id":"fSUCTuYRKVKYD9z4ZZc","sakai:body":"hi","sakai:id":"74de9b2264ecd0e4ad4907412de15d91080073f2","sakai:from":"mawalsh","sakai:category":"message","_charset_":"utf-8","sakai:created":"2011-04-04T23:41:04+00:00","sakai:to":"internal:croby","_createdBy":"admin","_copiedFrom":"a:mawalsh/message/outbox/74de9b2264ecd0e4ad4907412de15d91080073f2","_copiedFromId":"fGdakmoWWksmuVqnwIbc","sling:resourceType":"sakai/message","_created":1301960464027,"sakai:previousmessage":"bb84eff24c5edc9626873a425df8303249d75f24","_copiedDeep":true,"_lastModified":1301960499825,"sakai:subject":"Re: Chris Roby has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:messagebox":"inbox","sakai:read":"true","id":"74de9b2264ecd0e4ad4907412de15d91080073f2","userTo":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}],"userFrom":[{"hash":"mawalsh","basic":{"access":"everybody","elements":{"lastName":{"value":"walsh"},"email":{"value":"mawalsh@csu.edu.au"},"firstName":{"value":"mark"}}},"rep:userId":"mawalsh","userid":"mawalsh","user":"mawalsh","sakai:status":"offline","sakai:location":"none"}],"previousMessage":{"jcr:path":"/~croby/message/outbox/bb84eff24c5edc9626873a425df8303249d75f24","jcr:name":"bb84eff24c5edc9626873a425df8303249d75f24","sakai:category":"invitation","_charset_":"utf-8","sakai:created":"2011-04-04T23:36:27+00:00","_lastModifiedBy":"croby","sakai:type":"internal","sakai:to":"internal:mawalsh","_createdBy":"croby","sling:resourceType":"sakai/message","sakai:messagestore":"a:croby/message/","_created":1301960187740,"_id":"Iy0gyYmwgKmuVqnwIbc","sakai:sendstate":"notified","sakai:body":"Hi \n\n Chris Roby has invited you to become a connection. \nHe/She has also left the following message: \n\n  I would like to invite you to become a member of my network on Sakai.\n\n- Chris \n\nTo accept this invitation please click on the accept button. \n\nKind regards\n\nThe Sakai Team,","_lastModified":1301960187775,"sakai:subject":"Chris Roby has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:read":"true","sakai:messagebox":"outbox","sakai:id":"bb84eff24c5edc9626873a425df8303249d75f24","sakai:from":"croby","id":"bb84eff24c5edc9626873a425df8303249d75f24","userTo":[{"hash":"mawalsh","basic":{"access":"everybody","elements":{"lastName":{"value":"walsh"},"email":{"value":"mawalsh@csu.edu.au"},"firstName":{"value":"mark"}}},"rep:userId":"mawalsh","userid":"mawalsh","user":"mawalsh","sakai:status":"offline","sakai:location":"none"}],"userFrom":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}]}}}},{"jcr:path":"/~croby/message/inbox/fa92e9a02da6afda6c7d91b76486257bc235aba8","jcr:name":"fa92e9a02da6afda6c7d91b76486257bc235aba8","sakai:category":"invitation","_charset_":"utf-8","sakai:created":"2011-04-04T23:47:34+00:00","_lastModifiedBy":"admin","sakai:type":"internal","sakai:to":"internal:croby","_createdBy":"admin","_copiedFrom":"a:stuart/message/outbox/fa92e9a02da6afda6c7d91b76486257bc235aba8","_copiedFromId":"RMeMkURQUkyJMMYhZZc","sakai:messagestore":"a:croby/message/","sling:resourceType":"sakai/message","_created":1301960854529,"sakai:sendstate":"notified","_id":"RYWIGFYRKVKYD9z4ZZc","sakai:body":"Hi \n\n Stuart Freeman has invited you to become a connection. \nHe/She has also left the following message: \n\n  I would like to invite you to become a member of my network on Sakai.\n\n- Stuart \n\nTo accept this invitation please click on the accept button. \n\nKind regards\n\nThe Sakai Team,","_copiedDeep":true,"_lastModified":1301960854537,"sakai:subject":"Stuart Freeman has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:id":"fa92e9a02da6afda6c7d91b76486257bc235aba8","sakai:messagebox":"inbox","sakai:read":false,"sakai:from":"stuart","id":"fa92e9a02da6afda6c7d91b76486257bc235aba8","userTo":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}],"userFrom":[{"hash":"stuart","basic":{"access":"everybody","elements":{"picture":{"value":"{\"name\":\"256x256_tmp1301960273336.jpg\",\"_name\":\"tmp1301960273336.jpg\",\"_charset_\":\"utf-8\",\"selectedx1\":10,\"selectedy1\":66,\"selectedx2\":105,\"selectedy2\":161}"},"lastName":{"value":"Freeman"},"email":{"value":"stuart.freeman@et.gatech.edu"},"firstName":{"value":"Stuart"}}},"rep:userId":"stuart","userid":"stuart","user":"stuart","sakai:status":"offline","sakai:location":"none"}]},{"jcr:path":"/~croby/message/inbox/0c0df4ebee24fb1be515ca4c5ba5758d47f63c2c","jcr:name":"0c0df4ebee24fb1be515ca4c5ba5758d47f63c2c","sakai:category":"invitation","_charset_":"utf-8","sakai:created":"2011-04-05T00:02:25+00:00","_lastModifiedBy":"admin","sakai:type":"internal","sakai:to":"internal:croby","_createdBy":"admin","_copiedFrom":"a:jeffpasch/message/outbox/0c0df4ebee24fb1be515ca4c5ba5758d47f63c2c","_copiedFromId":"bQiYUc3RKVKYD9z4ZZc","sakai:messagestore":"a:croby/message/","sling:resourceType":"sakai/message","_created":1301961745554,"sakai:sendstate":"notified","_id":"bZbouy3RKVKYD9z4ZZc","sakai:body":"Hi \n\n jeff pasch has invited you to become a connection. \nHe/She has also left the following message: \n\n  I would like to invite you to become a member of my network on Sakai.\n\n- jeff \n\nTo accept this invitation please click on the accept button. \n\nKind regards\n\nThe Sakai Team,","_copiedDeep":true,"_lastModified":1301961745565,"sakai:subject":"jeff pasch has invited you to become a connection","sling:resourceSuperType":"sparse/Content","sakai:id":"0c0df4ebee24fb1be515ca4c5ba5758d47f63c2c","sakai:messagebox":"inbox","sakai:read":false,"sakai:from":"jeffpasch","id":"0c0df4ebee24fb1be515ca4c5ba5758d47f63c2c","userTo":[{"hash":"croby","basic":{"access":"everybody","elements":{"lastName":{"value":"Roby"},"email":{"value":"croby@nyu.edu"},"firstName":{"value":"Chris"}}},"rep:userId":"croby","userid":"croby","user":"croby","sakai:status":"online","sakai:location":"none"}],"userFrom":[{"hash":"jeffpasch","basic":{"access":"everybody","elements":{"lastName":{"value":"pasch"},"email":{"value":"jeffpasch@yahoo.com"},"firstName":{"value":"jeff"}}},"rep:userId":"jeffpasch","userid":"jeffpasch","user":"jeffpasch","sakai:status":"offline","sakai:location":"none"}]}],"total":7}
        });

        var getMessages = function(sortBy, sortOrder, currentPage) {
            sortBy = "sakai:created";
            sortOrder = "desc";
            currentPage = 0;
            sakai.api.Communication.getAllMessages(widgetData.box, widgetData.category, 20, currentPage, sortBy, sortOrder, function(success, data){
                messages = data;
                sakai.api.Util.TemplateRenderer($newinbox_message_list_item_template, {
                    sakai: sakai,
                    data: data
                }, $newinbox_message_list);
                $newinbox_message_list.show();
            });
        };

        var init = function() {
            $newinbox_back_to_messages.find('a').attr("href", "#l=" + $.bbq.getState('l'));
            $(window).bind("hashchanged.newinbox.sakai", handleHashChange);
            if (state && state.all) {
                handleHashChange(null, {}, {}, state.all, {}, true);
            }
            getMessages();
        };

        init();
    };
    sakai.api.Widgets.widgetLoader.informOnLoad("newinbox");
});