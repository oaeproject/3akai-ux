var sakai = sakai || {};

sakai._search = {};
sakai.search = function(){

    /*
        Config variables
     */

    var peopleToSearch = 5;

    var meObj = false;
    var foundContacts = false;
    var foundInvitations = false;
    var foundPending = false;
    var currentpage = 0;
    var profiles = {};
    var myfriends = false;

    var doInit = function(){

        meObj = sdata.me;
        if (! meObj.user.userid){
            document.location = "/dev/index.html?url=/dev/people.html";
        }

        loadContacts(1);
        loadInvitations();
        loadPending();

    };

    /*
        People search
    */

    // Pager click handler
    var pager_click_handler = function(pageclickednumber){
        currentpage = pageclickednumber;
        loadContacts(currentpage);
    };

    loadContacts = function(page){

        currentpage = parseInt(page, 10);

        // Set searching messages

        $("#contacts_search_result").html("<b>Loading ...</b>");

        $.ajax({
            url: "/_user/contacts/accepted.json?page=" + (page - 1) + "&items=" + peopleToSearch,
            success: function(data){
                foundContacts = $.evalJSON(data);
                renderContacts();
            },
            error: function(xhr, textStatus, thrownError) {
                $("#contacts_search_result").html("<b>An error has occurred.</b> Please try again later");
            }
        });

    };

    var _currentTotal = 0;

    var renderContacts = function(){

        var finaljson = {};
        finaljson.items = [];

        _currentTotal = foundContacts.total;

        // Pager Init

        $(".jq_pager").pager({ pagenumber: currentpage, pagecount: Math.ceil(_currentTotal/peopleToSearch), buttonClickCallback: pager_click_handler });

        if (foundContacts.results) {
            for (var i = 0; i < foundContacts.results.length; i++) {
                var item = foundContacts.results[i];
                var person = item.profile;
                var connection = item.details;
                profiles[item.target] = item;
                profiles[item.target].profile.uuid = item.target;
                if (person) {
                    var index = finaljson.items.length;
                    finaljson.items[index] = {};
                    finaljson.items[index].userid = item.target;
                    if (person.picture && $.evalJSON(person.picture).name) {
                        var picture = $.evalJSON(person.picture);
                        finaljson.items[index].picture = "/_user/public/" + finaljson.items[index].userid + "/" + picture.name;
                    }
                    if (person.firstName || person.lastName) {
                        var str = person.firstName;
                        str += " " + person.lastName;
                        finaljson.items[index].name = str;
                    }
                    else {
                        finaljson.items[index].name = finaljson.items[index].userid;
                    }

                    var relationships = connection["sakai:types"];
                    if (relationships) {
                        finaljson.items[index].extra = relationships;
                    } else if (person.basic) {
                        var basic = $.evalJSON(person.basic);
                        if (basic.unirole) {
                            finaljson.items[index].extra = basic.unirole;
                        }
                        else if (basic.unicollege) {
                            finaljson.items[index].extra = basic.unicollege;
                        }
                        else if (basic.unidepartment) {
                            finaljson.items[index].extra = basic.unidepartment;
                        }
                    }
                    finaljson.items[index].connected = true;
                    if (finaljson.items[index].userid == sdata.me.user.userid){
                        finaljson.items[index].isMe = true;
                    }
                }
            }
        }

        if (finaljson.items.length === 0){
            $(".jq_pager").hide();
        } else {
            $(".jq_pager").show();
        }

        $("#contacts_search_result").html($.Template.render("contacts_search_result_template", finaljson));

    };

    /*
        Invitation search
    */

    loadInvitations = function(){

        // Set searching messages

        $("#invited_search_result").html("<b>Loading ...</b>");

        $.ajax({
            url: "/_user/contacts/invited.json?page=0&items=100",
            cache: false,
            success: function(data){
                foundInvitations = $.evalJSON(data);
                renderInvitations();
            },
            error: function(xhr, textStatus, thrownError) {
                $("#invited_search_result").html("<b>An error has occurred.</b> Please try again later");
            }
        });

    };

    var renderInvitations = function(){

        var finaljson = {};
        finaljson.items = [];

        if (foundInvitations.results) {
            for (var i = 0; i < foundInvitations.results.length; i++) {
                var item = foundInvitations.results[i];
                var person = item.profile;
                if (person) {
                    var index = finaljson.items.length;
                    profiles[item.target] = item;
                    profiles[item.target].profile.uuid = item.target;
                    finaljson.items[index] = {};
                    finaljson.items[index].userid = item.target;
                    if (person.picture && $.evalJSON(person.picture).name) {
                        var picture = $.evalJSON(person.picture);
                        finaljson.items[index].picture = "/_user/public/" + finaljson.items[index].userid + "/" + picture.name;
                    }
                    if (person.firstName || person.lastName) {
                        var str = person.firstName;
                        str += " " + person.lastName;
                        finaljson.items[index].name = str;
                    }
                    else {
                        finaljson.items[index].name = finaljson.items[index].userid;
                    }
                    if (person.basic) {
                        var basic = $.evalJSON(person.basic);
                        if (basic.unirole) {
                            finaljson.items[index].extra = basic.unirole;
                        }
                        else if (basic.unicollege) {
                            finaljson.items[index].extra = basic.unicollege;
                        }
                        else if (basic.unidepartment) {
                            finaljson.items[index].extra = basic.unidepartment;
                        }
                    }
                    if (finaljson.items[index].userid == sdata.me.user.userid){
                        finaljson.items[index].isMe = true;
                    }
                }
            }
        }

        $("#invited_search_result").html($.Template.render("invited_search_result_template", finaljson));

        $(".link_accept_contact").bind("click", function(ev){
            var user = this.id.split("_")[this.id.split("_").length - 1];

            $.ajax({
                url: "/_user/contacts/" + user + ".accept.html",
                type: "POST",
                data : {"_charset_":"utf-8"},
                success: function(data){
                    setTimeout(loadContacts,500,[1]);

                    // remove from json file

                    var index = -1;
                    for (var i = 0, j = foundInvitations.results.length; i<j; i++){
                        if (foundInvitations.results[i].target == user){
                            index = i;
                        }
                    }
                    foundInvitations.results.splice(index,1);

                    // rerender

                    renderInvitations();

                },
                error: function(xhr, textStatus, thrownError) {
                    alert("An error has occured");
                }
            });

        });

    };


    /*
        Pending search
    */

    loadPending = function(){

        // Set searching messages

        $("#invited_search_result").html("<b>Loading ...</b>");

        $.ajax({
            url: "/_user/contacts/pending.json?page=0&items=100",
            cache: false,
            success: function(data){
                foundPending = $.evalJSON(data);
                renderPending();
            },
            error: function(xhr, textStatus, thrownError) {
                $("#pending_search_result").html("<b>An error has occurred.</b> Please try again later");
            }
        });

    };

    var renderPending = function(){

        var finaljson = {};
        finaljson.items = [];

        if (foundPending.results) {
            for (var i = 0; i < foundPending.results.length; i++) {
                var item = foundPending.results[i];
                var person = item.profile;
                if (person) {
                    var index = finaljson.items.length;
                    profiles[item.target] = item;
                    profiles[item.target].profile.uuid = item.target;
                    finaljson.items[index] = {};
                    finaljson.items[index].userid = item.target;
                    if (person.picture && $.evalJSON(person.picture).name) {
                        var picture = $.evalJSON(person.picture);
                        finaljson.items[index].picture = "/_user/public/" + finaljson.items[index].userid + "/" + picture.name;
                    }
                    if (person.firstName || person.lastName) {
                        var str = person.firstName;
                        str += " " + person.lastName;
                        finaljson.items[index].name = str;
                    }
                    else {
                        finaljson.items[index].name = finaljson.items[index].userid;
                    }
                    if (person.basic) {
                        var basic = $.evalJSON(person.basic);
                        if (basic.unirole) {
                            finaljson.items[index].extra = basic.unirole;
                        }
                        else if (basic.unicollege) {
                            finaljson.items[index].extra = basic.unicollege;
                        }
                        else if (basic.unidepartment) {
                            finaljson.items[index].extra = basic.unidepartment;
                        }
                    }
                    if (finaljson.items[index].userid == sdata.me.user.userid){
                        finaljson.items[index].isMe = true;
                    }
                }
            }
        }

        $("#pending_search_result").html($.Template.render("pending_search_result_template", finaljson));

    };

    $(".person_message_link").live("click", function(ev){

        var userid = this.id.split("_")[this.id.split("_").length - 1];
        if (profiles[userid]){
            sakai.sendmessage.initialise(profiles[userid].profile);
        }

    });

    doInit();

};

sdata.container.registerForLoad("sakai.search");