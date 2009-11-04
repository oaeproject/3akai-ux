var sakai = sakai || {};

sakai.profile = function(){

	var json = false;
	var me = false;
	
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
		me.profile = sdata.me.profile;
		
		if (!me.user.userid) {
			var redirect =  Config.URL.GATEWAY_URL + "?url=/dev/profile_edit.html";
			document.location = redirect;
		}
		
		fileUrl = "/_user/public/" + sdata.me.user.userid + "/authprofile.json?sid=" + Math.random();
				
		json = sdata.me.profile;
				
		setFunctions(paperfield, papersavefield, papersavestring, paperfields, paperrequired);
		setFunctions(talkfield, talksavefield, talksavestring, talkfields, talkrequired);
		setFunctions(jobfield, jobsavefield, jobsavestring, jobfields, jobrequired);
		setFunctions(educationfield, educationsavefield, educationsavestring, educationfields, educationrequired);
		setFunctions(websitefield, websitesavefield, websitesavestring, websitefields, websiterequired);
				
		fillInFields();		
		
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
		
		sakai.inlineEditsArea(".profile_preview", {
			useTooltip: true,
			finishedEditing: doHomeContact,
			defaultViewText: " "
		});
	};
			
   var inedit_basic = true;
   
   var fillInBasic = function(){
		
		var inbasic = 0;
		var basic = false;
		var str = "";
		
		$("#profile_user_name").text(json.firstName + " " + json.lastName);
		if (json.basic){
			basic = $.evalJSON(json.basic);
			if (basic.status){
				inbasic++;
				$("#txt_status").html(basic.status);
			} 
		}
		
		// Basic Information
		
		if (json.firstName){
			inbasic++;
			str = json.firstName;
			$("#txt_firstname").text("" + str);
		} 
		
		if (json.lastName){
			inbasic++;
			str = json.lastName;
			$("#txt_lastname").text("" + str);
		} 
		
		if (json.basic){
			
			basic = $.evalJSON(json.basic);
			
			if (basic.middlename){
				inbasic++;
				str = basic.middlename;
				$("#txt_middlename").text("" + str);
			} 
			
			if (basic.birthday){
				inbasic++;
				$("#txt_birthday").text(basic.birthday);
			} 
			
			if (basic.unirole){
				inbasic++;
				str = basic.unirole;
				$("#txt_unirole").text("" + str);
			} 
			
			if (basic.unidepartment){
				inbasic++;
				str = basic.unidepartment;
				$("#txt_unidepartment").text("" + str);
			}
			
			if (basic.unicollege){
				inbasic++;
				str = basic.unicollege;
				$("#txt_unicollege").text("" + str);
			}
			
		} 
		
		fillGeneralPopupField(paperfield, papersavefield, papersavestring, paperfields);
		fillGeneralPopupField(talkfield, talksavefield, talksavestring, talkfields);
		fillGeneralPopupField(jobfield, jobsavefield, jobsavestring, jobfields);
		fillGeneralPopupField(educationfield, educationsavefield, educationsavestring, educationfields);
		fillGeneralPopupField(websitefield, websitesavefield, websitesavestring, websitefields);
		
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

   };
   
   //////////////////////////
   // General Popup Fields //
   //////////////////////////
   
	var fillGeneralPopupField = function(field, savefield, savestring, fields){
   
   		$("#" + field + "s").show();
		$("#" + field + "sadd").show();
   
	   	var obj = {};
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
					
					var tosend = {};
					tosend[savefield] = data[savestring];
						
					$.ajax({
				   		url : fileUrl,
				   		type : "POST",
						data : tosend,
						error : function(data){
							alert("An error has occured while trying to post to " + fileUrl);
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
	
	var setFunctions = function(field, savefield, savestring, fields, required){
		
		$("#add_" + field + "s_lightbox").jqm({
			modal: true,
			trigger: "#trigger",
			overlay: 20,
			toTop: true
		});
		$("#edit_" + field + "s_lightbox").jqm({
			modal: true,
			trigger: "#trigger",
			overlay: 20,
			toTop: true
		});
		
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
				
				var tosend = {};
				tosend[savefield] = data[savestring];
				
				$.ajax({
					url: fileUrl,
					type: "POST",
					data: tosend,
					error: function(data){
						alert("An error has occured while posting to " + fileUrl);
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

				var tosend = {};
				tosend[savefield] = data[savestring];
				
				$.ajax({
					url: fileUrl,
					type: "POST",
					data: tosend,
					error: function(data){
						alert("An error has occured while posting to " + fileUrl);
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
		$("#profile_user_status").text(me._status);
		//	status picture
		updateChatStatusElement($("#profile_user_status"), me._status);
		
		//Picture
		
		if (json.picture && $.evalJSON(json.picture).name){
			var picture = $.evalJSON(json.picture);
			$("#picture_holder img").attr("src",'/_user/public/' + sdata.me.user.userid + "/" + picture.name);
		}
		
		fillInBasic();
		
		// About Me
		
		var about = false;
		var inabout = 0;
		if (json.aboutme) {
		
			about = $.evalJSON(json.aboutme);
			
			if (about.aboutme){
				inabout++;
				$("#txt_aboutme").html("" + about.aboutme.replace(/\n/g, "<br/>"));
			}
			
			if (about.personalinterests) {
				inabout++;
				if (typeof about.personalinterests === "object") {
					$("#txt_personalinterests").html("" + about.personalinterests.join("<br/>"));
				} else {
					$("#txt_personalinterests").html("" + about.personalinterests.replace(/\n/g, "<br/>"));
				}
			} 
			
			if (about.academicinterests) {
				inabout++;
				if (typeof about.academicinterests === "object"){
					$("#txt_academicinterests").html("" + about.academicinterests.join("<br/>"));
				} else {
					$("#txt_academicinterests").html("" + about.academicinterests.replace(/\n/g, "<br/>"));
				}
			} 
			
			if (about.hobbies) {
				inabout++;
				$("#txt_hobbies").html("" + about.hobbies.replace(/\n/g, "<br/>"));
			} 
			
			
		}
		
		// Uni Contact Info
		
		var unicontactinfo = false;
		var inunicontactinfo = 0;
		
		if (json.email){
			inunicontactinfo++;
			$("#txt_uniemail").text(json.email);
		} 
		
		if (json.contactinfo) {
		
			unicontactinfo = json.contactinfo;
			
			if (unicontactinfo.uniphone) {
				inunicontactinfo++;
				$("#txt_uniphone").text("" + unicontactinfo.uniphone);
			} 
			
			if (unicontactinfo.unimobile) {
				inunicontactinfo++;
				$("#txt_unimobile").text("" + unicontactinfo.unimobile);
			}
			
			if (unicontactinfo.uniaddress) {
				inunicontactinfo++;
				$("#txt_uniaddress").html("" + unicontactinfo.uniaddress.replace(/\n/g, "<br/>"));
			}
			
		}
		
		// Home Contact Info
		
		var homecontactinfo = false;
		var inhomecontactinfo = 0;
		if (json.contactinfo) {
		
			homecontactinfo = json.contactinfo;
			
			if (homecontactinfo.homeemail) {
				inhomecontactinfo++;
				$("#txt_homeemail").text("" + homecontactinfo.homeemail);
			} 
			
			if (homecontactinfo.homephone) {
				inhomecontactinfo++;
				$("#txt_homephone").text("" + homecontactinfo.homephone);
			}
			
			if (homecontactinfo.homemobile) {
				inhomecontactinfo++;
				$("#txt_homemobile").text("" + homecontactinfo.homemobile);
			} 
			
			if (homecontactinfo.homeaddress) {
				inhomecontactinfo++;
				$("#txt_homeaddress").html("" + homecontactinfo.homeaddress.replace(/\n/g, "<br/>"));
			} 
			
		}
		
		// Additional
		
		var additional = false;
		var inadditional = 0;
		if (json.basic) {
		
			additional = json.basic;
			
			if (additional.awards) {
				inadditional++;
				$("#txt_awards").html("" + additional.awards.replace(/\n/g, "<br/>"));
			}
			
			if (additional.clubs) {
				inadditional++;
				$("#txt_clubs").html("" + additional.clubs.replace(/\n/g, "<br/>"));
			}
			
			if (additional.societies) {
				inadditional++;
				$("#txt_societies").html("" + additional.societies.replace(/\n/g, "<br/>"));
			}
		}
		
   };
   
   var doHomeContact = function(newvalue, oldvalue, ev, ui){
		
		var basicfields = {"txt_status":"status","txt_middlename":"middlename","txt_gender":"gender","txt_unidepartment":"unidepartment","txt_unicollege":"unicollege","txt_unirole":"unirole","txt_birthday":"birthday","txt_awards":"awards","txt_clubs":"clubs","txt_societies":"societies"};
		var aboutmefields = {"txt_aboutme":"aboutme","txt_relationstatus":"relationstatus","txt_personalinterests":"personalinterests", "txt_academicinterests":"academicinterests","txt_hobbies":"hobbies"};
		var unicontactinfo = {"txt_uniphone":"uniphone","txt_unimobile":"unimobile","txt_uniaddress":"uniaddress"};
		var homecontactinfo = {"txt_homeemail":"homeemail","txt_homephone":"homephone","txt_homemobile":"homemobile","txt_homeaddress":"homeaddress"};
		
		var key = false;
		var val = false;
		
		var disappear = false;
		ui.style.minHeight = "16px";
		
		var value = newvalue;
		
		// Update the status message in the chat bar
		if (ui.id == "txt_status"){
			if (newvalue){
				var toset = newvalue;
				if(toset.length > 20){
					toset = toset.substr(0, 20) + "...";
				}
				$(".chat_available_statusmessage").text(toset);
			} else {
				$(".chat_available_statusmessage").text("No status message");
			}
		}
		
		if (ui.id == "txt_firstname"){
			
			key = "firstName";
			val = value;
			json.firstName = value;
			
		} else if (ui.id == "txt_lastname"){
			
			key = "lastName";
			val = value;
			json.lastName = value;
			
		} else if (ui.id == "txt_uniemail"){
			
			key = "email";
			val = value;
			json.email = value;
			
		} else if (ui.id == "txt_academicinterests"){
			
			var aboutme = {};
			if (json.aboutme) {
				aboutme = $.evalJSON(json.aboutme);
			}
			value = value.split("\n");
			aboutme[aboutmefields[ui.id]] = value;
			key = "aboutme";
			val = $.toJSON(aboutme);
			json.aboutme = val;
			
		} else if (ui.id == "txt_personalinterests"){
			
			var aboutme = {};
			if (json.aboutme) {
				aboutme = $.evalJSON(json.aboutme);
			}
			value = value.split("\n");
			aboutme[aboutmefields[ui.id]] = value;
			key = "aboutme";
			val = $.toJSON(aboutme);
			json.aboutme = val;
			
		} else if (basicfields[ui.id]) {
			
			var basic = {};
			if (json.basic) {
				basic = $.evalJSON(json.basic);
			}
			basic[basicfields[ui.id]] = value;
			key = "basic";
			val = $.toJSON(basic);
			json.basic = val;
				
				
		} else if (aboutmefields[ui.id]) {
			
			var aboutme = {};
			if (json.aboutme) {
				aboutme = $.evalJSON(json.aboutme);
			}
			aboutme[aboutmefields[ui.id]] = value;
			key = "aboutme";
			val = $.toJSON(aboutme);
			json.aboutme = val;
				
		} else if (unicontactinfo[ui.id]) {
			
			var unicontactinfoToSave = {};
			if (json.contactinfo) {
				unicontactinfoToSave = $.evalJSON(json.contactinfo);
			}
			unicontactinfoToSave[unicontactinfo[ui.id]] = value;
			key = "contactinfo";
			val = $.toJSON(unicontactinfoToSave);
			json.contactinfo = val;
				
		} else if (homecontactinfo[ui.id]) {
			
			var homecontactinfoToSave = {};
			if (json.contactinfo) {
				homecontactinfoToSave = $.evalJSON(json.contactinfo);
			}
			homecontactinfoToSave[homecontactinfo[ui.id]] = value;
			key = "contactinfo";
			val = $.toJSON(homecontactinfoToSave);
			json.contactinfo = val;
				
		}
		
		var tosend = {};
		tosend[key] = val;
		
		$.ajax({
			url : fileUrl,
			type : "POST",
			data : tosend,
			error : function(data){
				alert("An error has occured while posting to " + fileUrl);
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


///////////////////////////
// Dropdown inline edits //
///////////////////////////

// TODO: Replace this by Fluid component

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
		var dropdown = $(".dropdownbox", el);
		if (dropdown.length > 0){
			
			if (dropdown.html() === ""){
				dropdown.html(defaultViewText);
			}
			
			var tochangeTo = $(".editContainer",el);
			var changedel = $(".options", tochangeTo);

			dropdown.bind("click", function(ev){
				var parent = $(ev.target).parent();
				var dropdown = $(".dropdownbox",parent);
				var tochangeTo = $(".editContainer", parent);
				
				var value = dropdown.text();
				$(".options" + " option[value=" + value + "]", tochangeTo).attr("selected", true);
				if (dropdown.css("display") != "none"){
					dropdown.hide();
					tochangeTo.show();
					changedel.focus();
					changedel.click();
				}		
			});
			changedel.bind("blur", function(ev){
				var parent = $(ev.target).parent().parent();
				var dropdown = $(".dropdownbox",parent);
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

$(".dropdownbox").live("mouseover", function(){
	$(this).addClass("fl-inlineEdit-invitation");
});
$(".dropdownbox").live("mouseout", function(){
	$(this).removeClass("fl-inlineEdit-invitation");
});

sakai._inlineeditsArea = [];
sakai.inlineEditsArea = function(container, options){
	var defaultViewText = "Click here to edit";
	if (options.defaultViewText){
		defaultViewText = options.defaultViewText;
	}
	var rootel = $(container);
	var els = $(".inlineEditableAlt", rootel);
	for (var i = 0; i < els.length; i++){
		var el = $(els[i]);
		var dropdown = $(".textarea", el);
		if (dropdown.length > 0){
			
			if (dropdown.html() === ""){
				dropdown.html(defaultViewText);
			}
			
			var tochangeTo = $(".editContainer",el);
			var changedel = $(".options", tochangeTo);
			
			dropdown.bind("click", function(ev){
				var parent = $(ev.target).parent();
				var dropdown = $(".textarea",parent);
				var tochangeTo = $(".editContainer", parent);
				
				var value = dropdown.html();
				value = value.replace(/<br\/>/ig,"\n");
				value = value.replace(/<br>/ig,"\n")
				$(".options", tochangeTo).val(value.replace(/<br\/>/ig,"\n"));
				if (dropdown.css("display") != "none"){
					dropdown.hide();
					tochangeTo.show();
					changedel.focus();
					changedel.click();
				}		
			});
			changedel.bind("blur", function(ev){
				var parent = $(ev.target).parent().parent();
				var dropdown = $(".textarea",parent);
				var tochangeTo = $(".editContainer", parent);
				var changedel = $(".options", tochangeTo);
				
				var newvalue = changedel.val();
				var orig = newvalue;
				if (newvalue === ""){
					newvalue = defaultViewText;
				}
				dropdown.html(newvalue.replace(/\n/g,"<br/>"));
				
				if (dropdown.css("display") == "none"){
					tochangeTo.hide();
					dropdown.show();
				}
				
				var obj = {};
				obj.value = orig;
				
				if (options.finishedEditing){
					options.finishedEditing(newvalue, newvalue, dropdown[0], dropdown[0]);
				}
				
				dropdown.removeClass("fl-inlineEdit-invitation");
				
			});
			
		}
	}
	
};

$(".textarea").live("mouseover", function(){
	$(this).addClass("fl-inlineEdit-invitation");
});
$(".textarea").live("mouseout", function(){
	$(this).removeClass("fl-inlineEdit-invitation");
});

sdata.container.registerForLoad("sakai.profile");