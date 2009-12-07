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
		$(".manage-members").attr("href", $(".manage-members").attr("href") + "?siteid=" + selectedSite);
		$(".siteSettings_appendSiteIDtoURL").each(function(i, el) {
            appendKeyToURL(el, 'siteid', selectedSite);
        });
		fillBasicSiteSettings(selectedSite);
		$("#manage_members_role_rbts").html($.Template.render("manage_members_role_rbts_template", {"roles" : Config.Site.Roles}));
		
	};
	
	
	/**
     * This will fill in all the field settings for the site.
     */
    var fillBasicSiteSettings = function(siteid) {
        $.ajax({
            url: "/sites/" + siteid + ".json",
			cache: false,
            success: function(response) {
                var json = $.evalJSON(response);
				$("#sitetitle").text(json.name);
            },
            error: function(status) {
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
		for (var j = 0; j < json.members.length; j++) {
			if( json.members[j]["rep:userId"] === person["rep:userId"]){
				json.members[j].selected = false;
				$("#siteManage_person" + j).removeClass("selected");
				$("#siteManage_person" + j).addClass("unselected");
			}
		}
	};
	/**
	 * updates the selectedpersonslist
	 */
    var updateSelectedPersons = function() {
        if (typeof json.members === "undefined") {
            json.members = [];
        }
        $("#selected-members-container").html($.Template.render("selected-people-template", {"selectedPeople" :selectedPeople}));

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
	  	if (json.members[personIndex]) {
			if (typeof json.members === "undefined") {
				json.members = [];
			}
			if (!json.members[personIndex].selected) {
				if (isNewSelection) {
					selectedPeople.push(json.members[personIndex]);
				}
				
				json.members[personIndex].selected = true;
				$("#siteManage_person" + personIndex).removeClass("unselected");
				$("#siteManage_person" + personIndex).addClass("selected");
			}
			else 
				if (!selectAll) {
					unselectCorrectPerson(json.members[personIndex]);
					selectedPeople.splice(getSelectedIndex(json.members[personIndex]), 1);
					updateSelectedPersons();
				}
		}
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
	 * renders a list of members
	 * @param {Object} members
	 * @param {Object} isNew : is this a new list or already updated by javascript code
	 */
    var renderMembers = function(members, isNew) {
		 	for (var i = 0; i < members.length; i++) {
				if(typeof members[i].picture !== "undefined" && $.evalJSON(members[i].picture).name){
					members[i].picture = $.evalJSON(members[i].picture);
				} else {
					members[i].picture = undefined;
				}
				
				var isViewer = false;
				var isCollaborator = false;
				
				for (var g = 0; g < members[i]["member:groups"].length; g++){
					if (members[i]["member:groups"][g] === "g-" + selectedSite + "-collaborators"){
						members[i].role = "Collaborator";
					} 
					if (members[i]["member:groups"][g] === "g-" + selectedSite + "-viewers"){
						members[i].role = "Viewer";
					} 
				}
				
            }
			var toRender = {};
			toRender.users = members;
			$("#siteManage_members").html($.Template.render("siteManage_people_template", toRender));
		 	$("#manage_members_count").html(getNumMembers(toRender.users));
            $(".siteManage_person").bind("click",
            function(e, ui) {
				if (!$(e.target).hasClass("view-profile-label")) {
					var userindex = parseInt(this.id.replace("siteManage_person", ""), 10);
					var isSelected = false;
					for (var i = 0; i < selectedPeople.length; i++) {
						if (selectedPeople[i]["rep:userId"] === json.members[userindex]["rep:userId"]) {
							isSelected = true;
							break;
						}
					}
					selectPerson(userindex, !isSelected, false);
					updateSelectedPersons();
				}
            });
			
        
    };
	/**
	 * select people who were earlier selected on this page
	 */
	var selectCorrectPeople = function(){
		for(var i =0; i< selectedPeople.length; i++){
			for (var j = 0; j < json.members.length; j++) {
				if( json.members[j]["rep:userId"] === selectedPeople[i]["rep:userId"]){
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
		
		// Until paging and server-side filtering are sorted out,
		// retrieve enough site members to approximate "all".
        $.ajax({
            cache: false,
			url: "/sites/" + selectedSite + ".members.json?items=10000",
            success: function(data) {
                json.members = $.evalJSON(data).results;
				
                //getSiteMembersData(searchTerm, page, splitChar);
				 json.members.sort(doSort);
				 renderMembers(json.members,true);
				
            },
            error: function(status) {
                json.members = {};
                renderMembers(json.members,true);
            }
			
        });
    };
    getSiteMembers(null, 1,",");
	
	
	var filterMembers = function(search){
		if (search) {
			for (var i = 0; i < json.members.length; i++) {
				var toShow = false;
				if (typeof json.members[i].firstName === "object"){
					json.members[i].firstName = json.members[i].firstName[0];
				}
				if (typeof json.members[i].lastName === "object"){
					json.members[i].email = json.members[i].lastName[0];
				}
				if (typeof json.members[i].email === "object"){
					json.members[i].email = json.members[i].email[0];
				}
				if ((json.members[i].firstName + " " + json.members[i].lastName).toLowerCase().indexOf(search.toLowerCase()) !== -1){
					toShow = true;
				}
				if (json.members[i].email && json.members[i].email.toLowerCase().indexOf(search.toLowerCase()) !== -1){
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
	}
	
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
	 * removes an array of items from another json.members.users
	 * @param {Object} arrItems
	 */
    var removeItemsFromArray = function(arrItems) {
		 if(json.members.length === arrItems.length){
		 	json.members = [];
		 }
		 else{
		 	for (var i = 0; i < arrItems.length; i++) {
            	json.members.splice(json.members.indexOf(arrItems[i]), 1);
        	}
		 }
        updateSelectedPersons();
		renderMembers(json.members,false);
		
    };
	
	/**
	 * unselects all selections
	 */
    var selectNone = function() {
      selectedPeople = [];
        for (var i = 0; i < json.members.length; i++) {
            if (json.members[i].selected) {
                json.members[i].selected = false;
            }
        }
        $(".members-container li").attr("class", "unselected");
        
		
    };
	
	/**
	 * removes all selected members
	 */
    var deleteSelectedMembers = function() {
        var dataTemp = getPostData(true);
		if (dataTemp.uuserid.length > 0) {
			
			var done = 0;
			var toDo = dataTemp.uuserid.length;
				
			for (var i = 0; i < dataTemp.uuserid.length; i++){
				var userid = "../../user/" + dataTemp.uuserid[i];
				var group = false;
				for (var u = 0; u < json.members.length; u++){
					if (json.members[u]["rep:userId"] == dataTemp.uuserid[i]){
						if (json.members[u].role == "Viewer"){
							group = "g-" + selectedSite + "-viewers";
						} else if (json.members[u].role == "Collaborator"){
							group = "g-" + selectedSite + "-collaborators";
						}
					}
				}
				$.ajax({
					url: "/system/userManager/group/" + group + ".update.html",
					type: "POST",
					success: function(data){
						done++;
						if (done === toDo) {
							var arrItemsToRemove = [];
		                    for (var m = 0; m < json.members.length; m++) {
		                        if (json.members[m].selected === true) {
		                            arrItemsToRemove.push(json.members[m]);
		                        }
		                    }
		                    removeItemsFromArray(arrItemsToRemove);	
						}
					},
					error: function(status){
						done++;
						if (done === toDo) {
							alert(data);
						}
					},
					data: {
						":member@Delete": userid
					}
				});
			}
			
		}

    };
	
	var updateToDo = 0;
	var updateDone = 0;
	
	/**
	 * add/update all selected people to the site
	 */
	var addSelectedPeopleToSite = function(){
		
		updateToDo = 0;
		updateDone = 0;
		var dataTemp = getPostData(false);
		var group = "collaborators";
		var othergroup = "viewers";
		if (dataTemp.membertoken == "Viewer" || dataTemp.membertoken[0] == "Viewer"){
			group = "viewers";
			othergroup = "collaborators";
		}
		var toProcess = [];
		for (var i = 0; i < dataTemp.uuserid.length; i++){
			for (var m = 0; m < json.members.length; m++){
				if (dataTemp.uuserid[i] === json.members[m]["rep:userId"]){
					if (json.members[m].role == "Viewer" && group == "collaborators"){
						toProcess.push(dataTemp.uuserid[i]);
					}
					if (json.members[m].role == "Collaborator" && group == "viewers"){
						toProcess.push(dataTemp.uuserid[i]);
					}
				}
			}
		}
		
		if (toProcess.length === 0){
			
			getSiteMembers(null, 1, "");
			selectNone();
			
		} else {
		
			updateToDo = toProcess.length;
			updateDone = 0;
			
			for (var i = 0; i < toProcess.length; i++) {
				
				var userid = "../../user/" + toProcess[i];
				doIndividualUpdate(userid, group, othergroup);
				
			}
			
		}

	};
	
	var doIndividualUpdate = function(userid, group, othergroup){
		$.ajax({
			url: "/system/userManager/group/g-" + selectedSite + "-" + othergroup + ".update.html",
			type: "POST",
			success: function(data){
				$.ajax({
					url: "/system/userManager/group/g-" + selectedSite + "-" + group + ".update.html",
					type: "POST",
					success: function(data){
						updateDone++;
						if (updateDone === updateToDo) {
							getSiteMembers(null, 1, "");
							selectNone();
						}
					},
					error: function(status){
						updateDone++;
						if (updateDone === updateToDo) {
							alert(data);
						}
					},
					data: {
						":member": userid
					}
				});
			},
			error: function(status){
				updateDone++;
				if (updateDone === updateToDo) {
					alert(data);
				}
			},
			data: {
				":member@Delete": userid
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
        for (var i = 0; i < json.members.length; i++) {
            selectPerson(i,true,true);
        }
        updateSelectedPersons();
    });
    $(".selected_people_addToSite").bind("click",
    function(e, ui) {
        addSelectedPeopleToSite();

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

sdata.container.registerForLoad("sakai.site_manage_members");