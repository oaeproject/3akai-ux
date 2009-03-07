var sakai = sakai || {};

var profileinfo_userId = false;

sakai.profile = function(){
   
   var qs = new Querystring();
   var user = qs.get("user",false);
   var json = false;
   var myprofile = true;
   var me = false;
   
   if (user){
   		myprofile = false;
   		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/profile?userId=" + user + "&sid=" + Math.random(),
			onSuccess: function(data){
				json = eval('(' + data + ')');
				fillInFields();
			},
			onFail: function(status){
				
			}
		});	
   } else {
   		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/profile?sid=" + Math.random(),
			onSuccess: function(data){
				json = eval('(' + data + ')');
				fillInFields();
			},
			onFail: function(status){
				
			}
		});	
   }
   
   if (!myprofile){
   		$("#edit_profile").hide();
		$("#sitetitle").css("width", "500px");
   }
   
   sdata.Ajax.request({
		httpMethod: "GET",
		url: "/sdata/me?sid=" + Math.random(),
		onSuccess: function(data){
			me = eval('(' + data + ')');
			if (me.items.firstname){
				$("#add_friend_personal_note").text("I would like to invite you to become a member of my network on Sakai \n\n " + me.items.firstname);
			} else if (me.items.lastname){
				$("#add_friend_personal_note").text("I would like to invite you to become a member of my network on Sakai \n\n " + me.items.lastname);
			} else {
				$("#add_friend_personal_note").text("I would like to invite you to become a member of my network on Sakai \n\n " + me.items.displayId);
			}
			$("#user_id").text(me.items.firstname + " " + me.items.lastname);
		},
		onFail: function(status){
				
		}
	});	
   
   var inedit_basic = false;
   
   var fillInBasic = function(){
   		
		//Status
		
		if (inedit_basic){
			
			$("#status").show();
			$("#firstname").show();
			$("#middlename").show();
			$("#lastname").show();
			$("#middlename").show();
			$("#birthday").show();
			$("#gender").show();
			$("#aboutme").show();
			$("#relationstatus").show();
			$("#children").show();
			$("#religion").show();
			$("#hometown").show();
			$("#homecountry").show();
			$("#personalinterests").show();
			$("#academicinterests").show();
			$("#hobbies").show();
			$("#tvgenre").show();
			$("#favtvshow").show();
			$("#moviegenre").show();
			$("#favmovie").show();
			$("#bookgenre").show();
			$("#favbook").show();
			$("#musicgenre").show();
			$("#favsong").show();
			$("#unidepartment").show();
			$("#unicollege").show();
			$("#uniemail").show();
			$("#uniphone").show();
			$("#unimobile").show();
			$("#uniaddress").show();
			$("#homeemail").show();
			$("#homephone").show();
			$("#homemobile").show();
			$("#homeaddress").show();
			
		}
		
		var inbasic = 0;
		var basic = false;
		
		$("#status_begin").html("<b><i>" + json.displayName + "</b></i> ");
		if (json.basic){
			var basic = eval('(' + json.basic + ')');
			if (basic.status){
				inbasic++;
				$("#txt_status").html(basic.status);
				$("#status").show();
			} else if (!inedit_basic) {
				$("#status").hide();
			}
		} else if (!inedit_basic) {
				$("#status").hide();
			}
		
		// Basic Information
		
		if (json.firstName){
			inbasic++;
			$("#firstname").show();
			var str = json.firstName;
			$("#txt_firstname").text("" + str);
		} else if (!inedit_basic) {
			$("#firstname").hide();
		}
		
		if (json.lastName){
			inbasic++;
			$("#lastname").show();
			var str = json.lastName;
			$("#txt_lastname").text("" + str);
		} else if (!inedit_basic) {
			$("#lastname").hide();
		}
		
		if (myprofile){
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
			
			basic = eval('(' + json.basic + ')');
			
			if (basic.middlename){
				inbasic++;
				$("#middlename").show();
				var str = basic.middlename;
				$("#txt_middlename").text("" + str);
			} else if (!inedit_basic) {
				$("#middlename").hide();
			}
			
			if (basic.day && basic.month && basic.year){
				inbasic++;
				$("#birthday").show();
				$("#txt_birthday").text(basic.day + "/" + basic.month + "/" + basic.year);
			} else if (!inedit_basic) {
				$("#birthday").hide();
				$("#txt_birthday").text("dd/mm/yyyy");
			} else {
				$("#txt_birthday").text("dd/mm/yyyy");
			}
			
			if (basic.gender){
				inbasic++;
				$("#gender").show();
				$("#txt_gender").text(basic.gender);
			} else if (!inedit_basic) {
				$("#gender").hide();
			}
			
		} else if (!inedit_basic){
			$("#middlename").hide();
			$("#birthday").hide();
			$("#gender").hide();
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
   }
   
   var fillInFields = function(){
   		
		//Picture
		
		if (json.picture){
			var picture = eval('(' + json.picture + ')');
			$("#picture_holder").html("<img src='/sdata/f/public/" + json.userId + "/" + picture.name + "' width='250px'/>");
		}
		
		$("#picture_form").attr("action","/sdata/f/public/" + json.userId);
		profileinfo_userId = json.userId;
		
		fillInBasic();
		
		// About Me
		
		var about = false;
		var inabout = 0;
		if (json.aboutme) {
		
			about = eval('(' + json.aboutme + ')');
			
			if (about.aboutme){
				inabout++;
				$("#aboutme").show();
				$("#txt_aboutme").html("" + about.aboutme.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#aboutme").hide();
			}
			
			if (about.relationstatus){
				inabout++;
				$("#relationstatus").show();
				$("#txt_relationstatus").text("" + about.relationstatus);
			} else if (!inedit_basic) {
				$("#relationstatus").hide();
			}
			
			if (about.children){
				inabout++;
				$("#children").show();
				$("#txt_children").text("" + about.children);
			} else if (!inedit_basic) {
				$("#children").hide();
			}
			
			if (about.religion){
				inabout++;
				$("#religion").show();
				$("#txt_religion").text("" + about.religion);
			} else if (!inedit_basic) {
				$("#religion").hide();
			}
			
			if (about.homecountry){
				inabout++;
				var str = about.homecountry;
				$("#homecountry").show();
				$("#txt_homecountry").text("" + str);
			} else if (!inedit_basic) {
				$("#homecountry").hide();
			}
			
			if (about.hometown){
				inabout++;
				var str = about.hometown;
				$("#hometown").show();
				$("#txt_hometown").text("" + str);
			} else if (!inedit_basic) {
				$("#hometown").hide();
			}
			
		} else if (!inedit_basic){
			$("#aboutme").hide();
			$("#relationstatus").hide();
			$("#children").hide();
			$("#children").hide();
			$("#religion").hide();
			$("#homecountry").hide();
			$("#hometown").hide();
		}
		
		if (inabout > 0){
			$("#about").show();
			$("#no_about").hide();
		} else if (myprofile) {
			$("#about").show();
			if (!inedit_basic) {
				$("#no_about").show();
			} else {
				$("#no_about").hide();
			}
		} else {
			$("#about").hide();
		}
		
		// Interests
		
		var interests = false;
		var ininterests = 0;
		if (json.aboutme) {
		
			interests = eval('(' + json.aboutme + ')');
			
			if (interests.personalinterests) {
				ininterests++;
				$("#personalinterests").show();
				$("#txt_personalinterests").html("" + interests.personalinterests.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#personalinterests").hide();
			}
			
			if (interests.academicinterests) {
				ininterests++;
				$("#academicinterests").show();
				$("#txt_academicinterests").html("" + interests.academicinterests.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#academicinterests").hide();
			}
			
			if (interests.hobbies) {
				ininterests++;
				$("#hobbies").show();
				$("#txt_hobbies").html("" + interests.hobbies.replace(/\n/g, "<br/>"));
			} else if (!inedit_basic) {
				$("#hobbies").hide();
			}
			
			if (interests.tvgenre) {
				ininterests++;
				$("#tvgenre").show();
				$("#txt_tvgenre").text("" + interests.tvgenre);
			} else if (!inedit_basic) {
				$("#tvgenre").hide();
			}
			
			if (interests.favtvshow) {
				ininterests++;
				$("#favtvshow").show();
				$("#txt_favtvshow").text("" + interests.favtvshow);
			} else if (!inedit_basic) {
				$("#favtvshow").hide();
			}
			
			if (interests.moviegenre) {
				ininterests++;
				$("#moviegenre").show();
				$("#txt_moviegenre").text("" + interests.moviegenre);
			} else if (!inedit_basic) {
				$("#moviegenre").hide();
			}
			
			if (interests.favmovie) {
				ininterests++;
				$("#favmovie").show();
				$("#txt_favmovie").text("" + interests.favmovie);
			} else if (!inedit_basic) {
				$("#favmovie").hide();
			}
			
			if (interests.bookgenre) {
				ininterests++;
				$("#bookgenre").show();
				$("#txt_bookgenre").text("" + interests.bookgenre);
			} else if (!inedit_basic) {
				$("#bookgenre").hide();
			}
			
			if (interests.favbook) {
				ininterests++;
				$("#favbook").show();
				$("#txt_favbook").text("" + interests.favbook);
			} else if (!inedit_basic) {
				$("#favbook").hide();
			}
			
			if (interests.musicgenre) {
				ininterests++;
				$("#musicgenre").show();
				$("#txt_musicgenre").text("" + interests.musicgenre);
			} else if (!inedit_basic) {
				$("#musicgenre").hide();
			}
			
			if (interests.favsong) {
				ininterests++;
				$("#favsong").show();
				$("#txt_favsong").text("" + interests.favsong);
			} else if (!inedit_basic) {
				$("#favsong").hide();
			}
			
		} else if (!inedit_basic) {
			$("#personalinterests").hide();
			$("#academicinterests").hide();
			$("#hobbies").hide();
			$("#tvgenre").hide();
			$("#favtvshow").hide();
			$("#moviegenre").hide();
			$("#favmovie").hide();
			$("#bookgenre").hide();
			$("#favbook").hide();
			$("#musicgenre").hide();
			$("#favsong").hide();
		}
		
		if (ininterests > 0){
			$("#interests").show();
			$("#no_interests").hide();
		} else if (myprofile) {
			$("#interests").show();
			if (!inedit_basic) {
				$("#no_interests").show();
			} else {
				$("#no_interests").hide();
			}
		} else {
			$("#interests").hide();
		}
		
		// Uni Contact Info
		
		var unicontactinfo = false;
		var inunicontactinfo = 0;
		if (json.contactinfo) {
		
			unicontactinfo = eval('(' + json.contactinfo + ')');
			
			if (unicontactinfo.unidepartment) {
				inunicontactinfo++;
				$("#unidepartment").show();
				$("#txt_unidepartment").text("" + unicontactinfo.unidepartment);
			} else if (!inedit_basic) {
				$("#unidepartment").hide();
			}
			
			if (unicontactinfo.unicollege) {
				inunicontactinfo++;
				$("#unicollege").show();
				$("#txt_unicollege").text("" + unicontactinfo.unicollege);
			} else if (!inedit_basic) {
				$("#unicollege").hide();
			}
			
			if (unicontactinfo.uniemail) {
				inunicontactinfo++;
				$("#uniemail").show();
				$("#txt_uniemail").text("" + unicontactinfo.uniemail);
			} else if (!inedit_basic) {
				$("#uniemail").hide();
			}
			
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
			$("#unidepartment").hide();
			$("#unicollege").hide();
			$("#uniemail").hide();
			$("#uniphone").hide();
			$("#unimobile").hide();
			$("#uniaddress").hide();
		}
		
		if (inunicontactinfo > 0){
			$("#unicontactinfo").show();
			$("#no_unicontactinfo").hide();
		} else if (myprofile) {
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
		
			homecontactinfo = eval('(' + json.contactinfo + ')');
			
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
		} else if (myprofile) {
			$("#homecontactinfo").show();
			if (!inedit_basic) {
				$("#no_homecontactinfo").show();
			} else {
				$("#no_homecontactinfo").hide();
			}
		} else {
			$("#homecontactinfo").hide();
		}
		
		doAddButton();
		
   }
   
   $("#add_people_confirm").bind("click", function(ev){
   	
	var inviter = json.userId;
	var data = {"accept" : true, "inviter" : inviter};
	
	sdata.Ajax.request({
		url: "/sdata/connection/?sid=" + Math.random(),
		httpMethod: "POST",
		onSuccess: function(data){
			doAddButton();
		},
		onFail : function(data){
			alert("An error has occured");
		},
		postData: data,
		contentType: "application/x-www-form-urlencoded"
	});
	
   });
   
   var doAddButton = function(){
   	 	sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/connection?check=true&user=" + json.userId + "&sid=" + Math.random(),
			onSuccess: function(data){
				var resp = eval('(' + data + ')');
				if (resp.status){
					
					$("#add_people").hide();
					$("#add_people_status_pending").hide();
					$("#add_people_status_connection").hide();
					$("#add_people_status_invited").hide();
					
					if (resp.status == "pending"){
						$("#add_people_status_pending").show();
					} else if (resp.status == "connection"){
						$("#add_people_status_connection").show();
					} else if (resp.status == "invited"){
						$("#add_people_status_invited").show();
					}
					
				} else {
					$("#add_people").show();
					
					if (json.firstName){
						$("#add_friend_displayname").text(json.firstName);
						$("#add_friend_displayname2").text(json.firstName);
					} else if (json.lastName) {
						$("#add_friend_displayname").text(json.lastName);
						$("#add_friend_displayname2").text(json.lastName);
					} else {
						$("#add_friend_displayname").text(json.displayName);
						$("#add_friend_displayname2").text(json.displayName);
					}
					
					$("#add_friend_types").html(sdata.html.Template.render("add_friend_types_template",Widgets));
					
				}
			},
			onFail: function(status){
				alert("An error has occured");	
			}
		});	
   }
   
   $("#add_people_link").bind("click", function(ev){
   		$("#add_friend_overlay_lightbox").show();
		$("#add_friend_lightbox").show();
   });
   
   $("#add_friends_do_invite").bind("click", function(ev){
   		var toSend = sdata.FormBinder.serialize($("#add_friends_form"));
		if (toSend["add_friends_list_type"]){
			
			var type = toSend["add_friends_list_type"];
			var comment = toSend["add_friend_personal_note"];
			var receiver = json.userId;
			
			var data = { "connectionType" : type , "receiver" : receiver };
			
			sdata.Ajax.request({
				url: "/sdata/connection/?sid=" + Math.random(),
				httpMethod: "POST",
				onSuccess: function(data){
					
					// send message to other person
					
					var title = "";
					var user = "";
					if (me.items.firstname && me.items.lastname){
						user = me.items.firstname + " " + me.items.lastname;
					} else {
						user = me.items.displayId;
					}
					title += user + " has invited you to become a connection";
					
					var message = "Hi, \n\n" + user + " has invited you to become a connection. \n";
					message += "He/She";
					message += " has also left the following message: \n\n" + comment + " \n \nTo accept this invitation, please click on the accept button. \n\nKind regards,\n\nThe Sakai Team";
					
					data = { "isinvite" : true , "receiver" : receiver , "title" : title, "message" : message };
					
					sdata.Ajax.request({
						url: "/sdata/message/?sid=" + Math.random(),
						httpMethod: "POST",
						onSuccess: function(data){
							$("#add_friend_overlay_lightbox").hide();
							$("#add_friend_lightbox").hide();
							doAddButton();
						},
						onFail : function(data){
							alert("An error has occured");
						},
						postData: data,
						contentType: "application/x-www-form-urlencoded"
					});
					
				},
				onFail: function(status){
					alert("An error has occured");
				},
				postData: data,
				contentType: "application/x-www-form-urlencoded"
			});
			
		}
   });
   
   $("#close_add_friend_lightbox").bind("click", function(ev){
   		$("#add_friend_overlay_lightbox").hide();
		$("#add_friend_lightbox").hide();
   });
	
	var doHomeContact = function(ev, ui){
		
		var basicfields = {"txt_status":"status","txt_middlename":"middlename","txt_gender":"gender"};
		var aboutmefields = {"txt_aboutme":"aboutme","txt_relationstatus":"relationstatus","txt_children":"children","txt_hometown":"hometown","txt_homecountry":"homecountry","txt_religion":"religion"};
		var interestsfields = {"txt_personalinterests":"personalinterests", "txt_academicinterests":"academicinterests","txt_hobbies":"hobbies","txt_tvgenre":"tvgenre","txt_favtvshow":"favtvshow","txt_moviegenre":"moviegenre","txt_favmovie":"favmovie","txt_bookgenre":"bookgenre","txt_favbook":"favbook","txt_musicgenre":"musicgenre","txt_favsong":"favsong"};
		var unicontactinfo = {"txt_unidepartment":"unidepartment","txt_unicollege":"unicollege","txt_uniemail":"uniemail","txt_uniphone":"uniphone","txt_unimobile":"unimobile","txt_uniaddress":"uniaddress"};
		var homecontactinfo = {"txt_homeemail":"homeemail","txt_homephone":"homephone","txt_homemobile":"homemobile","txt_homeaddress":"homeaddress"};
		
		var tosend = {};
		
		var disappear = false;
		//ui.style.height = "16px";
		if (ev.value.replace(/ /g,"") == ""){
			if (!inedit_basic) {
				disappear = true;
			}
		}
		
		var value = ev.value;
		if (ui.id == "txt_firstname"){
			
			tosend["firstName"] = value;
			json.firstName = value;
			if (disappear){
				$("#firstname").hide();
			}
			
		} else if (ui.id == "txt_lastname"){
			
			tosend["lastName"] = value;
			json.lastName = value;
			if (disappear){
				$("#lastname").hide();
			}
			
		} else if (ui.id == "txt_birthday") {
		
			var basic = {};
			if (json.basic){
				basic = eval('(' + json.basic + ')');
			}
			try {
				var splitted = ev.value.split("/");
				if (splitted.length == 3) {
					basic.day = splitted[0];
					basic.month = splitted[1];
					basic.year = splitted[2];
				} else {
					throw "wrong format";
				}
			} catch (err){
				ev.value = "";	
				basic.day = "";
				basic.month = "";
				basic.year = "";
				$("#txt_birthday").text("dd/mm/yyyy");
			}
			
			tosend["basic"] = sdata.JSON.stringify(basic);
			json.basic = sdata.JSON.stringify(basic);
			if (!inedit_basic && ev.value == ""){
				$("#birthday").hide();
			}
		
		} else if (basicfields[ui.id]) {
			
			var basic = {};
			if (json.basic) {
				basic = eval('(' + json.basic + ')');
			}
			basic[basicfields[ui.id]] = value;
			tosend["basic"] = sdata.JSON.stringify(basic);
			json.basic = sdata.JSON.stringify(basic);
				
			if (disappear){
				$("#" + basicfields[ui.id]).hide();
			}
				
		} else if (aboutmefields[ui.id]) {
			
			var aboutme = {};
			if (json.aboutme) {
				aboutme = eval('(' + json.aboutme + ')');
			}
			aboutme[aboutmefields[ui.id]] = value;
			tosend["aboutme"] = sdata.JSON.stringify(aboutme);
			json.aboutme = sdata.JSON.stringify(aboutme);
				
			if (disappear){
				$("#" + aboutmefields[ui.id]).hide();
			}
				
		} else if (interestsfields[ui.id]) {
			
			var aboutme = {};
			if (json.aboutme) {
				aboutme = eval('(' + json.aboutme + ')');
			}
			aboutme[interestsfields[ui.id]] = value;
			tosend["aboutme"] = sdata.JSON.stringify(aboutme);
			json.aboutme = sdata.JSON.stringify(aboutme);
				
			if (disappear){
				$("#" + interestsfields[ui.id]).hide();
			}
				
		} else if (unicontactinfo[ui.id]) {
			
			var contactinfo = {};
			if (json.contactinfo) {
				contactinfo = eval('(' + json.contactinfo + ')');
			}
			contactinfo[unicontactinfo[ui.id]] = value;
			tosend["contactinfo"] = sdata.JSON.stringify(contactinfo);
			json.contactinfo = sdata.JSON.stringify(contactinfo);
				
			if (disappear){
				$("#" + unicontactinfo[ui.id]).hide();
			}
				
		} else if (homecontactinfo[ui.id]) {
			
			var contactinfo = {};
			if (json.contactinfo) {
				contactinfo = eval('(' + json.contactinfo + ')');
			}
			contactinfo[homecontactinfo[ui.id]] = value;
			tosend["contactinfo"] = sdata.JSON.stringify(contactinfo);
			json.contactinfo = sdata.JSON.stringify(contactinfo);
				
			if (disappear){
				$("#" + homecontactinfo[ui.id]).hide();
			}
				
		}
		
		var data = tosend;
		
		sdata.Ajax.request({
        	url :"/sdata/profile",
        	httpMethod : "POST",
            postData : data,
            contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {
				
			},
			onFail : function(data){
				alert("An error has occured");
			}
		});
		
		fillInFields();
		
	}
	
	$(".basicexpand").bind("click", function(ev){
		if (inedit_basic){
			inedit_basic = false;
			$("#basicexpand").text("Show all fields");
		} else {
			inedit_basic = true;
			$("#basicexpand").text("Hide unused fields");
		}
		fillInFields();
	});
	
	if (myprofile) {
		$("#showallfield").show();
		$("#picture_form").show();
		fluid.inlineEdits("#wrapper3", {
			useTooltip: true,
			finishedEditing: doHomeContact,
			defaultViewText: " ",
		});
		sakai.inlineEdits("#wrapper3", {
			useTooltip: true,
			finishedEditing: doHomeContact,
			defaultViewText: " "
		});
	}
	
	sdata.Ajax.request({
        httpMethod: "GET",
        url: "/dev/resources/countries_by_name.json",
        onSuccess: function(data)
        {
			var countries = eval('(' + data + ')');
			var select = document.getElementById("dpd_homecountry");
			for (var i in countries){
				var option = new Option(i,i);
				select.options[select.options.length] = option;
			}
		},
		onFail : function(status){
			
		}
	});
   
};

var sakai = sakai || {};
sakai._inlineedits = [];
sakai.inlineEdits = function(container, options){
	var defaultViewText = "Click here to edit";
	if (options.defaultViewText){
		defaultViewText = options.defaultViewText;
	}
	var rootel = $(container);
	var els = $(".inlineEditable", rootel);
	for (var i = 0; i < els.length; i++){
		var el = $(els[i]);
		var dropdown = $(".dropdown", el);
		if (dropdown.length > 0){
			
			if (dropdown.html() == ""){
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
				if (newvalue == ""){
					newvalue = defaultViewText;
				}
				dropdown.html(newvalue);
				
				if (dropdown.css("display") == "none"){
					tochangeTo.hide();
					dropdown.show();
				}
				
				var ev = {};
				ev.value = orig;
				
				if (options.finishedEditing){
					options.finishedEditing(ev , dropdown[0]);
				}
				
			});
			
		}
	}
}

var Profile = {
	
	startCallback : function(){
		return true;
	},
	
	completeCallback : function(response){

		response = response.replace(/<pre>/g,"").replace(/<\/pre>/g,"");
		var resp = eval('(' + response + ')');
		var tosave = {
			"name": resp.uploads.file.name
		};
		var stringtosave = sdata.JSON.stringify(tosave);
		var data = {"picture":stringtosave};
		
		$("#picture_holder").html("<img src='/sdata/f/public/" + profileinfo_userId + "/" + resp.uploads.file.name + "' width='250px'/>");
		
		sdata.Ajax.request({
        	url :"/sdata/profile",
        	httpMethod : "POST",
            postData : data,
            contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {
				
			},
			onFail : function(data){
				alert("An error has occured");
			}
		});
	}
	
}

var AIM = {

    frame : function(c) {

		//alert("frame");
        var n = 'f' + Math.floor(Math.random() * 99999);
        var d = document.createElement('DIV');
        d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="AIM.loaded(\''+n+'\')"></iframe>';
        document.body.appendChild(d);

        var i = document.getElementById(n);
        if (c && typeof(c.onComplete) == 'function') {
            i.onComplete = c.onComplete;
        }

		//alert(n);

        return n;
    },

    form : function(f, name) {
		//alert("form");
        f.setAttribute('target', name);
    },

    submit : function(f, c) {
		//alert("submit");
        AIM.form(f, AIM.frame(c));
        if (c && typeof(c.onStart) == 'function') {
            return c.onStart();
        } else {
            return true;
        }
    },

    loaded : function(id) {
		//alert("loaded => id = " + id);
        var i = document.getElementById(id);
		//alert("i = " + i);
        if (i.contentDocument) {
            var d = i.contentDocument;
        } else if (i.contentWindow) {
            var d = i.contentWindow.document;
        } else {
            var d = window.frames[id].document;
        }
        if (d.location.href == "about:blank") {
            return;
        }

        if (typeof(i.onComplete) == 'function') {
            i.onComplete(d.body.innerHTML);
        }
    }

}

sdata.registerForLoad("sakai.profile");
