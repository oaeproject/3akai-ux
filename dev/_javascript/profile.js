var sakai = sakai || {};

var profileinfo_userId = false;

sakai.profile = function(){

    var qs = new Querystring();
    var user = qs.get("user", false);
    var showEdit = false;
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

        me = sakai.data.me;


        if (!me.user.userid && !me.user.userid) {
            var redirect =  sakai.config.URL.GATEWAY_URL + "?url=/dev/profile.html";
            if (user){
                redirect += $.URLEncode("?user=" + user);
            }
            document.location = redirect;
        }

        totalprofile = me;
        fillInvitePopup();

        if (user && user != me.user.userid) {
            myprofile = false;
            fileUrl = "/_user/presence.user.json?userid=" + user;
            $.ajax({
                url: fileUrl,
                cache: false,
                success: function(data){
                    totalprofile = {};
                    totalprofile.profile = $.evalJSON(data).profile;
                    totalprofile.profile["sakai:status"] = $.evalJSON(data)["sakai:status"];

                    // Doing a rewrite of the me object, because Sling wraps arrays around
                    // the different fields in the profile object
                    if (typeof totalprofile.profile.firstName === "object"){
                        totalprofile.profile.firstName = totalprofile.profile.firstName[0];
                    }
                    if (typeof totalprofile.profile.lastName === "object"){
                        totalprofile.profile.lastName = totalprofile.profile.lastName[0];
                    }
                    if (typeof totalprofile.profile.email === "object"){
                        totalprofile.profile.email = totalprofile.profile.email[0];
                    }

                    if (totalprofile.profile["sakai:status"] === "online" && totalprofile.profile.chatstatus) {
                        totalprofile.profile._status = totalprofile.profile.chatstatus;
                    }
                    else {
                        totalprofile.profile._status = totalprofile.profile["sakai:status"];
                    }
                    json = totalprofile.profile;

                    if (user && user != me.user.userid) {
                        doAddButton();
                    }

                    fillInFields();

                }
            });
        }
        else if (!showEdit) {
            $("#profile_tabs").show();
            $("#link_edit_profile").show();
            fileUrl = "/_user/presence.user.json?userid=" + sakai.data.me.user.userid;
            $.ajax({
                url: fileUrl,
                cache: false,
                success: function(data){
                    var totalprofile = {};
                    totalprofile.profile = $.evalJSON(data).profile;
                    totalprofile.profile["sakai:status"] = $.evalJSON(data)["sakai:status"];

                    // Doing a rewrite of the me object, because Sling wraps arrays around
                    // the different fields in the profile object
                    if (typeof totalprofile.profile.firstName === "object"){
                        totalprofile.profile.firstName = totalprofile.profile.firstName[0];
                    }
                    if (typeof totalprofile.profile.lastName === "object"){
                        totalprofile.profile.lastName = totalprofile.profile.lastName[0];
                    }
                    if (typeof totalprofile.profile.email === "object"){
                        totalprofile.profile.email = totalprofile.profile.email[0];
                    }

                    if (totalprofile.profile["sakai:status"] === "online" && totalprofile.profile.chatstatus) {
                        totalprofile.profile._status = totalprofile.profile.chatstatus;
                    }
                    else {
                        totalprofile.profile._status = totalprofile.profile["sakai:status"];
                    }
                    json = totalprofile.profile;

                    if (user && user != me.user.userid) {
                        doAddButton();
                    }

                    fillInFields();

                },
                error: function(xhr, textStatus, thrownError) {

                    // If presence request fails attempt to get profile information for logged in user from already loaded sakai.data.me.profile
                    // and try to proceed normally

                    var totalprofile = {};
                    totalprofile.profile = sakai.data.me.profile;
                    totalprofile.profile["sakai:status"] = sakai.data.me.profile.chatstatus;

                    // Doing a rewrite of the me object, because Sling wraps arrays around
                    // the different fields in the profile object
                    if (typeof totalprofile.profile.firstName === "object"){
                        totalprofile.profile.firstName = totalprofile.profile.firstName[0];
                    }
                    if (typeof totalprofile.profile.lastName === "object"){
                        totalprofile.profile.lastName = totalprofile.profile.lastName[0];
                    }
                    if (typeof totalprofile.profile.email === "object"){
                        totalprofile.profile.email = totalprofile.profile.email[0];
                    }

                    if (totalprofile.profile["sakai:status"] === "online" && totalprofile.profile.chatstatus) {
                        totalprofile.profile._status = totalprofile.profile.chatstatus;
                    }
                    else {
                        totalprofile.profile._status = totalprofile.profile["sakai:status"];
                    }
                    json = totalprofile.profile;

                    if (user && user != me.user.userid) {
                        doAddButton();
                    }

                    fillInFields();

                }
            });
        }

        if (myprofile) {

            $("#myprofile_placeholder").hide();
            $("#myprofile_tabs").show();
            $("#add_to_contacts_button").hide();
            $("#send_message_button").hide();

        }

    };

   var inedit_basic = false;

   var fillInBasic = function(){

        var inbasic = 0;
        var basic = false;
        var str = "";

        fillInMessagePopUp();

        $("#profile_user_name").text(json.firstName + " " + json.lastName);
        if (json.basic){
            basic = $.evalJSON(json.basic);
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

        $("#profile_user_status_" + json._status).show();

        // Basic Information

        if (json.firstName){
            inbasic++;
            $("#firstname").show();
            str = json.firstName;
            $("#txt_firstname").text("" + str);
        } else if (!inedit_basic) {
            $("#firstname").hide();
        }

        if (json.lastName){
            inbasic++;
            $("#lastname").show();
            str = json.lastName;
            $("#txt_lastname").text("" + str);
        } else if (!inedit_basic) {
            $("#lastname").hide();
        }

        if (myprofile || (user === false || user == me.user.userid)){
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

            basic = $.evalJSON(json.basic);

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

            if (basic.unirole && basic.unirole.replace(/ /g,"")){
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

           var toRender = {};
        toRender.items = [];
        if (json[savefield]){
            toRender.items = $.evalJSON(json[savefield]);
        }
        $("#" + field + "s_list").html($.TemplateRenderer(field + "s_list_template",toRender));

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
           //    status
        $("#profile_user_status").text(totalprofile._status);
        //    status picture
        updateChatStatusElement($("#profile_user_status"), totalprofile._status);


        //Picture

        if (json.picture && $.evalJSON(json.picture).name){
            var picture = $.evalJSON(json.picture);
            $("#picture_holder img").attr("src",'/_user/public/' + json["rep:userId"] + "/" + picture.name);
        }

        fillInBasic();

        // About Me

        var about = false;
        var inabout = 0;
        if (json.aboutme) {

            about = $.evalJSON(json.aboutme);

            if (about.aboutme){
                inabout++;
                $("#aboutme").show();
                $("#txt_aboutme").html("" + about.aboutme.replace(/\n/g, "<br/>"));
            } else if (!inedit_basic) {
                $("#aboutme").hide();
            }

            if (about.personalinterests && !(typeof about.personalinterests === "object" && about.personalinterests.length === 0)) {
                inabout++;
                $("#personalinterests").show();
                if (typeof about.personalinterests === "object") {
                    $("#txt_personalinterests").html("" + about.personalinterests.join("<br/>"));
                } else {
                    $("#txt_personalinterests").html("" + about.personalinterests.replace(/\n/g, "<br/>"));
                }
            } else if (!inedit_basic) {
                $("#personalinterests").hide();
            }

            if (about.academicinterests && !(typeof about.academicinterests === "object" && about.academicinterests.length === 0)) {
                inabout++;
                $("#academicinterests").show();
                if (typeof about.academicinterests === "object"){
                    $("#txt_academicinterests").html("" + about.academicinterests.join("<br/>"));
                } else {
                    $("#txt_academicinterests").html("" + about.academicinterests.replace(/\n/g, "<br/>"));
                }
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

            unicontactinfo = $.evalJSON(json.contactinfo);

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

            homecontactinfo = $.evalJSON(json.contactinfo);

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

            additional = $.evalJSON(json.basic);

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

   };

   /*
    * Sending a message
    */

    $('#message_dialog').jqm({
        modal: true,
        trigger: $('#send_message_button'),
        overlay: 20,
        toTop: true
    });

    var fillInMessagePopUp = function(){
        $("#message_from").text(me.profile.firstName + " " + me.profile.lastName);
        $("#message_to").text(totalprofile.profile.firstName + " " + totalprofile.profile.lastName);
    };

    $("#save_as_page_template_button").bind("click", function(ev){

        var subjectEl = $("#comp-subject");
        var bodyEl = $("#comp-body");

        var valid = true;
        var    subject = subjectEl.val();
        var body = bodyEl.val();

        subjectEl.removeClass("invalid");
        bodyEl.removeClass("invalid");

        if (!subject){
            valid = false;
            subjectEl.addClass("invalid");
        }
        if (!body){
            valid = false;
            bodyEl.addClass("invalid");
        }

        if (!valid){
            return false;
        } else {

            //var openSocialMessage = new opensocial.Message(body,{"TITLE":subject,"TYPE":"MESSAGE"});
            var toSend = {
                //"sling:resourceType": "sakai/message",
                "sakai:type": "internal",
                "sakai:sendstate": "pending",
                "sakai:messagebox": "outbox",
                "sakai:to": user,
                "sakai:from": sakai.data.me.user.userid,
                "sakai:subject": subject,
                "sakai:body":body,
                "sakai:category":"message",
                "_charset_":"utf-8"
            };

            $.ajax({
                url: "/_user/message.create.html",
                type: "POST",
                error: function(xhr, textStatus, thrownError) {
                    alert("An error has occured whilst sending the messages");
                },
                data: toSend
            });

            subjectEl.val("");
            bodyEl.val("");

            $('#message_dialog').jqmHide();
        }

    });


    /*
     * Add to contacts
     */

    $('#add_to_contacts_dialog').jqm({
        modal: true,
        trigger: $('#add_to_contacts_button'),
        overlay: 20,
        toTop: true
    });

    var fillInvitePopup = function(){
        if (me.profile) {
            if (me.profile.firstName) {
                $("#add_friend_personal_note").text("I would like to invite you to become a member of my network on Sakai \n\n " + me.profile.firstName);
            }
            else
                if (me.profile.lastName) {
                    $("#add_friend_personal_note").text("I would like to invite you to become a member of my network on Sakai \n\n " + me.profile.lastName);
                }
                else {
                    $("#add_friend_personal_note").text("I would like to invite you to become a member of my network on Sakai \n\n " + me.user.userid);
                }
        }
    };

    var doAddButton = function(){
        $.ajax({
            url: "/_user/contacts/all.json?page=0&items=100",
            cache: false,
            success: function(data){
                var resp = $.evalJSON(data);

                var status = false;
                if (resp.results){
                    for (var i = 0; i < resp.results.length; i++){
                        if (resp.results[i].target === user){
                            status = resp.results[i].details["sakai:state"];
                        }
                    }
                }

                if (! status){

                    $("#add_to_contacts_button").show();

                    if (totalprofile.profile.firstName){
                        $("#add_friend_displayname").text(totalprofile.profile.firstName);
                        $("#add_friend_displayname2").text(totalprofile.profile.firstName);
                    } else if (totalprofile.profile.lastName) {
                        $("#add_friend_displayname").text(totalprofile.profile.lastName);
                        $("#add_friend_displayname2").text(totalprofile.profile.lastName);
                    } else {
                        $("#add_friend_displayname").text(totalprofile.user.userid);
                        $("#add_friend_displayname2").text(totalprofile.user.userid);
                    }

                    if (totalprofile.profile.picture && $.evalJSON(totalprofile.profile.picture).name){
                        $("#add_friend_profilepicture").html("<img src='/_user/public/" + totalprofile.user.userid + "/" + $.evalJSON(totalprofile.profile.picture).name + "' width='40px' height='40px'/>");
                    } else {
                        $("#add_friend_profilepicture").html("<img src='_images/person_icon.png' width='40px' height='40px'/>");
                    }

                    $("#add_friend_types").html($.TemplateRenderer("add_friend_types_template",Widgets));

                } else if (status == "INVITED"){
                    $("#accept_invitation_button").show();
                }
            },
            error: function(xhr, textStatus, thrownError) {
                //alert("An error has occured");
            }
        });

   };

   $("#add_friends_do_invite").bind("click", function(ev){
           var toSend = $.FormBinder.serialize($("#add_friends_form"));
        if (toSend.add_friends_list_type){

            var type = toSend.add_friends_list_type;
            var comment = toSend.add_friend_personal_note;

            // send message to other person
            var userstring = "";
            if (me.profile.firstName && me.profile.lastName){
                userstring = me.profile.firstName + " " + me.profile.lastName;
            } else {
                userstring = me.user.userid;
            }

            var title = sakai.config.Connections.Invitation.title.replace(/[$][{][u][s][e][r][}]/g,userstring);
            var message = sakai.config.Connections.Invitation.body.replace(/[$][{][u][s][e][r][}]/g,userstring).replace(/[$][{][c][o][m][m][e][n][t][}]/g,comment);

            // construct openSocial message
            var openSocialMessage = new opensocial.Message(message,{"TITLE":title,"TYPE":"INVITATION"});

            var data = { "type" : type, "_charset_":"utf-8"};

            $.ajax({
                url: "/_user/contacts/" + user + ".invite.json",
                type: "POST",
                success: function(data){

                    //var openSocialMessage = new opensocial.Message(body,{"TITLE":subject,"TYPE":"MESSAGE"});
                        var toSend = {
                            //"sling:resourceType": "sakai/message",
                            "sakai:type": "internal",
                            "sakai:sendstate": "pending",
                            "sakai:messagebox": "outbox",
                            "sakai:to": user,
                            "sakai:from": sakai.data.me.user.userid,
                            "sakai:subject": title,
                            "sakai:body":message,
                            "sakai:category":"invitation",
                            "_charset_":"utf-8"
                        };

                        $.ajax({
                            url: "/_user/message.create.html",
                            type: "POST",
                            success: function(data){
                                $('#add_to_contacts_dialog').jqmHide();
                                $("#add_to_contacts_button").hide();
                            },
                            error: function(xhr, textStatus, thrownError) {
                                alert("An error has occured whilst sending the messages");
                            },
                            data: toSend
                        });



                },
                error: function(xhr, textStatus, thrownError) {
                    alert("An error has occured");
                },
                data: data
            });

        }
   });

   $("#accept_invitation_button").bind("click", function(ev){

        var inviter = user;

        $.ajax({
            url: "/_user/contacts/" + inviter + ".accept.html",
            type: "POST",
            data : {"_charset_":"utf-8"},
            success: function(data){
                $("#accept_invitation_button").hide();
            },
            error: function(xhr, textStatus, thrownError) {
                alert("An error has occured");
            }
        });

   });


    doInit();

};

sdata.container.registerForLoad("sakai.profile");
