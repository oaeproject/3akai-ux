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

/*global $, sdata, Querystring */

var sakai = sakai || {};
sakai.site_manage_members = function() {
    var json = {};
    var roleToGroup = {};
    var siteJson = {};
    var selectedSite = "";
    var pageSize = 10;
    var currentPage = 1;
    var selectedPeople = [];

   /**
     * Adds ?key=val to the url of ID of the DOM.
     * @param {String} id The DOM id
     * @param {String} key The key you wish to add
     * @param {String} value The value for the key.
     */
    var appendKeyToURL = function(id, key, value) {
        var url = $(id).attr('href');
        // If there is no question mark in the url we add it.
        url += (url.indexOf('?') === -1) ? "?" : "&";
        url += key + "=" + value;
        $(id).attr('href', url);
    };


    /**
     * This will fill in all the field settings for the site.
     */
    var fillBasicSiteSettings = function(siteid) {
        $.ajax({
            url: "/sites/" + siteid + ".json",
            cache: false,
            success: function(response) {
                siteJson = response;
                roleToGroup = sakai.lib.site.authz.getRoleToPrincipalMap(siteJson);
                $("#sitetitle").text(sakai.api.Security.saneHTML(siteJson.name));
            },
            error: function(xhr, textStatus, thrownError) {
                alert("Failed to get the site info.");
            }
        });
    };

    /**
     * gets the sitedid from the url
     */
    var getSiteId = function(){
        var qs = new Querystring();
        selectedSite = qs.get("siteid",false);
        $("#back_to_site_link").attr("href", $("#back_to_site_link").attr("href") + selectedSite);
        $(".s3s-manage-members").attr("href", $(".s3s-manage-members").attr("href") + "?siteid=" + selectedSite);
        $(".siteSettings_appendSiteIDtoURL").each(function(i, el) {
            appendKeyToURL(el, 'siteid', selectedSite);
        });
        fillBasicSiteSettings(selectedSite);
        $("#manage_members_role_rbts").html($.TemplateRenderer("manage_members_role_rbts_template", {"roles" : siteJson["sakai:roles"]}));

    };


    getSiteId();


    /**
     * gets the index of the person in the selectedPeople array
     * @param {Object} person
     */
   var getSelectedIndex = function(person){
        for(var i = 0; i < selectedPeople.length ; i++){
            if(selectedPeople[i]["rep:userId"] === person["rep:userId"]){
                return i;
            }
        }
        return -1;
    };

    /**
     * unselects a person
     * @param {Object} person
     */
    var unselectCorrectPerson = function(person){
        for (var j = 0; j < json.results.length; j++) {
            if( json.results[j]["rep:userId"] === person["rep:userId"]){
                json.results[j].selected = false;
                $("#siteManage_person" + j).removeClass("selected");
                $("#siteManage_person" + j).addClass("unselected");
            }
        }
    };
    /**
     * updates the selectedpersonslist
     */
    var updateSelectedPersons = function() {
        if (typeof json.results === "undefined") {
            json.results = [];
        }
        $("#selected-members-container").html($.TemplateRenderer("selected-people-template", {"selectedPeople" :selectedPeople}));

        $(".selected-person-remove").bind("click",
        function(e, ui) {
            var userindex = parseInt(e.target.id.replace("selected-person-remove", ""), 10);
             unselectCorrectPerson(selectedPeople[userindex]);
            selectedPeople.splice(userindex,1);
            updateSelectedPersons();
        });
    };

    /**
     * selects a person
     * @param {Object} personIndex
     * @param {Object} isNewSelection
     */
    var selectPerson = function(personIndex, isNewSelection, selectAll) {
          if (json.results[personIndex]) {
            if (typeof json.results === "undefined") {
                json.results = [];
            }
            if (!json.results[personIndex].selected) {
                if (isNewSelection) {
                    selectedPeople.push(json.results[personIndex]);
                }

                json.results[personIndex].selected = true;
                $("#siteManage_person" + personIndex).removeClass("unselected");
                $("#siteManage_person" + personIndex).addClass("selected");
            }
            else
                if (!selectAll) {
                    unselectCorrectPerson(json.results[personIndex]);
                    selectedPeople.splice(getSelectedIndex(json.results[personIndex]), 1);
                    updateSelectedPersons();
                }
        }
    };

    /**
     * returns a string stating the number of members
     * @param {integer} nrMembers
     */
    var getNumMembers = function(nrMembers) {
        var numMembers = "";
        if (nrMembers === 1) {
            numMembers = nrMembers + " member";
        }
        else {
            numMembers = nrMembers + " members";
        }
        return numMembers;
    };

    /**
     * renders a list of members
     * @param {Object} members
     * @param {Object} isNew : is this a new list or already updated by javascript code
     */
    var renderMembers = function(members, isNew) {


        var results = members.results;
        for (var i = 0; i < results.length; i++) {
            if (results[i].picture && typeof results[i].picture !== "object") {
                results[i].picture = $.parseJSON(results[i].picture);
                results[i].picture.picPath = "/~" + results[i]["rep:userId"] + "/public/profile/" + results[i].picture.name;
            }
            else {
                results[i].picture = undefined;
            }
            results[i].role = sakai.lib.site.authz.getRole(siteJson, results[i]["member:groups"]);
        }
        var toRender = {};
        toRender.users = results;
        $("#siteManage_members").html($.TemplateRenderer("siteManage_people_template", toRender));
        $("#manage_members_count").html(getNumMembers(json.total));
        $(".siteManage_person").bind("click",
        function(e, ui) {
            if (!$(e.target).hasClass("view-profile-label")) {
                var userindex = parseInt(this.id.replace("siteManage_person", ""), 10);
                var isSelected = false;
                for (var i = 0; i < selectedPeople.length; i++) {
                    if (selectedPeople[i]["rep:userId"] === json.results[userindex]["rep:userId"]) {
                        isSelected = true;
                        break;
                    }
                }
                selectPerson(userindex, !isSelected, false);
                updateSelectedPersons();
            }
        });
        $(".sakai_pager").pager({
            pagenumber: currentPage,
            pagecount: Math.ceil(json.total / pageSize),
            buttonClickCallback: function(pageclickednumber) {
                currentPage = pageclickednumber;
                getSiteMembers($("#txt_member_search").val(), pageclickednumber, "n");
            }
        });


    };
    /**
     * select people who were earlier selected on this page
     */
    var selectCorrectPeople = function(){
        for(var i =0; i< selectedPeople.length; i++){
            for (var j = 0; j < json.results.length; j++) {
                if( json.results[j]["rep:userId"] === selectedPeople[i]["rep:userId"]){
                    selectPerson(j,false,false);
                }
            }
        }
    };

    var doSort = function(a,b){
        if (a["rep:userId"] > b["rep:userId"]){
            return 1;
        } else {
            return -1;
        }
    };

    /**
     * gets all the site members
     * @param {Object} searchTerm
     * @param {Object} page
     * @param {Object} splitChar
     */
    var getSiteMembers = function(searchTerm, page, splitChar) {
        var peoplesearchterm = "";
        if(searchTerm !== null){
            var splitted = searchTerm.split(splitChar);
            var arrSearchTerms = [];
            for (var i = 0; i < splitted.length; i++) {
                if($.trim(splitted[i]) !== ""){
                    arrSearchTerms.push(" " + $.trim(splitted[i]) + "*") ;
                }

            }
            peoplesearchterm = arrSearchTerms.join(" OR ");
            peoplesearchterm = "&q=" + peoplesearchterm;
        }

        var start = pageSize * (page  - 1);
        $.ajax({
            cache: false,
            url: "/sites/" + selectedSite + ".members.json?sort=firstName,asc&start=" + start + "&items=" + pageSize,
            success: function(data) {

                if (typeof data === "string") {
                    data = $.parseJSON(data);
                }

                json = $.extend(data, {}, true);

                //getSiteMembersData(searchTerm, page, splitChar);
                renderMembers(json,true);

            },
            error: function(xhr, textStatus, thrownError) {
                json = {};
                renderMembers(json,true);
            }

        });
    };
    getSiteMembers(null, 1,",");
    var getPendingJoinRequests = function() {
        $.getJSON("/var/joinrequests/pending.json", {"site": selectedSite}, function(data) {
            var toRender = {};
            toRender.requesters = data.results;
            if(data.results.length > 0) {
                $("#siteManage_pending-requests-title").show();
                $("#siteManage_requests").html($.TemplateRenderer("siteManage_requests_template", toRender));
                $(".accept-sitejoin").bind("click",function(ev){
                    var from = this.id.replace("accept_link_", "")
                    var sitePath = '/sites/' + selectedSite;
                    $.ajax({
                        url: sitePath + ".approve.html",
                        type: "POST",
                        data : {"user":from},
                        success: function(data){
                            $("#siteManage_requester_" + from).fadeOut().remove();
                            getSiteMembers(null, 1, ",");
                        }
                    });
                });
                $(".deny-sitejoin").bind("click",function(ev){
                    var from = this.id.replace("deny_link_", "")
                    var sitePath = '/sites/' + selectedSite;
                    $.ajax({
                        url: sitePath + ".deny.html",
                        type: "POST",
                        data : {"user":from},
                        success: function(data){
                            $("#siteManage_requester_" + from).fadeOut().remove();
                        }
                    });
                });
            }
        });
    }
    getPendingJoinRequests();


    var filterMembers = function(search){
        if (search) {
            for (var i = 0; i < json.results.length; i++) {
                var toShow = false;
                if (typeof json.results[i].firstName === "object"){
                    json.results[i].firstName = json.results[i].firstName[0];
                }
                if (typeof json.results[i].lastName === "object"){
                    json.results[i].email = json.results[i].lastName[0];
                }
                if (typeof json.results[i].email === "object"){
                    json.results[i].email = json.results[i].email[0];
                }
                if ((json.results[i].firstName + " " + json.results[i].lastName).toLowerCase().indexOf(search.toLowerCase()) !== -1){
                    toShow = true;
                }
                if (json.results[i].email && json.results[i].email.toLowerCase().indexOf(search.toLowerCase()) !== -1){
                    toShow = true;
                }
                if (toShow){
                    $("#siteManage_person" + i).show();
                } else {
                    $("#siteManage_person" + i).hide();
                }
            }
        } else {
            $(".siteManage_person").show();
        }
    };

    /**
     * returns a json-object containing userids and membertokens
     * @param {Object} isRemove
     */
    var getPostData = function(isRemove) {

       var selectedValue = $('input[name=membership_role]:checked').val();
        var userids = [];
        var roles = [];
        for (var i = 0; i <  selectedPeople.length; i++) {
                userids.push( selectedPeople[i]["rep:userId"]);
                if (isRemove) {
                    roles.push(selectedPeople[i].role);
                }
                else {
                    roles.push(selectedValue);
                }
        }
        return {
            'uuserid': userids,
            'membertoken': roles
        };
    };
    /**
     * removes an array of items from another json.users
     * @param {Object} arrItems
     */
    var removeItemsFromArray = function(arrItems) {
         if(json.results.length === arrItems.length){
             json.results = [];
         }
         else{
             for (var i = 0; i < arrItems.length; i++) {
                json.results.splice(json.results.indexOf(arrItems[i]), 1);
            }
         }
        updateSelectedPersons();
        renderMembers(json,false);

    };

    /**
     * unselects all selections
     */
    var selectNone = function() {
      selectedPeople = [];
        for (var i = 0; i < json.results.length; i++) {
            if (json.results[i].selected) {
                json.results[i].selected = false;
            }
        }
        $(".members-container li").attr("class", "unselected");


    };

    /**
     * removes all selected members
     */
    var deleteSelectedMembers = function() {
        var dataTemp = getPostData(true);
        var userCount = dataTemp.uuserid.length;
        if (userCount > 0) {
            var groupDeletions = {};
            var group;
            for (var i = 0; i < userCount; i++) {
                group = roleToGroup[dataTemp.membertoken[i]];
                groupDeletions[group] = groupDeletions[group] || [];
                groupDeletions[group].push(dataTemp.uuserid[i]);
            }
            var actions = [];
            for (group in groupDeletions) {
                if (groupDeletions.hasOwnProperty(group)) {
                    actions.push({
                        url: "/system/userManager/group/" + group + ".update.json",
                        data: {
                            ":member@Delete": groupDeletions[group]
                        }
                    });
                }
            }
            sakai.lib.batchPosts(actions);

            var toRemove = [];
            for(var i =0; i< userCount; i++){
              for (var j = 0; j < json.results.length; j++) {
                if( json.results[j]["rep:userId"] === dataTemp.uuserid[i]){
                  toRemove.push(json.results[j]);
                }
              }
            }
            removeItemsFromArray(toRemove);

            // Create an activity item for rmoving members from site
            var activityMsg = "The folowing members were removed from the site \"" + siteJson.name + "\": <br/>";

            for (var i = 0, il = toRemove.length; i < il; i++) {
                activityMsg += "<a href=\"/dev/profile.html?user=" + toRemove[i]["rep:userId"] + "\">" + toRemove[i].firstName + " " + toRemove[i].lastName + "</a>";
            }

            var nodeUrl = siteJson["jcr:path"];
            var activityData = {
                "sakai:activityMessage": activityMsg,
                "sakai:activitySiteName": siteJson.name,
                "sakai:activitySiteId": siteJson["jcr:name"]
            }
            sakai.api.Activity.createActivity(nodeUrl, "site", "default", activityData);

        }
    };

    /**
     * update all selected people memberships
     */
    var changeSelectedPeopleRoles = function(){
        var dataTemp = getPostData(false);
        var roleChanges = {};
        for (var i = 0; i < dataTemp.uuserid.length; i++) {
            // Find the selected person's current membership.
            for (var m = 0; m < json.results.length; m++) {
                if (dataTemp.uuserid[i] === json.results[m]["rep:userId"]) {
                    var newRole = dataTemp.membertoken[i];
                    var oldRole = json.results[m]["role"];
                    if (newRole !== oldRole) {
                        roleChanges[newRole] = roleChanges[newRole] || {};
                        roleChanges[newRole].additions = roleChanges[newRole].additions || [];
                        roleChanges[newRole].additions.push(dataTemp.uuserid[i]);
                        roleChanges[oldRole] = roleChanges[oldRole] || {};
                        roleChanges[oldRole].deletions = roleChanges[oldRole].deletions || [];
                        roleChanges[oldRole].deletions.push(dataTemp.uuserid[i]);
                    }
                    break;
                }
            }
        }
        // TODO Switching roles should be an atomic operation.
        var actions = [];
        for (var role in roleChanges) {
            if (roleChanges.hasOwnProperty(role)) {
                var data = {};
                if (roleChanges[role].additions) {
                    data[":member"] = roleChanges[role].additions;
                }
                if (roleChanges[role].deletions) {
                    data[":member@Delete"] = roleChanges[role].deletions;
                }
                actions.push({
                    url: "/system/userManager/group/" + roleToGroup[role] + ".update.html",
                    data: data
                });
            }
        }
        var success = function(data){
            getSiteMembers(null, 1, "");
            selectNone();
        };
        if (actions.length > 0) {
            sakai.lib.batchPosts(actions, success);
        } else {
            success();
        }
    };

    $("#txt_member_search").bind("focus",
    function(e, ui) {
        if ($("#txt_member_search").css("color") !== "rgb(0, 0, 0)") {
            $("#txt_member_search").val("");
            $("#txt_member_search").css({
                color: "#000000"
            });
        }
    });
    $("#btn_members_filter").bind("click",
    function(e, ui) {
          filterMembers($("#txt_member_search").val());
    });
    $("#txt_member_search").bind("keydown",
    function(e, ui) {
        if (e.keyCode === 13) {
           filterMembers($("#txt_member_search").val());
        }

    });
    $("#btn_members_selectAll").bind("click",
    function(e, ui) {
        for (var i = 0; i < json.results.length; i++) {
            selectPerson(i,true,true);
        }
        updateSelectedPersons();
    });
    $(".s3s-selected_people_addToSite").bind("click",
    function(e, ui) {
        changeSelectedPeopleRoles();

    });
    $("#btn_members_selectNone").bind("click",
    function(e, ui) {
        selectNone();
        updateSelectedPersons();
    });

    $("#selected_members_delete").bind("click",
    function(e, ui) {
        deleteSelectedMembers();
        selectedPeople = [];
        updateSelectedPersons();
    });
     $("#site_add_members_search_csv .jqmClose").bind("click", function(e,ui){
         $("#site_add_members_search_csv textarea").val("");
          $("#site_add_members_search_csv").hide();
     });

    $("#site_manage_btnSearchCsv").bind("click", function(e,ui){
          $("#site_add_members_search_csv").show();
     });
     $("#site_manage_searchViaCsv").bind("click", function(e,ui){
        getSiteMembers($("#txt_member_search").val(), 1,"\n");
        $("#site_add_members_search_csv textarea").val("");
         $("#site_add_members_search_csv").hide();
     });


};

sakai.api.Widgets.Container.registerForLoad("sakai.site_manage_members");
