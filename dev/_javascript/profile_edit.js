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


/*global Querystring, Config, $, sdata, set_cookie */

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
            if (value.indexOf("//") === -1) {
                value = "http://" + value;
                $(this).val(value);
            }
        }
    });



    var doInit = function(){

        me = sakai.data.me;
        me.profile = sakai.data.me.profile;

        if (!me.user.userid) {
            var redirect =  sakai.config.URL.GATEWAY_URL + "?url=/dev/profile_edit.html";
            document.location = redirect;
        }

        fileUrl = sakai.data.me.profile["jcr:path"];

        json = sakai.data.me.profile;

        setFunctions(paperfield, papersavefield, papersavestring, paperfields, paperrequired);
        setFunctions(talkfield, talksavefield, talksavestring, talkfields, talkrequired);
        setFunctions(jobfield, jobsavefield, jobsavestring, jobfields, jobrequired);
        setFunctions(educationfield, educationsavefield, educationsavestring, educationfields, educationrequired);
        setFunctions(websitefield, websitesavefield, websitesavestring, websitefields, websiterequired);

        fillInFields();
    };

    var inedit_basic = true;

    var fillInBasic = function(){

        var inbasic = 0;
        var basic = false;
        var str = "";

        $("#profile_user_name").text(sakai.api.Security.saneHTML(json.firstName + " " + json.lastName));

        if (json.basic){
            basic = $.parseJSON(sakai.api.Security.saneHTML(json.basic));
            if (basic.status){
                inbasic++;
                $("#txt_status").val(basic.status);
            }

            if (basic.middlename){
                inbasic++;
                str = basic.middlename;
                $("#txt_middlename").val("" + str);
            }

            if (basic.birthday){
                inbasic++;
                $("#txt_birthday").val(basic.birthday);
            }

            if (basic.unirole){
                inbasic++;
                str = basic.unirole;
                $("#txt_unirole").val("" + str);
            }

            if (basic.unidepartment){
                inbasic++;
                str = basic.unidepartment;
                $("#txt_unidepartment").val("" + str);
            }

            if (basic.unicollege){
                inbasic++;
                str = basic.unicollege;
                $("#txt_unicollege").val("" + str);
            }


        }

        // Basic Information

        if (json.firstName){
            inbasic++;
            str = sakai.api.Security.saneHTML(json.firstName);
            $("#txt_firstname").val("" + str);
        }

        if (json.lastName){
            inbasic++;
            str = sakai.api.Security.saneHTML(json.lastName);
            $("#txt_lastname").val("" + str);
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

    // Used to display feedback to user when saving fields
    $('<img src="/dev/_images/ajax-loader-gray.gif" id="profile_spinner" />').css('position','absolute').hide().appendTo('body');
    $('<p id="profile_saving">Saving...</p>').css('position','absolute').hide().appendTo('body');
    $('<p id="profile_saved">Saved!</p>').css('position','absolute').hide().appendTo('body');

    // Save input fields on change
    $(".profile_section_editable input, .profile_section_editable select, .profile_section_editable textarea").change(function(ev) {
        doHomeContact(this.value, "", null, this);
    });


   //////////////////////////
   // General Popup Fields //
   //////////////////////////

    var fillGeneralPopupField = function(field, savefield, savestring, fields){

        $("#" + field + "s").show();
        $("#" + field + "sadd").show();

        var obj = {};
        obj.items = [];
        if (json[savefield]){
            obj.items = $.parseJSON(sakai.api.Security.saneHTML(json[savefield]));
        }
        $("#" + field + "s_list").html($.TemplateRenderer(field + "s_list_template",obj));

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
                    obj.items = $.parseJSON(sakai.api.Security.saneHTML(json[savefield]));
                }

                index = 0;
                for (var i = 0; i < obj.items.length; i++){
                    if (obj.items[i].id + "" === id){
                        index = i;
                    }
                }

                if (index !== -1){

                    obj.items.splice(index, 1);

                    var data = {};
                    data[savestring] = $.toJSON(sakai.api.Security.saneHTML(obj.items));
                    json[savefield] = data[savestring];

                    var tosend = {};
                    tosend[savefield] = data[savestring];
                    tosend["_charset_"] = "utf-8";

                    $.ajax({
                        url : fileUrl,
                        type : "POST",
                        data : tosend,
                        error: function(xhr, textStatus, thrownError) {
                            fluid.log("profile_edit.js: An error has occured while trying to post to " + fileUrl);
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
                    obj.items = $.parseJSON(sakai.api.Security.saneHTML(json[savefield]));
                }

                index = 0;
                for (var i = 0; i < obj.items.length; i++){
                    if (obj.items[i].id + "" === id){
                        index = i;
                    }
                }

                if (index !== -1) {

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
                    obj.items = $.parseJSON(json[savefield]);
                }

                index = 0;
                for (var i = 0, j = obj.items.length; i < j; i++) {
                    if (obj.items[i].id === id) {
                        for (index = 0, k = fields.length; index < k; index++){
                            obj.items[i][fields[index]] = arrayToSave[fields[index]];
                        }
                    }
                }

                var data = {};
                data[savestring] = $.toJSON(sakai.api.Security.saneHTML(obj.items));
                json[savefield] = data[savestring];

                var tosend = {};
                tosend[savefield] = data[savestring];
                tosend["_charset_"] = "utf-8";

                $.ajax({
                    url: fileUrl,
                    type: "POST",
                    data: tosend,
                    error: function(xhr, textStatus, thrownError) {
                        fluid.log("profile_edit.js: An error has occured while posting to " + fileUrl);
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
                arrayToSave[fields[index]] = sakai.api.Security.saneHTML($("#new_" + field + "_" + fields[index]).val());
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
                    obj.items = $.parseJSON(json[savefield]);
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
                tosend["_charset_"] = "utf-8";
                $.ajax({
                    url: fileUrl,
                    type: "POST",
                    data: tosend,
                    error: function(xhr, textStatus, thrownError) {
                        fluid.log("profile_edit.js: An error has occured while posting to " + fileUrl);
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

        //    status
        $("#profile_user_status").text(me._status);
        //    status picture
        updateChatStatusElement($("#profile_user_status"), me._status);

        //Picture

        if (json.picture && $.parseJSON(json.picture).name){
            var picture = $.parseJSON(json.picture);
            $("#picture_holder img").attr("src",'/_user' + sakai.data.me.profile.path + '/public/profile/' + picture.name);
        }

        fillInBasic();

        // About Me

        var about = false;
        var inabout = 0;
        if (json.aboutme) {

            about = $.parseJSON(sakai.api.Security.saneHTML(json.aboutme));

            if (about.aboutme){
                inabout++;
                $("#txt_aboutme").val("" + about.aboutme.replace(/\n/g, "<br/>"));
            }

            if (about.personalinterests) {
                inabout++;
                $("#txt_personalinterests").html("" + about.personalinterests);
            }

            if (about.academicinterests) {
                inabout++;
                $("#txt_academicinterests").html("" + about.academicinterests);
            }

            if (about.hobbies) {
                inabout++;
                $("#txt_hobbies").val("" + about.hobbies.replace(/\n/g, "<br/>"));
            }


        }

        // Uni Contact Info

        var unicontactinfo = false;
        var inunicontactinfo = 0;

        if (json.email){
            inunicontactinfo++;
            $("#txt_uniemail").val(sakai.api.Security.saneHTML(json.email));
        }

        if (json.contactinfo) {

            unicontactinfo = $.parseJSON(sakai.api.Security.saneHTML(json.contactinfo));

            if (unicontactinfo.uniphone) {
                inunicontactinfo++;
                $("#txt_uniphone").val("" + unicontactinfo.uniphone);
            }

            if (unicontactinfo.unimobile) {
                inunicontactinfo++;
                $("#txt_unimobile").val("" + unicontactinfo.unimobile);
            }

            if (unicontactinfo.uniaddress) {
                inunicontactinfo++;
                $("#txt_uniaddress").val("" + unicontactinfo.uniaddress.replace(/\n/g, "<br/>"));
            }

        }

        // Home Contact Info

        var homecontactinfo = false;
        var inhomecontactinfo = 0;
        if (json.contactinfo) {

            homecontactinfo = $.parseJSON(sakai.api.Security.saneHTML(json.contactinfo));

            if (homecontactinfo.homeemail) {
                inhomecontactinfo++;
                $("#txt_homeemail").val("" + homecontactinfo.homeemail);
            }

            if (homecontactinfo.homephone) {
                inhomecontactinfo++;
                $("#txt_homephone").val("" + homecontactinfo.homephone);
            }

            if (homecontactinfo.homemobile) {
                inhomecontactinfo++;
                $("#txt_homemobile").val("" + homecontactinfo.homemobile);
            }

            if (homecontactinfo.homeaddress) {
                inhomecontactinfo++;
                $("#txt_homeaddress").val("" + homecontactinfo.homeaddress.replace(/\n/g, "<br/>"));
            }

        }

        // Additional

        var additional = false;
        var inadditional = 0;
        if (json.basic) {

            additional = $.parseJSON(sakai.api.Security.saneHTML(json.basic));

            if (additional.awards) {
                inadditional++;
                $("#txt_awards").val("" + additional.awards.replace(/\n/g, "<br/>"));
            }

            if (additional.clubs) {
                inadditional++;
                $("#txt_clubs").val("" + additional.clubs.replace(/\n/g, "<br/>"));
            }

            if (additional.societies) {
                inadditional++;
                $("#txt_societies").val("" + additional.societies.replace(/\n/g, "<br/>"));
            }
        }

   };

   var doHomeContact = function(newvalue, oldvalue, ev, ui){
        var position = $(ui).offset();
        $('#profile_spinner').css({ top: position.top, left: position.left + $(ui).width() + 30 }).show();
        $('#profile_saving').css({ top: position.top, left: position.left + $(ui).width() + 50 }).show();

        var basicfields = {"txt_status":"status","txt_middlename":"middlename","txt_gender":"gender","txt_unidepartment":"unidepartment","txt_unicollege":"unicollege","txt_unirole":"unirole","txt_birthday":"birthday","txt_awards":"awards","txt_clubs":"clubs","txt_societies":"societies"};
        var aboutmefields = {"txt_aboutme":"aboutme","txt_relationstatus":"relationstatus","txt_personalinterests":"personalinterests", "txt_academicinterests":"academicinterests","txt_hobbies":"hobbies"};
        var unicontactinfo = {"txt_uniphone":"uniphone","txt_unimobile":"unimobile","txt_uniaddress":"uniaddress"};
        var homecontactinfo = {"txt_homeemail":"homeemail","txt_homephone":"homephone","txt_homemobile":"homemobile","txt_homeaddress":"homeaddress"};

        var key = false;
        var val = false;

        var aboutme = {};

        var disappear = false;
        ui.style.minHeight = "16px";

        var value = newvalue;

        // Update the status message in the chat bar
        if (ui.id === "txt_status"){
            if (newvalue){
                var toset = newvalue;
                if(toset.length > 20){
                    toset = toset.substr(0, 20) + "...";
                }
                $(".chat_available_statusmessage").text(sakai.api.Security.saneHTML(toset));
            } else {
                $(".chat_available_statusmessage").text("No status message");
            }
        }

        if (ui.id === "txt_firstname"){

            key = "firstName";
            val = value;
            json.firstName = value;

        } else if (ui.id === "txt_lastname"){

            key = "lastName";
            val = value;
            json.lastName = value;

        } else if (ui.id === "txt_uniemail"){

            key = "email";
            val = value;
            json.email = value;

        } else if (ui.id === "txt_academicinterests"){

            if (json.aboutme) {
                aboutme = $.parseJSON(sakai.api.Security.saneHTML(json.aboutme));
            }
            aboutme[aboutmefields[ui.id]] = value;
            key = "aboutme";
            val = $.toJSON(aboutme);
            json.aboutme = val;

        } else if (ui.id === "txt_personalinterests"){

            if (json.aboutme) {
                aboutme = $.parseJSON(sakai.api.Security.saneHTML(json.aboutme));
            }
            aboutme[aboutmefields[ui.id]] = value;
            key = "aboutme";
            val = $.toJSON(aboutme);
            json.aboutme = val;

        } else if (basicfields[ui.id]) {

            var basic = {};
            if (json.basic) {
                basic = $.parseJSON(sakai.api.Security.saneHTML(json.basic));
            }
            basic[basicfields[ui.id]] = value;
            key = "basic";
            val = $.toJSON(basic);
            json.basic = val;


        } else if (aboutmefields[ui.id]) {

            if (json.aboutme) {
                aboutme = $.parseJSON(sakai.api.Security.saneHTML(json.aboutme));
            }
            aboutme[aboutmefields[ui.id]] = value;
            key = "aboutme";
            val = $.toJSON(aboutme);
            json.aboutme = val;

        } else if (unicontactinfo[ui.id]) {

            var unicontactinfoToSave = {};
            if (json.contactinfo) {
                unicontactinfoToSave = $.parseJSON(sakai.api.Security.saneHTML(json.contactinfo));
            }
            unicontactinfoToSave[unicontactinfo[ui.id]] = value;
            key = "contactinfo";
            val = $.toJSON(unicontactinfoToSave);
            json.contactinfo = val;

        } else if (homecontactinfo[ui.id]) {

            var homecontactinfoToSave = {};
            if (json.contactinfo) {
                homecontactinfoToSave = $.parseJSON(sakai.api.Security.saneHTML(json.contactinfo));
            }
            homecontactinfoToSave[homecontactinfo[ui.id]] = value;
            key = "contactinfo";
            val = $.toJSON(homecontactinfoToSave);
            json.contactinfo = val;

        }

        var tosend = {};
        tosend[key] = val;
        tosend["_charset_"] = "utf-8";

        // This eventually should switch to a sakai.api.Server.saveJSON operation, putting each category as a separate node (ore even each entry as a separate node),
        // so that permission can be set on each element.
        $.ajax({
            url : fileUrl,
            type : "POST",
            data : tosend,
            error: function(xhr, textStatus, thrownError) {
                fluid.log("profile_edit.js: An error has occured while posting to " + fileUrl);
                $('#profile_spinner').hide();
                $('#profile_saving').hide();
           },
            success: function() {

                if (ui.id === "txt_status") {
                    // Create an activity item for the status update
                    var nodeUrl = fileUrl;
                    var activityMsg = "Status: "+toset;

                    var activityData = {
                        "sakai:activityMessage": activityMsg
                    }
                    sakai.api.Activity.createActivity(nodeUrl, "status", "default", activityData);
                }

                $('#profile_spinner').fadeOut();
                $('#profile_saving').hide();
                $('#profile_saved').css({ top: position.top, left: position.left + $(ui).width() + 50, "color": "green" }).show().fadeTo(1000, 1).fadeOut();
            }
        });

        //fillInFields(); // causing issues with IE7 textarea line breaks

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

sakai.api.Widgets.Container.registerForLoad("sakai.profile");
