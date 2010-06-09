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
sakai.site_add_members = function() {
    var json = {};
    var roleToGroup = {};
    var siteJson = {};
    var selectedSite = "";
    var pageSize = 10;
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
                $("#sitetitle").text(siteJson.name);
                $("#manage_members_role_rbts").html($.TemplateRenderer("manage_members_role_rbts_template", {"roles" : siteJson["sakai:roles"]}));
                getSiteMembershipRequests();
            },
            error: function(xhr, textStatus, thrownError) {
                alert("Failed to get the site info.");
            }
        });
    };

    getSiteId();

        /**
     * gets the index of the person in the selectedPeople array
     * @param {Object} person
     */
    var getSelectedIndex = function(person){
        for(var i = 0; i < selectedPeople.length ; i++){
            if(selectedPeople[i].userid === person.userid){
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
        for (var j = 0; j < json.foundPeople.results.length; j++) {
            if( json.foundPeople.results[j].userid === person.userid){
                json.foundPeople.results[j].selected = false;
                $("#siteManage_person" + j).attr("class", "unselected");
            }
        }
    };
    /**
     * updates the selectedpersonslist
     */
    var updateSelectedPersons = function() {
          if (typeof json.foundPeople === "undefined") {
            json.foundPeople = {
                'results': []
            };
        }
        $("#selected-people-container").html($.TemplateRenderer("selected-people-template", {"selectedPeople" : selectedPeople}));
        $("#selected-people-container").show();
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

        if (typeof  json.foundPeople === "undefined") {
             json.foundPeople.results = [];
        }
        if (! json.foundPeople.results[personIndex].selected) {
            if(isNewSelection){
                selectedPeople.push(json.foundPeople.results[personIndex]);
            }

            json.foundPeople.results[personIndex].selected = true;
            $("#siteManage_person" +  personIndex , "#siteManage_people").attr("class", "selected");
        }
        else if(!selectAll){
             unselectCorrectPerson(json.foundPeople.results[personIndex]);
            selectedPeople.splice(getSelectedIndex(json.foundPeople.results[personIndex]),1);
            updateSelectedPersons();
        }

    };

    var checkRole = function(userid){

        if (json & json.foundPeople & json.foundPeople & json.foundPeople.results & json.foundPeople.results.length > 0) {
            var results = json.foundPeople.results;

            for (var i = 0, il = results.length; i < il; i++) {
                if (typeof results[i]["rep:userId"] === "object") {
                    json.foundPeople.results[i]["rep:userId"] = results[i]["rep:userId"][0];
                }
                if (results[i]["rep:userId"] === userid) {
                    return sakai.lib.site.authz.getRole(siteJson, results[i]["member:groups"]);
                }
            }

        }

        return "";
    };

    /**
     * renders a list of members
     * @param {Object} people
     */
    var renderPeople = function(people) {
        if (typeof(people.results) === "undefined") {
            people.results = [];
        }

        for (var i = 0; i < people.results.length; i++) {
            if (people.results[i].picture && typeof people.results[i].picture === "string") {
                people.results[i].picture = $.parseJSON(people.results[i].picture);
                parseJSONople.results[i].picture.picPath = "/_user" + people.results[i].path + "/public/profile/" + people.results[i].picture.name;
            }
            else {
                people.results[i].picture = {};
            }
            people.results[i].userid = people.results[i]["rep:userId"];
            var existingRole = checkRole(people.results[i].userid);
            if (existingRole) {
                people.results[i].isMember = true;
                people.results[i].role = existingRole;
            }
        }
        $("#siteManage_people").html($.TemplateRenderer("siteManage_people_template", people));
        updateSelectedPersons();

        $(".siteManage_person").bind("click",
        function(e, ui) {
            if (!$(e.target).hasClass("view-profile-label")) {
                var userindex = parseInt(this.id.replace("siteManage_person", ""), 10);
                selectPerson(userindex, true, false);
                updateSelectedPersons();
            }
        });

        if (people.results.length > 0) {
            $(".sakai_pager").show();
        } else {
            $(".sakai_pager").hide();
        }

    };
    /**
     * select people who were earlier selected on this page
     */
    var selectCorrectPeople = function(){
        for(var i =0; i< selectedPeople.length; i++){
            for (var j = 0; j < json.foundPeople.results.length; j++) {
                if( json.foundPeople.results[j].userid === selectedPeople[i].userid){
                    selectPerson(j,false,false);
                }
            }
        }
    };
    /**
     * searches for people, whether they're already members of the site or not
     * TODO The search needs to support a contextual argument to indicate that an
     * existing site membership role should be returned with other information
     * about the person.
     * @param {Object} searchterm
     * @param {Object} page
     * @param {Object} splitChar
     */
    var searchPeople = function(searchterm,page, splitChar) {

        var splitted = searchterm.split(splitChar);
        var arrSearchTerms = [];
        for (var i = 0; i < splitted.length; i++) {
            if($.trim(splitted[i]) !== ""){
                    arrSearchTerms.push(" " + $.trim(splitted[i]) + "*") ;
                }
        }
        var peoplesearchterm = arrSearchTerms.join(" OR ");
        $.ajax({
            cache: false,
            url: "/var/search/users?username=" + peoplesearchterm + "&items=" + pageSize + "&page=" + (page - 1),
            success: function(data) {
                json.foundPeople = $.extend(data, {}, true);
                renderPeople(json.foundPeople);
                updateSelectedPersons();
                selectCorrectPeople();
                $(".jq_pager").pager({ pagenumber: page, pagecount: Math.ceil( json.foundPeople.total/pageSize), buttonClickCallback: function(pageclickednumber){
                    searchPeople(searchterm, parseInt(pageclickednumber, 10), splitChar);
                } });
            },
            error: function(xhr, textStatus, thrownError) {
                json.foundPeople = {};
                renderPeople(json.foundPeople);
            }
        });
    };

        /**
     * returns a string stating the number of members
     * @param {Object} arrPeople
     */
    var getNumMembers = function(arrPeople) {
        var numMembers = "";
        if (arrPeople.length === 1) {
            numMembers = arrPeople.length + " member";
        }
        else {
            numMembers = arrPeople.length + " members";
        }
        return numMembers;
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
                userids.push( selectedPeople[i].userid);
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
     * unselects all selections
     */
    var selectNone = function() {
           selectedPeople = [];
           if (typeof json.foundPeople !== "undefined") {
           for (var i = 0; i < json.foundPeople.results.length; i++) {
               if (json.foundPeople.results[i].selected) {
                   json.foundPeople.results[i].selected = false;
               }
           }
           $(".members-container li").attr("class", "unselected");
           updateSelectedPersons();
           }
    };
    /**
     * gets the site members
     * TODO This is part of some broken logic: SAKIII-98
     */
    var getSiteMembers = function(){
        $.ajax({
            cache: false,
            url: "/sites/" + selectedSite + ".members.json",
            success: function(data){
                json.members = $.extend(data, {}, true).results;
                var arrPeople = [];
                $.each(json.members, function(i, val){
                    val.selected = false;
                    arrPeople.push(val);
                });
                json.members.results = arrPeople;

                if (typeof json.foundPeople !== "undefined") {
                    renderPeople(json.foundPeople);
                }
            },
            onFail: function(status){
                json.members = {
                    "results": []
                };
                $("#manage_members_count").html(getNumMembers(json.members.results));
            }
        });
    };
    getSiteMembers();

    var updateSiteMembers = function(addedMembers){
        getSiteMembers();
    };

    /**
     * add all selected people to the site
     */
    var addSelectedPeopleToSite = function() {
        if(typeof json.foundPeople !== "undefined"){
            var dataTemp = getPostData(false);
            if (dataTemp.uuserid.length > 0) {
                var group = roleToGroup[dataTemp.membertoken[0]];
                var newMembers = [];
                for (var i = 0; i < dataTemp.uuserid.length; i++) {
                    var userid = dataTemp.uuserid[i];
                    newMembers.push(userid);
                }
                $.ajax({
                    url: "/system/userManager/group/" + group + ".update.html",
                    type: "POST",
                    data: {
                        ":member": newMembers,
                        "_charset_":"utf-8"
                    },
                    traditional: true,
                    success: function(data){
                            updateSiteMembers(dataTemp);
                            selectNone();
                            sakai.lib.notifications.showNotification("Site management", "New member(s) were succesfully added", "normal", false, "/dev/_images/inbox_folders_messages.gif");
                    },
                    error: function(xhr, textStatus, thrownError) {
                        alert("Failed to add these members.");
                    }
                });
            }
        }

    };
    
    /**
     * Membership Requests 
     */
     
     /**
      * Retrieves pending membership requests for the site
      */
     var getSiteMembershipRequests = function() {
       console.log("getSiteMembershipRequests");
       $.ajax({
           cache: false,
           url:"/var/joinrequests/pending.json?site=" + siteJson.id,
           success: function(data) {
             console.log(data);
             renderPeopleRequests(data.foundPeople);
           }, 
           error: function(xhr, textStatus, thrownError) {
             console.log(error);
           }
         });
     };
     
     /**
        * renders a list of people who requested to join the site
        * @param {Object} people
        */
       var renderPeopleRequests = function(people) {
           if (typeof(people.results) === "undefined") {
               people.results = [];
           }

           for (var i = 0; i < people.results.length; i++) {
               if (people.results[i].picture && typeof people.results[i].picture === "string") {
                   people.results[i].picture = $.parseJSON(people.results[i].picture);
                   parseJSONople.results[i].picture.picPath = "/_user" + people.results[i].path + "/public/profile/" + people.results[i].picture.name;
               }
               else {
                   people.results[i].picture = {};
               }
               people.results[i].userid = people.results[i]["rep:userId"];
               var existingRole = checkRole(people.results[i].userid);
               if (existingRole) {
                   people.results[i].isMember = true;
                   people.results[i].role = existingRole;
               }
           }
           $("#siteManage_requests").html($.TemplateRenderer("siteManage_request_template", people));
           updateSelectedPersons();

           $(".siteManage_person_request").bind("click",
           function(e, ui) {
               if (!$(e.target).hasClass("view-profile-label")) {
                   var userindex = parseInt(this.id.replace("siteManage_person_request", ""), 10);
                   selectPerson(userindex, true, false);
                   updateSelectedPersons();
               }
           });

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
    $("#btn_members_search").bind("click",
    function(e, ui) {

        searchPeople($("#txt_member_search").val(),1,",");
    });
    $("#txt_member_search").bind("keydown",
    function(e, ui) {
        if (e.keyCode === 13) {
            searchPeople($("#txt_member_search").val(), 1, ",");
        }

    });
    $("#btn_members_selectAll").bind("click",
    function(e, ui) {
       if (typeof json.foundPeople !== "undefined") {
           for (var i = 0; i < json.foundPeople.results.length; i++) {
            if(!json.foundPeople.results[i].isMember){
                selectPerson(i, true,true);
            }
           }
           updateSelectedPersons();
       }
    });
    $(".s3s-selected_people_addToSite").bind("click",
    function(e, ui) {
        addSelectedPeopleToSite();

    });
    $("#btn_members_selectNone").bind("click",
    function(e, ui) {
        selectNone();
    });
     $("#site_add_members_search_csv .jqmClose").bind("click", function(e,ui){
         $("#site_add_members_search_csv textarea").val("");
          $("#site_add_members_search_csv").hide();
     });

     $("#site_add_members_search_csv").jqm({
        modal: true,
        trigger: $('#site_manage_btnSearchCsv'),
        overlay: 20,
        toTop: true
    });

     $("#site_manage_searchViaCsv").bind("click", function(e,ui){
         searchPeople($("#site_add_members_search_csv textarea").val(),1,"\n");
        $("#site_add_members_search_csv textarea").val("");
         $("#site_add_members_search_csv").hide();
     });

};

sakai.api.Widgets.Container.registerForLoad("sakai.site_add_members");
