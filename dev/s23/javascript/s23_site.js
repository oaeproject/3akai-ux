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

/*global sakai, Config, $, QueryString */

sakai.s23_site = sakai.s23_site || {};

sakai.s23_site = function(){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////

    var qs = new Querystring(); // Get the current query string
    var completeJSON;

    // CSS selectors
    var s23Site = "#s23_site";
    var s23SiteIframeContainer = $(s23Site + "_iframe_container");
    var s23SiteMenuActive = "s23_site_menu_item_active";
    var s23SiteMenuContainer = $(s23Site + "_menu_container");
    var s23SiteMenuItemTag = "s23_site_menu_item_";
    var s23SiteMenuItems = s23Site + "_menu_container ul li a";
    var s23SitePageContainerClass = ".s23_site_page_container";
    var s23SitePageContainerTag = "s23_site_page_container_";
    var s23SiteTitle = $(s23Site + "_title");

    // Templates
    var s23SiteIframeContainerTemplate = "s23_site_iframe_container_template";
    var s23SiteMenuContainerTemplate = "s23_site_menu_container_template";

    // see: http://www.ietf.org/rfc/rfc2396.txt Appendix B
    var urlRegExp = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");

    ///////////////////////
    // General functions //
    ///////////////////////

    /**
     * Check to see if both URLs are in the same origin. See: http://en.wikipedia.org/wiki/Same_origin_policy.
     * @param {String} url1
     * @param {String} url2
     * @return {Boolean}
     *     true: in the same origin policy
     *     false: NOT in the same origin policy
     */
    var isSameOriginPolicy = function(url1, url2){
        if(url1 == url2) {
            return true;
        }
        // console.log(isUrl(url1) + ": " + url1 + "=" + urlRegExp.exec(url1)[4]);
        // console.log(isUrl(url2) + ": " + url2 + "=" + urlRegExp.exec(url2)[4]);
        // i.e. protocol, domain (and optional port numbers) must match
        if((urlRegExp.exec(url1)[2] == urlRegExp.exec(url2)[2]) &&
           (urlRegExp.exec(url1)[4] == urlRegExp.exec(url2)[4])){
            return true;
        } else {
            return false;
        }
    };

    /**
     * Get all the information about a certain page
     * @param {String} pageid The id of the page you want information for
     * @return {Object} A page object containing the info about the page
     */
    var getPageInfo = function(pageid){

        // Run over all the pages and return the page object that has the same
        // id as the pageid argument
        for (var i = 0, len = completeJSON.site.pages.length; i < len; i++) {
            if (completeJSON.site.pages[i].id === pageid) {
                return completeJSON.site.pages[i];
            }
        }

        // Log a message if the page with the given pageid was not found
        debug.error("s23_site: the page with id'" + pageid + "' was not found in the json object");
        return false;
    };

    /**
     * Load the tools for a certain page
     * @param {Object} pageid The id of the page you want the tools loaded for
     */
    var loadPageTools = function(pageid){

        // Get the page info for a certain page and store it in a variable
        var page = getPageInfo(pageid);

        // Check if the page actually exists
        if(page){

            // Hide the content & tools from the other pages
            $(s23SitePageContainerClass, s23SiteIframeContainer).hide();

            // Get the complete id for a page container
            var completexid = s23SitePageContainerTag + page.xid;

            // Check if the page was already loaded before
            if($("#"+completexid).length > 0){

                // Show the page container
                $("#"+completexid).show();
            }else{

                // Render the tools of the site and add them to the page container
                s23SiteIframeContainer.append($.TemplateRenderer(s23SiteIframeContainerTemplate, page));
                var loadIframe = function() {
                    $(this).height($(this).contents().find("body").height() + 15); // add 10px for IE and 5px more for Gradebook weirdness
                };
                for (var tool in page.tools){
                    if (page.tools.hasOwnProperty(tool)) {
                        var iframe = $("#Main" + page.tools[tool].xid);
                        var srcUrl = sakai.config.SakaiDomain + "/portal/tool/" + page.tools[tool].url + "?panel=Main";
                        if(isSameOriginPolicy(window.location.href, srcUrl)) {
                            iframe.load(loadIframe);
                        }
                        iframe.attr("src", srcUrl);
                    }
                }
            }
        }
    };

    /**
     * Transform an id to an xid
     * @param {String} id The id you want to transform to an xid
     */
    var toxid = function(id){

        // Filter out all the ! and - characters and replace them by x
        return id.replace(/-|\!/g, "x");
    };

    /**
     * Create an xid for every page & tool that exists
     * We need this because the iframe looks at the parent frame with the xid (tool)
     * and because we put every page in a specific div (page)
     * An url could be     0175d73d-741f-4fb3-94dc-9f8c1d4925a9
     * An xid is        0175d73dx741fx4fb3x94dcx9f8c1d4925a9
     */
    var createxids = function(){

        // Run over all the pages and then all the tools inside a page to modify the xid
        for (var i=0, len=completeJSON.site.pages.length; i<len; i++) {
            completeJSON.site.pages[i].xid = toxid(completeJSON.site.pages[i].id);
            if (completeJSON.site.pages[i].tools && completeJSON.site.pages[i].tools.length>0) {
                for (var j = 0, toolslen = completeJSON.site.pages[i].tools.length; j < toolslen; j++) {
                    completeJSON.site.pages[i].tools[j].xid = toxid(completeJSON.site.pages[i].tools[j].url);
                }
            }
        }
    };

    /**
     * Add binding to several items
     */
    var addBinding = function(){

        /*
         * Bind a click handler to every site menu item
         */
        $(s23SiteMenuItems).click(function(ev){

            // Prevent going to the actual page
            ev.preventDefault();

            // Get the id of the tool you clicked on
            var id = this.id.replace(s23SiteMenuItemTag, "");

            // Remove the active class from the previous selected item
            $(s23SiteMenuItems).removeClass(s23SiteMenuActive);

            // Set the active class to the item you just clicked on
            $(this).addClass(s23SiteMenuActive);

            // Load the tools for a specific page
            loadPageTools(id);
        });
    };

    /**
     * Parse the site info that is in a JSON format
     * to show it on the page
     */
    var parseSakai2SiteInfo = function(){

        // Check if the title and the pages attribute exist
        if (completeJSON && completeJSON.site && completeJSON.site.title && completeJSON.site.pages) {

            // Set the title of the page
            s23SiteTitle.text(sakai.api.Security.saneHTML(completeJSON.site.title));

            // Render the menu of the workspace
            s23SiteMenuContainer.html($.TemplateRenderer(s23SiteMenuContainerTemplate, completeJSON));

            // Create xid's
            createxids();

            // Add binding to the tools links
            addBinding();

            // Pretend like you clicked on the first page
            $(s23SiteMenuItems + ":first").trigger("click");
        }
        else {
            debug.error("s23_site: An error occured when parsing the Sakai 2 site information");
        }
    };

    /**
     * Get the information of a Sakai2 site
     * @param {String} siteid The id of the Sakai2 site you want to
     */
    var getSakai2SiteInfo = function(siteid){

        // Send an Ajax request to the sakai2 tools service
        $.ajax({
            url: sakai.config.URL.SAKAI2_TOOLS_SERVICE.replace(/__SITEID__/, siteid),
            dataType: "json",
            success: function(data){

                completeJSON = $.extend(data, {}, true);
                
                // Parse the Sakai2 info
                parseSakai2SiteInfo();
            },
            error: function(xhr, textStatus, thrownError) {
                debug.error("s23_site: It was not possible to get the information the Sakai 2 site with the id: " + siteid + " the error code is: " + xhr.status);
            }
        });
    };


    /////////////////////////////
    // Initialisation function //
    /////////////////////////////

    /**
     * Function that get executed when the DOM is completely loaded
     */
    var init = function(){

        // Check if the query string contains the parameter id
        if (qs.contains("id")) {

            // Get the value for the id parameter
            var siteid = qs.get("id");

            // Send an ajax request to the user
            getSakai2SiteInfo(siteid);
        }
        else {

            // Log an error message for the user
            debug.error("s23site: This site needs to have an id parameter for a sakai2 site");
        }
    };
    init();
};
sakai.api.Widgets.Container.registerForLoad("sakai.s23_site");