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
sakai.site_add_members = function() {
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
		$(".manage-members").attr("href", $(".manage-members").attr("href") + "?siteid=" + selectedSite);
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
				$("#siteManage_person" + j).parent().attr("class", "unselected");
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
        $("#selected-people-container").html(sdata.html.Template.render("selected-people-template", {"selectedPeople" : selectedPeople}));
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
    var selectPerson = function(personIndex, isNewSelection) {
       
        if (typeof  json.foundPeople === "undefined") {
             json.foundPeople.results = [];
        }
        if (! json.foundPeople.results[personIndex].selected) {
			if(isNewSelection){
				selectedPeople.push(json.foundPeople.results[personIndex]);
			}
			
            json.foundPeople.results[personIndex].selected = true;
            $("#siteManage_person" +  personIndex , "#siteManage_people").parent().attr("class", "selected");
        }

    };
	/**
	 * checks if the userid is already a member
	 * @param {Object} userid
	 */
	var checkIfUserIDExists =function(userid){
		for (var i = 0; i < json.members.results.length; i++) {
			if(json.members.results[i].userid === userid){
				return true;
			}
		}
		return false;
	};
	/**
	 * renders a list of members
	 * @param {Object} people
	 */
    var renderPeople = function(people) {
        if (typeof(people.results) === "undefined") {
            people.results = [];
        }
        if (people.results.length > 0) {
            for (var i = 0; i < people.results.length; i++) {
				if(typeof people.results[i].content === "string"){
					people.results[i].content = json_parse(people.results[i].content);
                people.results[i].userid = people.results[i].path.split("/")[4];
				}
                
				people.results[i].isMember = checkIfUserIDExists(people.results[i].userid);
            }
            $("#siteManage_people").html(sdata.html.Template.render("siteManage_people_template", people));
            updateSelectedPersons();

            $(".siteManage_person").bind("click",
            function(e, ui) {
                var userindex = parseInt(e.target.parentNode.id.replace("siteManage_person", ""), 10);
                selectPerson(userindex, true);
                updateSelectedPersons();
            });
        }

    };
	/**
	 * select people who were earlier selected on this page
	 */
	var selectCorrectPeople = function(){
		for(var i =0; i< selectedPeople.length; i++){
			for (var j = 0; j < json.foundPeople.results.length; j++) {
				if( json.foundPeople.results[j].userid === selectedPeople[i].userid){
					selectPerson(j,false);
				}
			}
		}
	};
	/**
	 * searches for members
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
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/rest/search?&path=/_private&q=" + peoplesearchterm + "&s=sakai:firstName&s=sakai:lastName&n=" + pageSize + "&p=" + (page - 1) + "&mimetype=text/plain&sid=" + Math.random(),
            onSuccess: function(data) {
                json.foundPeople = json_parse(data);
                renderPeople(json.foundPeople);
				updateSelectedPersons();
				selectCorrectPeople();
				$(".jq_pager").pager({ pagenumber: page, pagecount: Math.ceil( json.foundPeople.size/pageSize), buttonClickCallback: function(pageclickednumber){
					searchPeople(searchterm, parseInt(pageclickednumber, 10), splitChar);
				} });
            },
            onFail: function(status) {
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
	 * gets the site members (for counting) *temporary
	 */
 	var getSiteMembers = function() {
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/_rest/site/members/list/" + selectedSite + "?sid=" + Math.random(),
            onSuccess: function(data) {
                json.members = json_parse(data);
				 var arrPeople = [];
		         $.each(json.members,
		         function(i, val) {
		             val.selected = false;
		             arrPeople.push(val);
		         });
		         json.members.results = arrPeople;
				 
				 if(typeof json.foundPeople !== "undefined"){
				 	renderPeople(json.foundPeople);
				 }
				 
				 
                 $("#manage_members_count").html(getNumMembers(json.members.results));
            },
            onFail: function(status) {
                json.members = {"results" : []};
                $("#manage_members_count").html(getNumMembers(json.members.results));
            }
        });
    };
	getSiteMembers();
	
	var updateSiteMembers = function(addedMembers){
		for(var i = 0 ; i < addedMembers.uuserid.length ; i++){
			json.members.results.push({"userid" : addedMembers.uuserid[i]});
		}
		$("#manage_members_count").html(getNumMembers(json.members.results));
		renderPeople(json.foundPeople);
	}
	
		/**
	 * add/update all selected people to the site
	 */
    var addSelectedPeopleToSite = function() {
		if(typeof json.foundPeople !== "undefined"){
			var dataTemp = getPostData(false);
        	if (dataTemp.uuserid.length > 0) {
            sdata.Ajax.request({
                url: "/_rest/site/members/add/" + selectedSite,
                httpMethod: "POST",
                postData: dataTemp,
                contentType: "application/x-www-form-urlencoded",
                onSuccess: function(data) {
                    updateSiteMembers(dataTemp);
                    selectNone();
                },
                onFail: function(data) {
                    alert(data);
                }
            });
        	}
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
				selectPerson(i, true);
			}
	   	}
	   	updateSelectedPersons();
	   }
    });
    $(".selected_people_addToSite").bind("click",
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
	 
    $("#site_manage_btnSearchCsv").bind("click", function(e,ui){
	 	 $("#site_add_members_search_csv").show();
	 });
	 $("#site_manage_searchViaCsv").bind("click", function(e,ui){
	 	searchPeople($("#site_add_members_search_csv textarea").val(),1,"\n");
		$("#site_add_members_search_csv textarea").val("");
		 $("#site_add_members_search_csv").hide();
	 });

};

sdata.registerForLoad("sakai.site_add_members");