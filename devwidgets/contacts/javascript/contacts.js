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
 */
/*global $ */

require(["jquery", "sakai/sakai.api.core"], function($, sakai){

    /**
     * @name sakai_global.contacts
     *
     * @class contacts
     *
     * @description
     * Initialize the contacts widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.contacts = function(tuid, showSettings){

        var $rootel = $("#" + tuid);
        var contactsContainer = "#contacts_container";
        var contactsAcceptedTemplate = "contacts_accepted_template";
        var contactsInvitedTemplate = "contacts_invited_template";
        var contactsInvitedContainer = "#contacts_invited_container";
        var contactsShowGrid = ".s3d-listview-grid"
        var contactsShowList = ".s3d-listview-list"
        var contacts = {  // global data for contacts widget
            totalItems: 0,
            itemsPerPage: 10,
            currentPagenum: 1,
            sortBy: "_lastModified",
            sortOrder: "desc",
            accepted: false,
            invited: false,
            listStyle: "list",
            query: ""
        };

        /**
         * Compare the names of 2 contact objects
         *
         * @param {Object} a
         * @param {Object} b
         * @return 1, 0 or -1
         */
        var contactSort = function (a, b) {
            if (a.details.lastName.toLowerCase() > b.details.lastName.toLowerCase()) {
                return 1;
            } else {
                if (a.details.lastName.toLowerCase() === b.details.lastName.toLowerCase()) {
                    return 0;
                } else {
                    return -1;
                }
            }
        };

        var acceptRequest = function(user){
            sakai.api.User.acceptContactInvite(user);
        };

        var removeRequest = function(user){
            $.ajax({
                url: "/~" + sakai.api.Util.safeURL(sakai.data.me.user.userid) + "/contacts.remove.html",
                type: "POST",
                data: {
                    "targetUserId": user
                },
                success: function(data){
                    $(window).trigger("lhnav.updateCount", ["contacts", -1]);
                    $("#contacts_delete_contacts_dialog").jqmHide();
                    $("div[data-userid='" + user + "']").remove();
                }
            });
        };

        var checkAddingEnabled = function(){
            if($(".contacts_select_contact_checkbox:checked")[0]){
                $("#contacts_addpeople_button").removeAttr("disabled");
                $("#contacts_message_button").removeAttr("disabled");
            } else {
                $("#contacts_addpeople_button").attr("disabled", true);
                $("#contacts_message_button").attr("disabled", true);
                $("#contacts_select_checkbox").removeAttr("checked");
            }
        };

        var renderContacts = function(dataObj){
            // Sort
            if(dataObj.invited && dataObj.invited.results){
                dataObj.invited.results = dataObj.invited.results.sort(contactSort);
            }
            dataObj.accepted.results = dataObj.accepted.results.sort(contactSort);
            if (contacts.sortOrder === "desc") {
                dataObj.accepted.results.reverse();
            }

            // Render
            $(contactsContainer).html(sakai.api.Util.TemplateRenderer(contactsAcceptedTemplate, dataObj));
            $(contactsInvitedContainer).html(sakai.api.Util.TemplateRenderer(contactsInvitedTemplate, dataObj));

            // Decide to show the pager
            showPager(contacts.currentPagenum);

            // Set list style
            contacts.listStyle = $.bbq.getState("cls") || "list";
            if(contacts.listStyle === "grid"){
                $(contactsShowGrid, $rootel).click();
            }

            // Anonymous users only get to see the search and sort options
            // Header is hidden for everybody when no connections are made with contacts for a user
            if(sakai.data.me.user.anon){
                $(".s3d-page-header-bottom-row", $rootel).hide();
                if (!dataObj.accepted.results.length && !contacts.query) {
                    $(".s3d-page-header-top-row", $rootel).hide();
                } else {
                    $(".s3d-page-header-top-row", $rootel).show();
                }
            // If there are no results the bottom header bar should not be shown
            } else if (!dataObj.accepted.results.length) {
                if(!contacts.query){
                    $(".s3d-page-header-top-row", $rootel).hide();
                }
                $(".s3d-page-header-bottom-row", $rootel).hide();
            // The user is not anonymous and there are results.
            } else {
                $(".s3d-page-header-top-row", $rootel).show();
                $(".s3d-page-header-bottom-row", $rootel).show();
            }
        };

        var determineRenderContacts = function(){
            if (sakai_global.profile.main.mode.value !== "view") {
                if (contacts.accepted && contacts.invited) {
                    var json = {
                        "accepted": contacts.accepted,
                        "invited": contacts.invited,
                        "sakai": sakai
                    };
                    renderContacts(json);
                }
            }else{
                if(contacts.accepted){
                    var json = {
                        "accepted": contacts.accepted,
                        "invited": false,
                        "sakai": sakai
                    };
                    renderContacts(json);
                }
            }
        };

        var getAccepted = function(){
            var url = "";
            var data = {
                "q": contacts.query,
                "page": contacts.currentPagenum - 1,
                "items": contacts.itemsPerPage,
                "sortOn": contacts.sortBy,
                "sortOrder": contacts.sortOrder
            };
            if(contacts.query){
                url = "/var/contacts/find.infinity.json?state=ACCEPTED"
            } else if (sakai_global.profile.main.mode.value !== "view"){
                url = sakai.config.URL.SEARCH_USERS_ACCEPTED + "?state=ACCEPTED";
            }else{
                url = "/var/contacts/findbyuser.json";
                data.userid= sakai_global.profile.main.data.userid;
            }

            $.ajax({
                url: url,
                cache: false,
                async: true,
                data: data,
                success: function(data){
                    $.each(data.results, function(index, user){
                        if (sakai.api.User.checkIfConnected(user.details.targetUserId)){
                            user.connected = true;
                        } else {
                            user.connected = false;
                        }
                    })
                    contacts.totalItems = data.total;
                    contacts.accepted = data;
                    for (var i in contacts.accepted.results) {
                        contacts.accepted.results[i].linkTitle = sakai.api.i18n.getValueForKey("VIEW_USERS_PROFILE").replace("{user}", sakai.api.User.getDisplayName(contacts.accepted.results[i].profile)); 
                    }
                    determineRenderContacts();
                }
            });
        };

        $(window).bind("sakai.addToContacts.requested", function(ev, userToAdd){
            $('.sakai_addtocontacts_overlay').each(function(index) {
                if ($(this).attr("sakai-entityid") === userToAdd.uuid){
                    $(this).hide();
                    $("#left_filler_"+userToAdd.uuid).show();
                }
            });
        });

        var getPendingFromOther= function(){
            $.ajax({
                url: sakai.config.URL.CONTACTS_FIND_STATE + "?state=INVITED&page=0&items=1000",
                cache: false,
                async: true,
                success: function(data){
                    contacts.invited = data;
                    for (var i in contacts.invited.results) {
                        contacts.invited.results[i].linkTitle = sakai.api.i18n.getValueForKey("VIEW_USERS_PROFILE").replace("{user}", sakai.api.User.getDisplayName(contacts.invited.results[i].profile)); 
                    }
                    determineRenderContacts();
                }
            });
        };

        var getContacts = function(){
            if (sakai_global.profile.main.mode.value !== "view") {
                getAccepted();
                getPendingFromOther();
            }
            else {
                getAccepted();
            }
        };

        /**
         * Show the given page of accepted contacts.
         *
         * @param {int} pagenum The page number you want to display (not 0-indexed)
         */
        var showAccepted = function (pagenum) {
            showPager(pagenum);
            getAccepted();
        };

        /**
         * Show the pager at the bottom of the page.
         *
         * @param {int} pagenum The number of the current page (not 0-indexed)
         */
        var showPager = function (pagenum) {
            contacts.currentPagenum = pagenum;
            if (Math.ceil(contacts.totalItems / contacts.itemsPerPage) > 1) {
                $("#contacts_pager").pager({
                    pagenumber: pagenum,
                    pagecount: Math.ceil(contacts.totalItems / contacts.itemsPerPage),
                    buttonClickCallback: showAccepted
                });
            }
        };

        var updateMessageAndAddToData = function(){
            var idArr = [];
            var nameArr = [];
            $.each($(".contacts_select_contact_checkbox:checked"), function(i, user){
                idArr.push($(user).data("userid"));
                nameArr.push($(user).data("username"));
            });
            $("#contacts_message_button").attr("sakai-entityid", idArr);
            $("#contacts_message_button").attr("sakai-entityname", nameArr);
            $("#contacts_addpeople_button").data("entityid", idArr);
            $("#contacts_addpeople_button").data("entityname", nameArr);
        };

        var bindEvents = function(){
            $(".contacts_add_to_contacts").live("click", function(){
                acceptRequest($(this)[0].id.split("contacts_add_to_contacts_")[1]);
            });

            $("#contacts_delete_contacts_dialog").jqm({
                modal: true,
                overlay: 20,
                toTop: true,
            });

            $(".s3d-actions-delete").live("click", function(){
                $("#contacts_contact_to_delete").text($(this).data("sakai-entityname"));
                $("#contacts_delete_contact_confirm").data("sakai-entityid", $(this).data("sakai-entityid"));
                $("#contacts_delete_contacts_dialog").jqmShow();
            });

            $("#contacts_delete_contact_confirm").live("click", function(){
                removeRequest($(this).data("sakai-entityid"));
            });

            $(window).bind("contacts.accepted.sakai", getContacts);

            $("#contacts_select_checkbox").change(function(){
                if($(this).is(":checked")){
                    $("#contacts_addpeople_button").removeAttr("disabled");
                    $("#contacts_message_button").removeAttr("disabled");
                    $(".contacts_select_contact_checkbox").attr("checked", true);
                } else{
                    $("#contacts_addpeople_button").attr("disabled", true);
                    $("#contacts_message_button").attr("disabled", true);
                    $(".contacts_select_contact_checkbox").removeAttr("checked");
                }
                updateMessageAndAddToData();
            });

            $(".contacts_select_contact_checkbox").live("change", function(){
                checkAddingEnabled();
                updateMessageAndAddToData();
            });

            $("#contacts_sortby").change(function () {
                var sortSelection = this.options[this.selectedIndex].value;
                if (sortSelection === "desc") {
                    contacts.sortOrder = "desc";
                    $.bbq.pushState({"cso": "desc"});
                } else {
                    contacts.sortOrder = "asc";
                    $.bbq.pushState({"cso": "asc"});
                }
            });

            $(contactsShowList, $rootel).click(function(){
                $("#contacts_container div .contacts_list_items", $rootel).removeClass("s3d-search-results-grid");
                $(".s3d-listview-options", $rootel).find("div").removeClass("selected");
                $(this).addClass("selected");
                $(this).children().addClass("selected");
                $.bbq.pushState({"cls": "list"});
            });

            $(contactsShowGrid, $rootel).click(function(){
                $("#contacts_container div .contacts_list_items", $rootel).addClass("s3d-search-results-grid");
                $(".s3d-listview-options", $rootel).find("div").removeClass("selected");
                $(this).addClass("selected");
                $(this).children().addClass("selected");
                $.bbq.pushState({"cls": "grid"});
            });

            $(window).bind("hashchanged.contacts.sakai", function(){
                getContacts();
            });

            $("#contacts_search_input").live("keyup", function(ev){
                var q = $.trim($(this).val());
                if (q !== contacts.query && ev.keyCode === 13) {
                    contacts.query = q;
                    $.bbq.pushState({"cq": q});
                }
            });

            $("#contacts_search_button").live("click", function(ev){
                var q = $.trim($("#contacts_search_input").val());
                if (q !== contacts.query) {
                    contacts.query = q;
                    $.bbq.pushState({"cq": q});
                }
            })
        };

        var doInit = function(){
            contacts.sortOrder = $.bbq.getState("cso") || "asc";
            $("#contacts_sortby").val(contacts.sortOrder);
            contacts.query = $.bbq.getState("cq") || "";
            $("#contacts_search_input").val(contacts.query);
            getContacts();
            bindEvents();
        };

        doInit();

    };
    sakai.api.Widgets.widgetLoader.informOnLoad("contacts");

});
