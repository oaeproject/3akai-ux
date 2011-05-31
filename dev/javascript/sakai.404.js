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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {

    sakai_global.nopermissions = function(tuid, showSettings) {

        var pageNotFoundErrorLoggedOutTemplate = "page_not_found_error_logged_out_template";
        var pageNotFoundErrorLoggedInTemplate = "page_not_found_error_logged_in_template";
        var pageNotFoundError = "#page_not_found_error";
        var gatewayURL = sakai.config.URL.GATEWAY_URL;
        var $signinbuttonwrapper = $('#error_sign_in_button');
        var $signinbutton = $("button",$signinbuttonwrapper);
        var $browsecatcount = $("#error_browse_category_number");
        var $secondcoltemplate = $("#error_second_column_links_template");
        var $errorsecondcolcontainer = $("#error_content_second_column_box_container");
        var $errorPageLinksTemplate = $("#error_page_links_template");
        var $errorPageLinksContainer = $("#error_page_links_container");
        var $goback = $("#error_goback");
        var $searchinput = $("#errorsearch_text");

        var doInit = function(){
            var renderedTemplate = false;
            var catcount = 0;
            for (var i in sakai.config.Directory) {
                if (sakai.config.Directory.hasOwnProperty(i)) {
                    catcount+=1;
                }
            }
            $browsecatcount.text(catcount);
            
            // Create the world links in the second column after People, Content...
            var worlds = [];
            var obj = {};
            for (var c = 0; c < sakai.config.worldTemplates.length; c++){
                var world = sakai.config.worldTemplates[c];
                world.label = sakai.api.i18n.General.getValueForKey(world.title);
                if(c===sakai.config.worldTemplates.length-1){
                	world.last = true;
                }
                worlds.push(world);
            }
            obj.worlds = worlds;
            $errorsecondcolcontainer.append(sakai.api.Util.TemplateRenderer($secondcoltemplate, obj));

            // display the error page links
            var linkObj = {
                links: sakai.config.ErrorPage.Links,
                sakai: sakai
            };
            $errorPageLinksContainer.html(sakai.api.Util.TemplateRenderer($errorPageLinksTemplate, linkObj));

            if (sakai.data.me.user.anon){
                
                $signinbuttonwrapper.show();
                $signinbutton.click(function(){
                    $("#topnavigation_user_options_login_wrapper").trigger("mouseover");
                }); 
                
                $('html').addClass("requireAnon");
                // the user is anonymous and should be able to log in
                renderedTemplate = sakai.api.Util.TemplateRenderer(pageNotFoundErrorLoggedOutTemplate, sakai.data.me.user).replace(/\r/g, '');
                $(pageNotFoundError).append(renderedTemplate);
                // Set the link for the sign in button
                var querystring = new Querystring();
                var redurl = window.location.pathname + window.location.hash;
                // Parameter that indicates which page to redirect to. This should be present when
                // the static 403.html and 404.html page are loaded
                if (querystring.contains("redurl")){
                    redurl = querystring.get("redurl");
                }
                $(".login-container button").bind("click", function(){
                    document.location = (gatewayURL + "?url=" + escape(redurl));
                });
            } else {
                // Remove the sakai.index stylesheet as it would mess up the design
                $("LINK[href*='/dev/css/sakai/sakai.index.css']").remove();
                // the user is logged in and should get a page in Sakai itself
                renderedTemplate = sakai.api.Util.TemplateRenderer(pageNotFoundErrorLoggedInTemplate, sakai.data.me.user).replace(/\r/g, '');
                $(pageNotFoundError).append(renderedTemplate);
                $("#page_not_found_error").addClass("error_page_bringdown");
            }
            $goback.click(function(){
                window.history.go(-1);
            });
            $searchinput.live("keydown", function(ev){
                if (ev.keyCode === 13) {
                    document.location = "/search#q=" + $.trim($searchinput.val());
                }
            });
            sakai.api.Security.showPage();
            document.title = document.title + sakai.api.i18n.General.getValueForKey("PAGE_NOT_FOUND");
        };

        doInit();

    };
    sakai.api.Widgets.Container.registerForLoad("nopermissions");    
});

