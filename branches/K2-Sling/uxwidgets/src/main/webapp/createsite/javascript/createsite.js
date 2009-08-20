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

/*global $, sdata, Config */

var sakai = sakai || {};

sakai.createsite = function(tuid,placement,showSettings){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	// - ID
	var createSite = "#createsite";
	
	// Class 
	var createSiteNoncourseTemplateClass = "createsite_noncourse_template";
	
	// Container
	var createSiteContainer = createSite + "_container";
	
	// Course
	var createSiteCourse = createSite + "_course";
	var createSiteCourseContainer = createSiteCourse + "_container";
	//var createSiteCourseDetails = createSiteCourse + "_details"; TODO
	var createSiteCourseRequest = createSiteCourse + "_request";
	
	// Course requested
	var createSiteCourseRequested = createSiteCourse + "_requested";
	var createSiteCourseRequestedContainer = createSiteCourseRequested + "_container";
	
	// Coursesite
	var createSiteCoursesiteContainer = createSite + "_coursesite_container";
	
	// Non course
	var createSiteNoncourse = createSite + "_noncourse";
	var createSiteNoncourseCancel = createSiteNoncourse + "_cancel";
	var createSiteNoncourseContainer = createSiteNoncourse + "_container";
	var createSiteNoncourseDescription = createSiteNoncourse + "_description";
	var createSiteNoncourseId = createSiteNoncourse + "_id";
	var createSiteNoncourseName = createSiteNoncourse + "_name";
	var createSiteNoncourseProcess = createSiteNoncourse + "_process";
	var createSiteNoncourseSave = createSiteNoncourse + "_save";
	var createSiteNoncourseUrl = createSiteNoncourse + "_url";
	
	// Option
	var createSiteOption = createSite + "_option";
	var createSiteOptionCourse = createSiteOption + "_course";
	var createSiteOptionNoncourse = createSiteOption + "_noncourse";


	///////////////////////
	// Utility functions //
	///////////////////////
	
	var withMembers  = false;
	
	/**
	 * Public function that can be called from elsewhere
	 * (e.g. chat and sites widget)
	 * It initializes the createsite widget and shows the jqmodal (ligthbox)
	 */
	sakai.createsite.initialise = function(members){
		if (members){
			
			// Filter out myself
			var todelete = -1;
			for (var i = 0; i < members.items.length; i++){
				if (members.items[i].userid == sdata.me.user.userid){
					todelete = i;
				}
			}
			if (todelete != -1) {
				members.items.splice(todelete, 1);
			}
			
			// Put me in as first element
			var item = {};
			item.name = sdata.me.profile.firstName + " " + sdata.me.profile.lastName;
			item.userid = sdata.me.user.userid;
			item.picture = Config.URL.PERSON_ICON_URL;
			if (sdata.me.profile.picture && $.evalJSON(sdata.me.profile.picture).name){
				item.picture = "/_user/public/" + sdata.me.user.userid + "/" + $.evalJSON(sdata.me.profile.picture).name;
			}
			members.items.unshift(item);
			
			withMembers = members;
			
			$(".description_fields").hide();
			$(".member_fields").show();
			$("#members_to_add").html($.Template.render("members_to_add_template", members));
			
		} else {
			$(".description_fields").show();
			$(".member_fields").hide();
			withMembers = false;
		}
		$("#createsite_course_requested_container").hide();
		$("#createsite_course_container").hide();
		$("#createsite_noncourse_container").show();
		$("#createsite_coursesite_container").show();
		$(createSiteContainer).jqmShow();
	};
	
	/**
	 * Show or hide the process div and hide/shows the buttons
	 * @param {Boolean} show
	 * 	true: show the process div and hide the buttons
	 * 	false: hide the process div and show the buttons
	 */
	var showProcess = function(show){
		if(show){
			$(createSiteNoncourseCancel).hide();
			$(createSiteNoncourseSave).hide();
			$(createSiteNoncourseProcess).show();
		}else{
			$(createSiteNoncourseProcess).hide();
			$(createSiteNoncourseCancel).show();
			$(createSiteNoncourseSave).show();
		}
	};
	
	/**
	 * Show or hide the course/noncourse containers
	 * @param {Boolean} show
	 * 	true: show the course container and hide the noncourse container
	 * 	false: hide the course container and show the noncourse container
	 */
	var showCourse = function(show){
		if(show){
			$(createSiteNoncourseContainer).hide();
			$(createSiteCourseContainer).show();
		}else{
			$(createSiteCourseContainer).hide();
			$(createSiteNoncourseContainer).show();
		}
	};
	
	/**
	 * Replace or remove malicious characters from the string
	 * We use this function to modify the siteid
	 * String to test against: test :?=&;\/?@+$<>#%'"''{}|\\^[]'
	 * @param {Object} input The string where the characters need to be replaced
	 */
	var replaceCharacters = function(input){
		input = input.toLowerCase().replace(/ /g,"-");
		
		var regexp = new RegExp("[^a-z0-9_-]", "gi");
		input = input.replace(regexp,"_");
		
		return input;
	};


	////////////////////
	// Request a site //
	////////////////////
	
	/**
	 * TODO (for now it just hides/shows divs)
	 */
	var requestSite = function(){
		$(createSiteCourseContainer).hide();
		$(createSiteCoursesiteContainer).hide();
		$(createSiteCourseRequestedContainer).show();
	};


	///////////////////
	// Create a site //
	///////////////////
	
	/**
	 * Create the actual site.
	 * Sends information to the server about the site you are making.
	 */
	var saveSite = function(){
		
		// Get the values from the input text and radio fields
		var sitetitle = $(createSiteNoncourseName).val() || "";
		var sitedescription = $(createSiteNoncourseDescription).val() || "";
		var siteid = replaceCharacters($(createSiteNoncourseId).val());
		
		// Check if there is a site id or site title defined
		if (!siteid || sitetitle === "")
		{
			alert("Please specify a id and title.");
			return;
		}
		
		// Add the correct params send to the create site request
		// Site type is course/project or default
		
		var sitetemplate = $('input[name=' + createSiteNoncourseTemplateClass + ']:checked').val();
		
		var parameters = {
			//"sling:resourceType" : "sakai/site",
			"name" : sitetitle,
			"sakai:title" : sitetitle,
			"description" : sitedescription,
			"id" : siteid,
			":sitepath": "/" + siteid,
			"sakai:skin" : "/dev/_skins/original/original.html",
			"status" : "online",
			"access" : "everyone",
			"sakai:site-template" : "/templates/" + sitetemplate
		};

		// Hide the buttons and show the process status
		showProcess(true);


		//url : Config.URL.SITE_GET_SERVICE + "/" + siteid,
		$.ajax({
			url: "/sites/" + siteid + ".json",
			success : function(data) {
				showProcess(false);
				alert("A site with this URL already exists");
			},
			error : function(status) {
				switch(status){
					case 401:
						showProcess(false);
						alert("You are not logged in, please log in again.");
						break;

					case 404:
						$.ajax({
							//url: Config.URL.SITE_CREATE_SERVICE + "/" + siteid,
							//url: "/sites/" + siteid,
							url: "/sites.createsite.json",
							type: "POST",
							success: function(data){
								
								$.ajax({
									//url: Config.URL.SITE_CREATE_SERVICE + "/" + siteid,
									//url: "/sites/" + siteid,
									url: "/sites/" + siteid,
									type: "POST",
									success: function(data){
										createNavigation(siteid);
									},
									error: function(status){
										alert("An error occured");
									},
									data: {
										"name" : sitetitle,
										"description" : sitedescription,
										"id" : siteid,
										"sakai:skin" : "/dev/_skins/original/original.html",
										"status" : "online",
										"sakai:site-template" : "/templates/template"
									}
								});
								
								
							},
							error: function(status){
								showProcess(false);
								
								if (status === 409) {
									alert("A site with this URL already exists");
								}
								else {
									alert("An error has occured whilst creating the site");
								}
							},
							data: parameters
						});
						break;

					default:
						showProcess(false);
						alert("And error occured whilst creating the site.");
				}
			}
		});
	};
	
	var createNavigation = function(siteid){
		var tosave = '<p><img id="widget_navigation_id759008084__sites/' + siteid + '/_pages/home" class="widget_inline" style="display:block; padding: 10px; margin: 4px" src="/devwidgets/navigation/images/icon.png" border="1" alt="" /></p><p><img id="widget_siterecentactivity_id669827676__sites/' + siteid + '/_pages/home" class="widget_inline" style="display:block; padding: 10px; margin: 4px" src="/devwidgets/siterecentactivity/images/icon.png" border="1" alt="" /></p>';
		sdata.widgets.WidgetPreference.save("/sites/" + siteid + "/_navigation","content",tosave, function(){
			setWidgetsPermissions(siteid);
		});
	};
	
	/**
	 * Set the permissions of the widget folder in the site you are creating
	 * In the future this should happen in the back-end of the site
	 * @param {String} siteid
	 */
	var setWidgetsPermissions = function(siteid){
		sdata.widgets.WidgetPreference.save("/sites/" + siteid + "/_widgets","created",'Widget settings + data', function(){
			$.ajax({
				url: "/sites/" + siteid + "/_widgets" + ".modifyAce.json",
				type: "POST",
				success: function(data){
					createCollaboratorGroup(siteid);
				},
				error: function(status){
					createCollaboratorGroup(siteid);
				},
				data: {
					"principalId":"everyone",
					"privilege@jcr:all":"granted"
				}
			});
		});			
	};

	var createCollaboratorGroup = function(siteid){
		$.ajax({
			url: "/system/userManager/group.create.html",
			type: "POST",
			success: function(data){
				createViewersGroup(siteid);
			},
			error: function(status){
				alert("Failed to create group!");
				return;
				createViewersGroup(siteid);
			},
			data: {
				":name": "g-" + siteid + "-collaborators"
			}
		});
	};
	
	var createViewersGroup = function(siteid){
		$.ajax({
			url: "/system/userManager/group.create.html",
			type: "POST",
			success: function(data){
				addGroupsToSite(siteid);
			},
			error: function(status){
				alert("Failed to create group!");
				return;
				addGroupsToSite(siteid);
			},
			data: {
				":name": "g-" + siteid + "-viewers"
			}
		});
	};
	
	var addGroupsToSite = function(siteid){
		$.ajax({
			url: "/sites/" + siteid,
			type: "POST",
			success: function(data){
				addSiteToCollaborators(siteid);
			},
			error: function(status){
				addSiteToCollaborators(siteid);
			},
			data: {
				"sakai:authorizables": ["g-" + siteid + "-collaborators","g-" + siteid + "-viewers"]
			}
		});
	};
	
	var addSiteToCollaborators = function(siteid){
		$.ajax({
			url: "/system/userManager/group/" + "g-" + siteid + "-collaborators" + ".update.html",
			type: "POST",
			success: function(data){
				addSiteToViewers(siteid);
			},
			error: function(status){
				addSiteToViewers(siteid);
			},
			data: {
				"sakai:site": ["/sites/" + siteid]
			}
		});
	};
	
	var addSiteToViewers = function(siteid){
		$.ajax({
			url: "/system/userManager/group/" + "g-" + siteid + "-viewers" + ".update.html",
			type: "POST",
			success: function(data){
				addMeToCollaborators(siteid);
			},
			error: function(status){
				addMeToCollaborators(siteid);
			},
			data: {
				"sakai:site": ["/sites/" + siteid]
			}
		});
	};
	
	var addMeToCollaborators = function(siteid){
		$.ajax({
			url: "/system/userManager/group/" + "g-" + siteid + "-collaborators" + ".update.html",
			type: "POST",
			success: function(data){
				if (withMembers) {
					addUserToCollaborators(siteid);
				} else {
					setGroupMaintenance1(siteid);
				}
			},
			error: function(status){
				if (withMembers) {
					addUserToCollaborators(siteid);
				} else {
					setGroupMaintenance1(siteid);
				}
			},
			data: {
				":member": "../../user/" + sdata.me.user.userid
			}
		});
	};
	
	var addUserToCollaborators = function(siteid){
		var boxes = $("#members_to_add input[@type=checkbox]:checked");
		var toadd = [];
		for (var i = 0; i < boxes.length; i++){
			toadd[toadd.length] = "../../user/" + boxes[i].value;
		}
		$.ajax({
			url: "/system/userManager/group/" + "g-" + siteid + "-viewers" + ".update.html",
			type: "POST",
			success: function(data){
				setGroupMaintenance1(siteid);
			},
			error: function(status){
				setGroupMaintenance1(siteid);
			},
			data: {
				":member": toadd
			}
		});
	};

	var setGroupMaintenance1 = function(siteid){
		/* $.ajax({
			url: "/system/userManager/group/" + "g-" + siteid + "-collaborators" + ".update.html",
			type: "POST",
			success: function(data){
				setGroupMaintenance2(siteid);
			},
			error: function(status){
				setGroupMaintenance2(siteid);
			},
			data: {
				"sakai:delegatedGroupAdmin": "g-" + siteid + "-collaborators",
			}
		}); */
		setGroupMaintenance2(siteid);
	};
	
	var setGroupMaintenance2 = function(siteid){
		/* $.ajax({
			url: "/system/userManager/group/" + "g-" + siteid + "-viewers" + ".update.html",
			type: "POST",
			success: function(data){
				setSiteACL1(siteid);
			},
			error: function(status){					
				setSiteACL1(siteid);
			},
			data: {
				"sakai:delegatedGroupAdmin": "g-" + siteid + "-collaborators",
			}
		}); */
		setSiteACL1(siteid);
	};

	var setSiteACL1 = function(siteid){
		$.ajax({
			url: "/sites/" + siteid + ".modifyAce.json",
			type: "POST",
			success: function(data){
				setSiteACL2(siteid);
			},
			error: function(status){
				setSiteACL2(siteid);
			},
			data: {
				"principalId":"g-" + siteid + "-collaborators",
				"privilege@jcr:read":"granted",
				"privilege@jcr:removeChildNodes":"granted",
				"privilege@jcr:removeNode":"granted",
				"privilege@jcr:write":"granted",
				"privilege@jcr:modifyProperties":"granted",
				"privilege@jcr:addChildNodes":"granted",
				"privilege@jcr:modifyAccessControl":"granted"
				//"privilege@jcr:all":"granted"
			}
		});
	};
	
	var setSiteACL2 = function(siteid){
		$.ajax({
			url: "/sites/" + siteid + ".modifyAce.json",
			type: "POST",
			success: function(data){
				setSiteACL3(siteid);
			},
			error: function(status){
				setSiteACL3(siteid);
			},
			data: {
				"principalId":"g-" + siteid + "-viewers",
				"privilege@jcr:read":"granted"
			}
		});
	};
	
	var setSiteACL3 = function(siteid){
		$.ajax({
			url: "/sites/" + siteid + ".modifyAce.json",
			type: "POST",
			success: function(data){
				setSiteACL4(siteid);
			},
			error: function(status){
				setSiteACL4(siteid);
			},
			data: {
				"principalId":"registered",
				"privilege@jcr:read":"granted"
			}
		});
	};
	
	var setSiteACL4 = function(siteid){
		$.ajax({
			url: "/sites/" + siteid + ".modifyAce.json",
			type: "POST",
			success: function(data){
				document.location = "/sites/" + siteid;
			},
			error: function(status){
				document.location = "/sites/" + siteid;
			},
			data: {
				"principalId":"everyone",
				"privilege@jcr:read":"granted"
			}
		});
	};
	
	//document.location = "/" + siteid;

	////////////////////
	// Event Handlers //
	////////////////////

	/*
	 * Add jqModal functionality to the container.
	 * This makes use of the jqModal (jQuery Modal) plugin that provides support
	 * for lightboxes
	 */
	$(createSiteContainer).jqm({
		modal: true,
		overlay: 20,
		toTop: true
	});
	
	/*
	 * Add binding to the save button (create the site when you click on it)
	 */
	$(createSiteNoncourseSave).click(function(){
		saveSite();
	});
	
	/*
	 * Add binding to the request button
	 * Sends an email to the server with details about the request;
	 */
	$(createSiteCourseRequest).click(function(){
		requestSite();
	});
	
	/*
	 * When you change something in the name of the site, it first removes the bad characters
	 * and then it shows the edited url in the span
	 */
	$(createSiteNoncourseName).bind("change", function(ev){
		var entered = replaceCharacters($(this).val());
		$(createSiteNoncourseId).val(entered);
	});
    
	/*
	 * Show the course window
	 */
	$(createSiteOptionCourse).bind("click", function(ev){
		showCourse(true);
	});
	
	/*
	 * Show the noncourse window
	 */
	$(createSiteOptionNoncourse).bind("click", function(ev){
		showCourse(false);
	});


	/////////////////////////////
	// Initialisation function //
	/////////////////////////////	

	var doInit = function(){
		
		// Set the text of the span containing the url of the current site
		// e.g. http://celestine.caret.local:8080/site/
		$(createSiteNoncourseUrl).text(document.location.protocol + "//" + document.location.host + "/sites/");
	};
	
	doInit();		
};

sdata.widgets.WidgetLoader.informOnLoad("createsite");