var sakai = sakai || {};
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
   
   var fillInFields = function(){
   		
		//Picture
		
		if (json.picture){
			var picture = eval('(' + json.picture + ')');
			$("#picture").html("<img src='/sdata/f/public/" + json.userId + "/" + picture.name + "' width='250px'/>");
		}
		
		//Status
		
		if (json.basic){
			var basic = eval('(' + json.basic + ')');
			if (basic.status){
				$("#txt_status").html("<b><i>" + json.displayName + " " + basic.status + "</b></i><br/><br/>");
				$("#status").show();
			}
		}
		
		// Basic Information
		
		if (json.userId){
			inbasic++;
			$("#userid").show();
			$("#txt_userid").text("" + json.userId);
		}
		
		if (json.firstName || json.lastName){
			inbasic++;
			$("#name").show();
			var str = json.firstName;
			str += " " + json.lastName;
			$("#txt_name").text("" + str);
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
		
		var basic = false;
		var inbasic = 0;
		if (json.basic){
			
			basic = eval('(' + json.basic + ')');
			
			if (json.userId){
				inbasic++;
				$("#userid").show();
				$("#txt_userid").text("" + json.userId);
			}
			
			if (json.firstName || json.lastName){
				inbasic++;
				$("#name").show();
				var str = json.firstName;
				if (basic.middlename){
					str += " " + basic.middlename;
				}
				str += " " + json.lastName;
				$("#txt_name").text("" + str);
			}
			
			if (basic.day[0] && basic.month[0]){
				inbasic++;
				$("#birthday").show();
				$("#txt_birthday").text("" + basic.month + ", " + basic.day);
			}
			
			if (basic.gender){
				inbasic++;
				$("#gender").show();
				$("#txt_gender").text(basic.gender);
			}
			
			if (basic.day[0] && basic.month[0] && basic.year[0]){
				inbasic++;
				now = new Date()
 				born = new Date();
				
				var month = 0;
				if (basic.month == "February"){
					month = 1;
				} else if (basic.month == "March"){
					month = 2;
				} else if (basic.month == "April"){
					month = 3;
				} else if (basic.month == "May"){
					month = 4;
				} else if (basic.month == "June"){
					month = 5;
				} else if (basic.month == "July"){
					month = 6;
				} else if (basic.month == "August"){
					month = 7;
				} else if (basic.month == "September"){
					month = 8;
				} else if (basic.month == "October"){
					month = 9;
				} else if (basic.month == "November"){
					month = 10;
				} else if (basic.month == "December"){
					month = 11;
				} 
				
				born.setDate(parseInt(basic.day));
				born.setMonth(month);
				born.setFullYear(parseInt(basic.year));
				
 				years = Math.floor((now.getTime() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
				$("#age").show();
				$("#txt_age").text("" + years);
			}
			
			if (inbasic > 0){
				$("#basic").show();
			}
			
		}
		
		// About Me
		
		var about = false;
		var inabout = 0;
		if (json.aboutme) {
		
			about = eval('(' + json.aboutme + ')');
			
			if (about.aboutme){
				inabout++;
				$("#aboutme").show();
				$("#txt_aboutme").html("" + about.aboutme.replace(/\n/g, "<br/>"));
			}
			
			if (about.relationstatus[0]){
				inabout++;
				$("#relationship").show();
				$("#txt_relationship").text("" + about.relationstatus);
			}
			
			if (about.children[0]){
				inabout++;
				$("#children").show();
				$("#txt_children").text("" + about.children);
			}
			
			if (about.religion[0]){
				inabout++;
				$("#religion").show();
				$("#txt_religion").text("" + about.religion);
			}
			
			if (about.homecountry[0] || about.hometown){
				inabout++;
				var str = "";
				if (about.hometown && ! about.homecountry){
					str = about.hometown;
				} else if (about.homecountry && ! about.hometown){
					str = about.homecountry;
				} else {
					str = about.hometown + " (" + about.homecountry + ")";
				}
				$("#birthplace").show();
				$("#txt_birthplace").text("" + str);
			}
			
			if (inabout > 0){
				$("#about").show();
			}
			
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
			}
			
			if (interests.academicinterests) {
				ininterests++;
				$("#academicinterests").show();
				$("#txt_academicinterests").html("" + interests.academicinterests.replace(/\n/g, "<br/>"));
			} 
			
			if (interests.hobbies) {
				ininterests++;
				$("#hobbies").show();
				$("#txt_hobbies").html("" + interests.hobbies.replace(/\n/g, "<br/>"));
			} 
			
			if (interests.tvgenre[0]) {
				ininterests++;
				$("#tvgenre").show();
				$("#txt_tvgenre").text("" + interests.tvgenre);
			}
			
			if (interests.favtvshow) {
				ininterests++;
				$("#favtvshow").show();
				$("#txt_favtvshow").text("" + interests.favtvshow);
			} 
			
			if (interests.moviegenre[0]) {
				ininterests++;
				$("#moviegenre").show();
				$("#txt_moviegenre").text("" + interests.moviegenre);
			}
			
			if (interests.favmovie) {
				ininterests++;
				$("#favmovie").show();
				$("#txt_favmovie").text("" + interests.favmovie);
			} 
			
			if (interests.bookgenre[0]) {
				ininterests++;
				$("#bookgenre").show();
				$("#txt_bookgenre").text("" + interests.bookgenre);
			}
			
			if (interests.favbook) {
				ininterests++;
				$("#favbook").show();
				$("#txt_favbook").text("" + interests.favbook);
			}
			
			if (interests.musicgenre[0]) {
				ininterests++;
				$("#musicgenre").show();
				$("#txt_musicgenre").text("" + interests.musicgenre);
			}
			
			if (interests.favsong) {
				ininterests++;
				$("#favsong").show();
				$("#txt_favsong").text("" + interests.favsong);
			}
			
			if (ininterests > 0){
				$("#interests").show();
			}
			
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
			}
			
			if (unicontactinfo.unicollege) {
				inunicontactinfo++;
				$("#unicollege").show();
				$("#txt_unicollege").text("" + unicontactinfo.unicollege);
			}
			
			if (unicontactinfo.uniemail) {
				inunicontactinfo++;
				$("#uniemail").show();
				$("#txt_uniemail").text("" + unicontactinfo.uniemail);
			}
			
			if (unicontactinfo.uniphone) {
				inunicontactinfo++;
				$("#uniphone").show();
				$("#txt_uniphone").text("" + unicontactinfo.uniphone);
			}
			
			if (unicontactinfo.unimobile) {
				inunicontactinfo++;
				$("#unimobile").show();
				$("#txt_unimobile").text("" + unicontactinfo.unimobile);
			}
			
			if (unicontactinfo.uniaddress) {
				inunicontactinfo++;
				$("#uniaddress").show();
				$("#txt_uniaddress").html("" + unicontactinfo.uniaddress.replace(/\n/g, "<br/>"));
			}
			
			if (inunicontactinfo > 0){
				$("#unicontactinfo").show();
			}
			
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
			}
			
			if (homecontactinfo.homephone) {
				inhomecontactinfo++;
				$("#homephone").show();
				$("#txt_homephone").text("" + homecontactinfo.homephone);
			}
			
			if (homecontactinfo.homemobile) {
				inhomecontactinfo++;
				$("#homemobile").show();
				$("#txt_homemobile").text("" + homecontactinfo.homemobile);
			}
			
			if (homecontactinfo.homeaddress) {
				inhomecontactinfo++;
				$("#homeaddress").show();
				$("#txt_homeaddress").html("" + homecontactinfo.homeaddress.replace(/\n/g, "<br/>"));
			}
			
			if (inhomecontactinfo > 0){
				$("#homecontactinfo").show();
			}
			
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
					
					var message = "Hi, \n\n" + user + " has invited you to become a connection. \n He has also left the following message: \n\n" + comment + " \n \nTo accept this invitation, please click on the accept button. \n\nKind regards,\n\nThe Sakai Team";
					
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
	
	var doUp = function(ev, ui){
		var value = ev.value;
		var contact = {};
		if (ui.id == "txt_homephone"){
			if (json.contactinfo) {
				contact = eval('(' + json.contactinfo + ')');
				contact.homephone = value;
			} else {
				json.contactinfo.homephone = value;
			}
		} else if (ui.id == "txt_homemobile"){
			if (json.contactinfo) {
				contact = eval('(' + json.contactinfo + ')');
				contact.homemobile = value;
			} else {
				contact.homemobile = value;
			}
		}
		
		var stringtosave = sdata.JSON.stringify(contact);
		var data = {"contactinfo":stringtosave};
		
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
	
	if (myprofile) {
		fluid.inlineEdits("#homecontactinfo", {
			useTooltip: true,
			finishedEditing: doUp
		});
	}
   
};

sdata.registerForLoad("sakai.profile");
