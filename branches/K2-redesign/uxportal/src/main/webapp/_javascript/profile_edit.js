var sakai = sakai || {};

var profileinfo_userId = false;

sakai.profile = function(){

	var qs = new Querystring();
	var user = qs.get("user", false);
	var showEdit = true;
	var json = false;
	var myprofile = true;
	var me = false;
	
	var totalprofile = false;
	
	var fileUrl = "";
	
	// Fields for papers
	
	var paperfield = "paper";
	var papersavefield = "academic";
	var papersavestring = "academic";
	var paperfields = ["title", "ovtitle", "auth", "coauth", "year", "vol", "voltitle", "edition", "place", "publisher", "number", "url"];
	var paperrequired = ["title", "ovtitle", "auth", "year", "vol", "voltitle", "place", "publisher", "number"];
	
	// Fields for websites
	
	var websitefield = "website";
	var websitesavefield = "websites";
	var websitesavestring = "websites";
	var websitefields = ["title", "url"];
	var websiterequired = ["title", "url"];
	
	// Fields for degree
	
	var educationfield = "degree";
	var educationsavefield = "education";
	var educationsavestring = "education";
	var educationfields = ["country", "school", "field", "degree", "from", "until", "notes"];
	var educationrequired = ["country", "school", "field", "degree", "from", "until"];
	
	// Fields for jobs
	
	var jobfield = "job";
	var jobsavefield = "job";
	var jobsavestring = "job";
	var jobfields = ["role", "country", "company", "from", "until", "description"];
	var jobrequired = ["role", "country", "company", "from", "until"];
	
	// Fields for talks
	
	var talkfield = "talk";
	var talksavefield = "talks";
	var talksavestring = "talks";
	var talkfields = ["title", "place", "date", "url", "coauth"];
	var talkrequired = ["title", "place", "date"];
	
	$(".url_field").bind("change", function(ev){
		var value = $(this).val();
		if (value) {
			if (value.indexOf("//") == -1) {
				value = "http://" + value;
				$(this).val(value);
			}
		}
	});
	
	
	
	var doInit = function(){
	
		me = sdata.me;
		
		if (!me.preferences.uuid && !me.preferences.eid) {
			var redirect =  Config.URL.GATEWAY_URL + "?url=/dev/profile_edit.html";
			if (user){
				redirect += $.URLEncode("?user=" + user);
			}
			document.location = redirect;
		}
		
		totalprofile = me;
		
		
		if (user == me.preferences.uuid) {
			user = false;
		}
		$("#link_view_profile").show();
		fileUrl = "/f/_private" + me.userStoragePrefix + "profile.json?sid=" + Math.random();
				
		json = sdata.me.profile;
				
		setFunctions(paperfield, papersavefield, papersavestring, paperfields, paperrequired);
		setFunctions(talkfield, talksavefield, talksavestring, talkfields, talkrequired);
		setFunctions(jobfield, jobsavefield, jobsavestring, jobfields, jobrequired);
		setFunctions(educationfield, educationsavefield, educationsavestring, educationfields, educationrequired);
		setFunctions(websitefield, websitesavefield, websitesavestring, websitefields, websiterequired);
				
		fillInFields();		
		
		if (myprofile) {
		
			$("#myprofile_placeholder").hide();
			$("#myprofile_tabs").show();
			$("#add_to_contacts_button").hide();
			$("#send_message_button").hide();
			
			
			fluid.inlineEdits(".profile_preview", {
				useTooltip: true,
				tooltipDelay : 500,
				listeners : {
					onFinishEdit: doHomeContact
				},
				defaultViewText: " ",
				paddings: {
				    minimumView: 0
				}
			});

			sakai.inlineEdits(".profile_preview", {
				useTooltip: true,
				finishedEditing: doHomeContact,
				defaultViewText: " "
			});
			
			$(".inlineEditable").css("height","16px");
			$(".text").css("height","16px");
			$(".dropdown").css("height","16px");
			
		}
		
	};
			
   var inedit_basic = true;
   
   var fillInBasic = function(){
		
		var inbasic = 0;
		var basic = false;
		var str = "";
		
		$("#profile_user_name").text(json.firstName + " " + json.lastName);
		if (json.basic){
			basic = json.basic;
			if (basic.status){
				inbasic++;
				$("#txt_status").html(basic.status);
			} 
		}
		$("#status").show();
		
		var chatstatus = "offline";
		if (json.chatstatus){
			chatstatus = json.chatstatus;
		}
		$("#profile_user_status_" + chatstatus).show();
		
		// Basic Information
		
		if (json.firstName){
			inbasic++;
			str = json.firstName;
			$("#txt_firstname").text("" + str);
		} 
		$("#firstname").show();
		
		if (json.lastName){
			inbasic++;
			str = json.lastName;
			$("#txt_lastname").text("" + str);
		} 
		$("#lastname").show();
		
		if (myprofile || (user === false || user === me.preferences.uuid)){
			$("#sitetitle").text("My Profile");
		} else {
			if (json.firstName || json.lastName){
				$("#sitetitle").text(json.firstName + " " + json.lastName);
			} else {
				$("#sitetitle").text(json.displayName);
			}
		}
		
		$("#basic").show();
		
		if (json.basic){
			
			basic = json.basic;
			
			if (basic.middlename){
				inbasic++;
				$("#middlename").show();
				str = basic.middlename;
				$("#txt_middlename").text("" + str);
			} else if (!inedit_basic) {
				$("#middlename").hide();
			}
			
			if (basic.birthday){
				inbasic++;
				$("#birthday").show();
				$("#txt_birthday").text(basic.birthday);
			} else if (!inedit_basic) {
				$("#birthday").hide();
			}
			
			if (basic.unirole){
				inbasic++;
				$("#unirole").show();
				str = basic.unirole;
				$("#txt_unirole").text("" + str);
			} else if (!inedit_basic) {
				$("#unirole").hide();
			}
			
			if (basic.unidepartment){
				inbasic++;
				$("#unidepartment").show();
				str = basic.unidepartment;
				$("#txt_unidepartment").text("" + str);
			} else if (!inedit_basic) {
				$("#unidepartment").hide();
			}
			
			if (basic.unicollege){
				inbasic++;
				$("#unicollege").show();
				str = basic.unicollege;
				$("#txt_unicollege").text("" + str);
			} else if (!inedit_basic) {
				$("#unicollege").hide();
			}
			
			
		} else if (!inedit_basic){
			$("#middlename").hide();
			$("#birthday").hide();
			$("#unicollege").hide();
			$("#unidepartment").hide();
			$("#unirole").hide();
		}
		
		if (inbasic > 0){
			$("#basic").show();
			$("#no_basic").hide();
		} else if (myprofile) {
			$("#basic").show();
			if (!inedit_basic) {
				$("#no_basic").show();
			} else {
				$("#no_basic").hide();
			}
		} else {
			$("#basic").hide();
		}
		
		fillGeneralPopupField(paperfield, papersavefield, papersavestring, paperfields);
		fillGeneralPopupField(talkfield, talksavefield, talksavestring, talkfields);
		fillGeneralPopupField(jobfield, jobsavefield, jobsavestring, jobfields);
		fillGeneralPopupField(educationfield, educationsavefield, educationsavestring, educationfields);
		fillGeneralPopupField(websitefield, websitesavefield, websitesavestring, websitefields);
		
		// ! Set dropdown for paper year		

		if (myprofile && showEdit){
			// filling the years into the dropdowns
			var fields = [];
			fields[0] = document.getElementById("new_degree_from");
			fields[1] = document.getElementById("new_degree_until");
			fields[2] = document.getElementById("edit_degree_from");
			fields[3] = document.getElementById("edit_degree_until");
			fields[4] = document.getElementById("new_paper_year");
			fields[5] = document.getElementById("edit_paper_year");
			fields[6] = document.getElementById("new_job_from");
			fields[7] = document.getElementById("new_job_until");
			fields[8] = document.getElementById("edit_job_from");
			fields[9] = document.getElementById("edit_job_until");
			
			
			
			for (var i = 2015; i >= 1900; i--){
				for (var ii = 0; ii < fields.length; ii++){
					var option = new Option("" + i,"" + i);
					fields[ii].options[fields[ii].options.length] = option;
				}
			}

		}
   };
   
   //////////////////////////
   // General Popup Fields //
   //////////////////////////
   
    var fillGeneralPopupField = function(field, savefield, savestring, fields){
   
   		if (myprofile && showEdit){
			$("#" + field + "s").show();
			$("#" + field + "sadd").show();
		} else {
			if (json[savefield]){
				var obj = {};
				obj.items = [];
				if (json[savefield]){
					obj.items = $.evalJSON(json[savefield]);
				}
				if (obj.items.length > 0){
					$("#" + field + "s").show();
				}
			}
		}
   
	   	obj = {};
		obj.items = [];
		if (json[savefield]){
			obj.items = $.evalJSON(json[savefield]);
		}
		$("#" + field + "s_list").html($.Template.render(field + "s_list_template",obj));
	
		$("." + field + "_record").hover( 
			function(){
				var id = this.id;
				$("#" + id + "_div").removeClass("multifield_out");
				$("#" + id + "_div").addClass("multifield_over");
				$("#" + id + "_remove").show();
			}, function(){
				var id = this.id;
				$("#" + id + "_div").removeClass("multifield_over");
				$("#" + id + "_div").addClass("multifield_out");
				$("#" + id + "_remove").hide();
			}
		);
			
		$("." + field + "_record_remove").click(
			function(){
				var id = this.id.split("_")[this.id.split("_").length - 2];
				var index = -1;
				
				var obj = {};
				obj.items = [];
				if (json[savefield]){
					obj.items = $.evalJSON(json[savefield]);
				}
			
				index = 0;
				for (var i = 0; i < obj.items.length; i++){
					if (obj.items[i].id == id){
						index = i;
					}
				}
				
				if (index != -1){
					
					obj.items.splice(index, 1);
					
					var data = {};
					data[savestring] = $.toJSON(obj.items);
					json[savefield] = data[savestring];
					
					var a = ["u"];
					var k = ["" + savefield];
					var v = ["" + data[savestring]];
					var tosend = {"v":v,"k":k,"a":a};
						
					$.ajax({
				       	url :"/rest/patch" + fileUrl,
				       	type : "POST",
				        data : tosend,
						error : function(data){
							alert("An error has occured");
						}
					});
					
					fillGeneralPopupField(field, savefield, savestring, fields);
					
				}
			}
		);
		
		$("." + field + "_record_div").click(
			function(){
				var id = this.id.split("_")[this.id.split("_").length - 2];
				var index = -1;
				
				var obj = {};
				obj.items = [];
				if (json[savefield]){
					obj.items = $.evalJSON(json[savefield]);
				}
			
				index = 0;
				for (var i = 0; i < obj.items.length; i++){
					if (obj.items[i].id == id){
						index = i;
					}
				}
				
				if (index != -1) {
				
					$("#edit_" + field + "_id").val(obj.items[index].id);
					for (var index2 = 0; index2 < fields.length; index2++){
						$("#edit_" + field + "_" + fields[index2]).val(obj.items[index][fields[index2]]);
					}
				
					$("#edit_" + field + "s_lightbox").jqmShow();
					
				}
			}
		);
   	
    };
	
	$("#add_degrees_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	$("#edit_degrees_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	$("#add_papers_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	$("#edit_papers_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	$("#add_talks_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	$("#edit_talks_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	$("#add_jobs_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	$("#edit_jobs_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	$("#add_websites_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	$("#edit_websites_lightbox").jqm({
		modal: true,
		trigger: "#trigger",
		overlay: 20,
		toTop: true
	});
	
	
	var setFunctions = function(field, savefield, savestring, fields, required){
	
		$("." + field + "sadd").bind("click", function(ev){
			for (var index = 0; index < fields.length; index++){
				$("#new_" + field + "_" + fields[index]).val("");
			}
			$("#add_" + field + "s_lightbox").jqmShow();
		});
		
		$(".sakai-close-add-" + field + "s").bind("click", function(ev){
			$("#add_" + field + "s_lightbox").jqmHide();
		});
		$(".sakai-close-edit-" + field + "s").bind("click", function(ev){
			$("#add_" + field + "s_lightbox").jqmHide();
		});
		
		$("#edit_" + field + "_button").bind("click", function(ev){
		
			var id = parseInt($("#edit_" + field + "_id").val(), 10);
			var arrayToSave = {};
			for (var index = 0; index < fields.length; index++){
				arrayToSave[fields[index]] = $("#edit_" + field + "_" + fields[index]).val();
			}
			
			var valid = true;
			for (index = 0; index < required.length; index++){
				if (!arrayToSave[required[index]]){
					valid = false;
				}
			}
			
			if (valid) {
			
				var obj = {};
				obj.items = [];
				if (json[savefield]) {
					obj.items = $.evalJSON(json[savefield]);
				}
				
				index = 0;
				for (var i = 0; i < obj.items.length; i++) {
					if (obj.items[i].id == id) {
						for (index = 0; index < fields.length; index++){
							obj.items[i][fields[index]] = arrayToSave[fields[index]];
						}
					}
				}
				
				var data = {};
				data[savestring] = $.toJSON(obj.items);
				json[savefield] = data[savestring];
				
				var a = ["u"];
				var k = ["" + savefield];
				var v = ["" + data[savestring]];
				var tosend = {"v":v,"k":k,"a":a};
				
				$.ajax({
					url: "/rest/patch" + fileUrl,
					type: "POST",
					data: tosend,
					error: function(data){
						alert("An error has occured");
					}
				});
				
				fillGeneralPopupField(field, savefield, savestring, fields);
				
				$("#edit_" + field + "s_lightbox").jqmHide();
				
			}
			else {
				alert("Please fill out all of the fields");
			}
		});
		
		$("#new_" + field + "_button").bind("click", function(ev){
			var arrayToSave = {};
			for (var index = 0; index < fields.length; index++){
				arrayToSave[fields[index]] = $("#new_" + field + "_" + fields[index]).val();
			}
			
			var valid = true;
			for (index = 0; index < required.length; index++){
				if (!arrayToSave[required[index]]){
					valid = false;
				}
			}
			
			if (!valid) {
				alert("Please fill out all the necessairy fields");
			}
			else {
				var obj = {};
				obj.items = [];
				if (json[savefield]) {
					obj.items = $.evalJSON(json[savefield]);
				}
				index = obj.items.length;
				obj.items[index] = {};
				
				for (var index2 = 0; index2 < fields.length; index2++){
					obj.items[index][fields[index2]] = arrayToSave[fields[index2]];
				}
			
				obj.items[index].id = Math.round(Math.random() * 100000);
				var data = {};
				data[savestring] = $.toJSON(obj.items);
				json[savefield] = data[savestring];
				
				var a = ["u"];
				var k = ["" + savefield];
				var v = ["" + data[savestring]];
				var tosend = {"v":v,"k":k,"a":a};
				
				$.ajax({
					url: "/rest/patch" + fileUrl,
					type: "POST",
					data: tosend,
					error: function(data){
						alert("An error has occured");
					}
				});
				
				$("#add_" + field + "s_lightbox").jqmHide();
				
				fillGeneralPopupField(field, savefield, savestring, fields);
				
			}
		});
		
	};
	
	
	
	/**
	 * Update a certain element
	 * @param {Object} element Element that needs to be updated
	 */
	var updateChatStatusElement = function(element, status){
		element.removeClass("profile_available_status_online");
		element.removeClass("profile_available_status_busy");
		element.removeClass("profile_available_status_offline");
		element.addClass("profile_available_status_"+status);
	};
   
   //////////////////////////
   // General Popup Fields //
   //////////////////////////
   
   var fillInFields = function(){
   		//	status
		$("#profile_user_status").text(totalprofile._status);
		//	status picture
		updateChatStatusElement($("#profile_user_status"), totalprofile._status);
		
		
		//Picture
		
		if (json.picture && json.picture.name){
			var picture = json.picture;
			$("#picture_holder img").attr("src",'/sdata/f/_private' + totalprofile.userStoragePrefix + picture.name);
		}
		
		fillInBasic();
		
		// About Me
		
		var about = false;
		var inabout = 0;
		if (json.aboutme) {
		
			about = json.aboutme;
			
			if (about.aboutme){
				inabout++;
				$("#aboutme").show();
				$("#txt_aboutme").html("" + about.aboutme.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#aboutme").hide();
			}
			
			if (about.personalinterests) {
				inabout++;
				$("#personalinterests").show();
				$("#txt_personalinterests").html("" + about.personalinterests.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#personalinterests").hide();
			}
			
			if (about.academicinterests) {
				inabout++;
				$("#academicinterests").show();
				$("#txt_academicinterests").html("" + about.academicinterests.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#academicinterests").hide();
			}
			
			if (about.hobbies) {
				inabout++;
				$("#hobbies").show();
				$("#txt_hobbies").html("" + about.hobbies.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#hobbies").hide();
			}
			
			
		} else if (!inedit_basic){
			$("#aboutme").hide();
			$("#academicinterests").hide();
			$("#hobbies").hide();
			$("#personalinterests").hide();
		}
		
		if (inabout > 0){
			$("#about").show();
			$("#no_about").hide();
		} else if (myprofile && showEdit) {
			$("#about").show();
			if (!inedit_basic) {
				$("#no_about").show();
			} else {
				$("#no_about").hide();
			}
		} else {
			$("#about").hide();
		}
		
		// Uni Contact Info
		
		var unicontactinfo = false;
		var inunicontactinfo = 0;
		
		if (json.email){
			inunicontactinfo++;
			$("#uniemail").show();
			$("#txt_uniemail").text(json.email);
		} else if (!inedit_basic) {
			$("#uniemail").hide();
		}
		
		if (json.contactinfo) {
		
			unicontactinfo = json.contactinfo;
			
			if (unicontactinfo.uniphone) {
				inunicontactinfo++;
				$("#uniphone").show();
				$("#txt_uniphone").text("" + unicontactinfo.uniphone);
			} else if (!inedit_basic) {
				$("#uniphone").hide();
			}
			
			if (unicontactinfo.unimobile) {
				inunicontactinfo++;
				$("#unimobile").show();
				$("#txt_unimobile").text("" + unicontactinfo.unimobile);
			} else if (!inedit_basic) {
				$("#unimobile").hide();
			}
			
			if (unicontactinfo.uniaddress) {
				inunicontactinfo++;
				$("#uniaddress").show();
				$("#txt_uniaddress").html("" + unicontactinfo.uniaddress.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#uniaddress").hide();
			}
			
		} else if (!inedit_basic) {
			$("#uniphone").hide();
			$("#unimobile").hide();
			$("#uniaddress").hide();
		}
		
		if (inunicontactinfo > 0){
			$("#unicontactinfo").show();
			$("#no_unicontactinfo").hide();
		} else if (myprofile && showEdit) {
			$("#unicontactinfo").show();
			if (!inedit_basic) {
				$("#no_unicontactinfo").show();
			} else {
				$("#no_unicontactinfo").hide();
			}
		} else {
			$("#unicontactinfo").hide();
		}
		
		// Home Contact Info
		
		var homecontactinfo = false;
		var inhomecontactinfo = 0;
		if (json.contactinfo) {
		
			homecontactinfo = json.contactinfo;
			
			if (homecontactinfo.homeemail) {
				inhomecontactinfo++;
				$("#homeemail").show();
				$("#txt_homeemail").text("" + homecontactinfo.homeemail);
			} else if (!inedit_basic) {
				$("#homeemail").hide();
			}
			
			if (homecontactinfo.homephone) {
				inhomecontactinfo++;
				$("#homephone").show();
				$("#txt_homephone").text("" + homecontactinfo.homephone);
			} else if (!inedit_basic) {
				$("#homephone").hide();
			}
			
			if (homecontactinfo.homemobile) {
				inhomecontactinfo++;
				$("#homemobile").show();
				$("#txt_homemobile").text("" + homecontactinfo.homemobile);
			} else if (!inedit_basic) {
				$("#homemobile").hide();
			}
			
			if (homecontactinfo.homeaddress) {
				inhomecontactinfo++;
				$("#homeaddress").show();
				$("#txt_homeaddress").html("" + homecontactinfo.homeaddress.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#homeaddress").hide();
			}
			
		} else if (!inedit_basic) {
			$("#homeemail").hide();
			$("#homephone").hide();
			$("#homeaddress").hide();
			$("#homemobile").hide();
		}
		
		if (inhomecontactinfo > 0){
			$("#homecontactinfo").show();
			$("#no_homecontactinfo").hide();
		} else if (myprofile && showEdit) {
			$("#homecontactinfo").show();
			if (!inedit_basic) {
				$("#no_homecontactinfo").show();
			} else {
				$("#no_homecontactinfo").hide();
			}
		} else {
			$("#homecontactinfo").hide();
		}
		
		// Additional
		
		var additional = false;
		var inadditional = 0;
		if (json.basic) {
		
			additional = json.basic;
			
			if (additional.awards){
				inadditional++;
				$("#awards").show();
				$("#txt_awards").html("" + additional.awards.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#awards").hide();
			}
			
			if (additional.clubs){
				inadditional++;
				$("#clubs").show();
				$("#txt_clubs").html("" + additional.clubs.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#clubs").hide();
			}
			
			if (additional.societies){
				inadditional++;
				$("#societies").show();
				$("#txt_societies").html("" + additional.societies.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#societies").hide();
			}
			
			
		} else if (!inedit_basic){
			$("#awards").hide();
			$("#societies").hide();
			$("#clubs").hide();
		}
		
		if (inadditional > 0){
			$("#additional").show();
			$("#no_additional").hide();
		} else if (myprofile && showEdit) {
			$("#additional").show();
			if (!inedit_basic) {
				$("#no_additional").show();
			} else {
				$("#no_additional").hide();
			}
		} else {
			$("#additional").hide();
		}
		
		/*$(document.body).hide();
		setTimeout((function(){
			$(document.body).show();
		}),10);*/
   };
   
   var doHomeContact = function(newvalue, oldvalue, ev, ui){
		
		var basicfields = {"txt_status":"status","txt_middlename":"middlename","txt_gender":"gender","txt_unidepartment":"unidepartment","txt_unicollege":"unicollege","txt_unirole":"unirole","txt_birthday":"birthday","txt_awards":"awards","txt_clubs":"clubs","txt_societies":"societies"};
		var aboutmefields = {"txt_aboutme":"aboutme","txt_relationstatus":"relationstatus","txt_personalinterests":"personalinterests", "txt_academicinterests":"academicinterests","txt_hobbies":"hobbies"};
		var unicontactinfo = {"txt_uniphone":"uniphone","txt_unimobile":"unimobile","txt_uniaddress":"uniaddress"};
		var homecontactinfo = {"txt_homeemail":"homeemail","txt_homephone":"homephone","txt_homemobile":"homemobile","txt_homeaddress":"homeaddress"};
		
		var key = false;
		var val = false;
		
		var disappear = false;
		ui.style.height = "16px";
		if (newvalue.replace(/ /g,"") === ""){
			if (!inedit_basic) {
				disappear = true;
			}
		}
		
		var value = newvalue;
		if (ui.id == "txt_firstname"){
			
			key = "firstName";
			val = value;
			json.firstName = value;
			if (disappear){
				$("#firstname").hide();
			}
			
		} else if (ui.id == "txt_lastname"){
			
			key = "lastName";
			val = value;
			json.lastName = value;
			if (disappear){
				$("#lastname").hide();
			}
			
		} else if (ui.id == "txt_uniemail"){
			
			key = "email";
			val = value;
			json.email = value;
			if (disappear){
				$("#uniemail").hide();
			}
			
		} else if (basicfields[ui.id]) {
			
			var basic = {};
			if (json.basic) {
				basic = json.basic;
			}
			basic[basicfields[ui.id]] = value;
			key = "basic";
			val = $.toJSON(basic);
			json.basic = basic;
				
			if (disappear){
				$("#" + basicfields[ui.id]).hide();
			}
				
		} else if (aboutmefields[ui.id]) {
			
			var aboutme = {};
			if (json.aboutme) {
				aboutme = json.aboutme;
			}
			aboutme[aboutmefields[ui.id]] = value;
			key = "aboutme";
			val = $.toJSON(aboutme);
			json.aboutme = aboutme;
				
			if (disappear){
				$("#" + aboutmefields[ui.id]).hide();
			}
				
		} else if (unicontactinfo[ui.id]) {
			
			var unicontactinfoToSave = {};
			if (json.contactinfo) {
				unicontactinfoToSave = json.contactinfo;
			}
			unicontactinfoToSave[unicontactinfo[ui.id]] = value;
			key = "contactinfo";
			val = $.toJSON(unicontactinfoToSave);
			json.contactinfo = unicontactinfoToSave;
				
			if (disappear){
				$("#" + unicontactinfo[ui.id]).hide();
			}
				
		} else if (homecontactinfo[ui.id]) {
			
			var homecontactinfoToSave = {};
			if (json.contactinfo) {
				homecontactinfoToSave = json.contactinfo;
			}
			homecontactinfoToSave[homecontactinfo[ui.id]] = value;
			key = "contactinfo";
			val = $.toJSON(homecontactinfoToSave);
			json.contactinfo = homecontactinfoToSave;
				
			if (disappear){
				$("#" + homecontactinfo[ui.id]).hide();
			}
				
		}
		
		var a = ["u"];
		var k = [key];
		var v = [val];
		
		var tosend = {"k":k,"a":a,"v":v};
		
		$.ajax({
        	url : "/rest/patch" + fileUrl,
        	type : "POST",
            data : tosend,
			error : function(data){
				alert("An error has occured");
			}
		});
		
		fillInFields();
		
	};
	
	
	////////////////////
	// Change picture //
	////////////////////
	
	$("#accept_invitation_button").bind("click", function(ev){
		sakai.createsite.initialise();
	});
	
	
	/////////////////////////////
	// Initialisation function //
	/////////////////////////////
	
	doInit();
   
};

sakai._inlineedits = [];
sakai.inlineEdits = function(container, options){
	var defaultViewText = "Click here to edit";
	if (options.defaultViewText){
		defaultViewText = options.defaultViewText;
	}
	var rootel = $(container);
	var els = $(".inlineEditableAlt", rootel);
	for (var i = 0; i < els.length; i++){
		var el = $(els[i]);
		var dropdown = $(".dropdown", el);
		if (dropdown.length > 0){
			
			if (dropdown.html() === ""){
				dropdown.html(defaultViewText);
			}
			
			var tochangeTo = $(".editContainer",el);
			var changedel = $(".options", tochangeTo);
			
			dropdown.bind("mouseenter", function(ev){
				$(ev.currentTarget).addClass("inlineEdit-invitation");
			});
			dropdown.bind("mouseleave", function(ev){
				$(ev.currentTarget).removeClass("inlineEdit-invitation");
			});
			dropdown.bind("click", function(ev){
				var parent = $(ev.currentTarget).parent();
				var dropdown = $(".dropdown",parent);
				var tochangeTo = $(".editContainer", parent);
				var changedel = $(".options", tochangeTo);
				
				var value = dropdown.text();
				changedel.attr("value",value);
				
				if (dropdown.css("display") != "none"){
					dropdown.hide();
					tochangeTo.show();
					changedel.focus();
					changedel.click();
				}		
			});
			changedel.bind("blur", function(ev){
				var parent = $(ev.currentTarget).parent().parent();
				var dropdown = $(".dropdown",parent);
				var tochangeTo = $(".editContainer", parent);
				var changedel = $(".options", tochangeTo);
				
				var index = changedel[0].selectedIndex;
				var newvalue = changedel[0].options[index].text;
				var orig = newvalue;
				if (newvalue === ""){
					newvalue = defaultViewText;
				}
				dropdown.html(newvalue);
				
				if (dropdown.css("display") == "none"){
					tochangeTo.hide();
					dropdown.show();
				}
				
				var obj = {};
				obj.value = orig;
				
				if (options.finishedEditing){
					options.finishedEditing(newvalue, newvalue, dropdown[0], dropdown[0]);
				}
				
			});
			
		}
	}
	
};

sdata.container.registerForLoad("sakai.profile");