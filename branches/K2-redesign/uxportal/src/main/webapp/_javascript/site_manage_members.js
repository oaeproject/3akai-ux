var sakai = sakai || {};
var $ = $ ||
function() {
    throw "JQuery undefined";
};
var sdata = sdata ||
function() {
    throw "sdata undefined";
};
var Querystring = Querystring ||
function() {
    throw "Querystring undefined";
};
var json_parse = json_parse || 
function(){
	throw "json_parse undefined";
};

sakai.site_manage_members = function() {
    var json = {};
    var selectedSite = "";
	var pageSize = 10;
	var selectedPeople = [];
   
   	/**
   	 * gets the sitedid from the url
   	 */
	var getSiteId = function(){
		var qs = new Querystring();
		selectedSite = qs.get("siteid",false);
		$("#back_to_site_link").attr("href", $("#back_to_site_link").attr("href") + selectedSite);
		$(".manage-members").attr("href", $(".manage-members").attr("href") + "?siteid=" + selectedSite);
		
		$("#manage_members_role_rbts").html(sdata.html.Template.render("manage_members_role_rbts_template", {"roles" : Config.Site.Roles}));
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
		for (var j = 0; j < json.members.users.length; j++) {
			if( json.members.users[j].userid === person.userid){
				json.members.users[j].selected = false;
				$("#siteManage_person" + j).parent().attr("class", "unselected");
			}
		}
	};
	/**
	 * updates the selectedpersonslist
	 */
    var updateSelectedPersons = function() {
        if (typeof json.members === "undefined") {
            json.members = {
                'users': []
            };
        }
        $("#selected-members-container").html(sdata.html.Template.render("selected-people-template", {"selectedPeople" :selectedPeople}));

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
      
        if (typeof json.members === "undefined") {
            json.members.users = [];
        }
        if (!json.members.users[personIndex].selected) {
			if(isNewSelection){
				selectedPeople.push(json.members.users[personIndex]);
			}
			
            json.members.users[personIndex].selected = true;
            $("#siteManage_person" +  personIndex ).parent().attr("class", "selected");
        }
		else if(!selectAll){
 			unselectCorrectPerson(json.members.users[personIndex]);
			selectedPeople.splice(getSelectedIndex(json.members.users[personIndex]),1);
            updateSelectedPersons();
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
		 	for (var i = 0; i < members.users.length; i++) {
				members.users[i].userid = members.users[i].userStoragePrefix.split("/")[3];
				if(typeof members.users[i].profile.picture !== "undefined"){
						members.users[i].profile.picture = json_parse(members.users[i].profile.picture);
				}
            }
            $("#siteManage_members").html(sdata.html.Template.render("siteManage_people_template", json.members));
            $("#manage_members_count").html(getNumMembers(json.members.users));
            $(".siteManage_person").bind("click",
            function(e, ui) {
                var userindex = parseInt(e.target.parentNode.id.replace("siteManage_person", ""), 10);
                selectPerson(userindex,true,false);
                updateSelectedPersons();
            });
			
        
    };
	/**
	 * select people who were earlier selected on this page
	 */
	var selectCorrectPeople = function(){
		for(var i =0; i< selectedPeople.length; i++){
			for (var j = 0; j < json.members.users.length; j++) {
				if( json.members.users[j].userid === selectedPeople[i].userid){
					selectPerson(j,false,false);
				}
			}
		}
	};
	
	var getSiteMembersData = function(searchTerm ,page,splitChar){
		var sMembers = ""
		var roles = [];
		 $.each(json.members,
	        function(i, val) {
	            val.selected = false;
	            sMembers += val.userid + ",";
				roles.push(val.role);
	       });
		 sdata.Ajax.request({
            httpMethod: "GET",
            url: "/rest/me/" + sMembers.substring(0, sMembers.length -1),
            onSuccess: function(data) {
                json.members = json_parse(data);
				for(var i = 0 ; i < roles.length ; i++){
					json.members.users[i].role = roles[i];
				}
               	renderMembers(json.members,true);
				selectCorrectPeople();
				$(".jq_pager").pager({ pagenumber: page, pagecount: Math.ceil( json.members.users.length/pageSize), buttonClickCallback: function(pageclickednumber){
					getSiteMembers(searchTerm, parseInt(pageclickednumber, 10), splitChar);
				} });
				
            },
            onFail: function(status) {
                json.members = {};
                renderMembers(json.members,true);
            }
			
        });
		
				
	}
	
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
		
		
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/_rest/site/members/list/" + selectedSite + "?mimetype=text/plain"  + peoplesearchterm + "&n=" +  pageSize + "&p=" + (page - 1)  + "&sid=" + Math.random(),
            onSuccess: function(data) {
                json.members = json_parse(data);
				
                getSiteMembersData(searchTerm, page, splitChar);
				
            },
            onFail: function(status) {
                json.members = {};
                renderMembers(json.members,true);
            }
			
        });
    };
    getSiteMembers(null, 1,",");
	
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
	 * removes an array of items from another json.members.users
	 * @param {Object} arrItems
	 */
    var removeItemsFromArray = function(arrItems) {
		 if(json.members.users.length === arrItems.length){
		 	json.members.users = [];
		 }
		 else{
		 	for (var i = 0; i < arrItems.length; i++) {
            	json.members.users.splice(json.members.users.indexOf(arrItems[i]), 1);
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
        for (var i = 0; i < json.members.users.length; i++) {
            if (json.members.users[i].selected) {
                json.members.users[i].selected = false;
            }
        }
        $(".members-container li").attr("class", "unselected");
        
		
    };
	
	/**
	 * removes all selected members
	 */
    var deleteSelectedMembers = function() {
        var data = getPostData(true);
        if (data.uuserid.length > 0) {
            sdata.Ajax.request({
                url: "/_rest/site/members/remove/" + selectedSite,
                httpMethod: "POST",
                postData: data,
                contentType: "application/x-www-form-urlencoded",
                onSuccess: function(data) {
                    var arrItemsToRemove = [];
                    for (var i = 0; i < json.members.users.length; i++) {
                        if (json.members.users[i].selected === true) {
                            arrItemsToRemove.push(json.members.users[i]);
                        }
                    }
                    removeItemsFromArray(arrItemsToRemove);
					
                },
                onFail: function(data) {
                    alert(data);
                }
            });
        }

    };

	/**
	 * add/update all selected people to the site
	 */
    var addSelectedPeopleToSite = function() {
        var data = getPostData(false);
        if (data.uuserid.length > 0) {
            sdata.Ajax.request({
                url: "/_rest/site/members/add/" + selectedSite,
                httpMethod: "POST",
                postData: data,
                contentType: "application/x-www-form-urlencoded",
                onSuccess: function(data) {
                    getSiteMembers(null, 1,"");
                    selectNone();
                },
                onFail: function(data) {
                    alert(data);
                }
            });
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
    $("#btn_members_search").bind("click",
    function(e, ui) {
		 getSiteMembers($("#txt_member_search").val(), 1,",");
    });
    $("#txt_member_search").bind("keydown",
    function(e, ui) {
        if (e.keyCode === 13) {
           getSiteMembers($("#txt_member_search").val(), 1,",");
        }

    });
    $("#btn_members_selectAll").bind("click",
    function(e, ui) {
        for (var i = 0; i < json.members.users.length; i++) {
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

sdata.registerForLoad("sakai.site_manage_members");