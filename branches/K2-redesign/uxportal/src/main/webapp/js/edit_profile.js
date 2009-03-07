var sakai = sakai || {};

var profileinfo_userId = false;

sakai.editprofile = function(){
    
	var profileinfo = false;
	
	sdata.Ajax.request({
		httpMethod: "GET",
		url: "/sdata/me?sid=" + Math.random(),
		onSuccess: function(data){
			var me = eval('(' + data + ')');
			$("#user_id").text(me.items.firstname + " " + me.items.lastname);
		},
		onFail: function(status){
				
		}
	});	
	
	var init = function(){
        $("#back_dashboard").attr("href","/dev/dashboard.html");
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/sdata/prfc",
            responseType: 'json',
            onSuccess: function(data)
            {
                var pref_json_feed = data;
             	document.getElementById("preferences_choose_timezone").innerHTML = "";
                timezone_array = [];
                timezone_array.items = [];
                var list = pref_json_feed.timezonelist;
                default_zone_list = list;
                for(key in list)
                {
                    var index = timezone_array.items.length;
                    timezone_array.items[index] = [];
                    timezone_array.items[index].title = list[key];
                    if(pref_json_feed.timezone == list[key])
                    {
                        timezone_array.items[index].show = true;
                        selected_zone = list[key];
                        default_zone = selected_zone;
                    }
                    else
                        timezone_array.items[index].show = false;
                }
                document.getElementById("preferences_choose_timezone").innerHTML = sdata.html.Template.render("preferences_timezones", timezone_array);
                
                var languages = pref_json_feed.languages;
                default_language_list = languages;
                var language_show = pref_json_feed.locale;
                var html = [];
                html.push('<select onchange="sakai.preferences.valuechanged();">');
                for (var i = 0; i < languages.length; ++i)
                {
                    var item = languages[i];
                    if (item.id == language_show)
                    {
                        selected_language = item.id;
                        default_language = selected_language;
                        html.push('<option selected="selected" onclick="sakai.preferences.selectLanguage(\'' + item.id + '\')">' + item.displayName + '</option>');
                    }
                    else
                        html.push('<option onclick="sakai.preferences.selectLanguage(\'' + item.id + '\')">' + item.displayName + '</option>');
                }
                html.push('</select>');
                document.getElementById("preferences_choose_language").innerHTML = html.join("");
            }
        });
		
		var select = document.getElementById("years");
		for (var i = 2008 ; i >= 1900; i--){
			var option = new Option(i,i);
			select.options[select.options.length] = option;
		}
		
		loadProfile();
		
    }
	
	var loadProfile = function(){
		
		sdata.Ajax.request({
        	httpMethod: "GET",
            url: "/sdata/profile?sid=" + Math.random(),
            onSuccess: function(data)
            {
				profileinfo = eval('(' + data + ')');
				profileinfo_userId = profileinfo.userId;
				
				if (profileinfo.basic){
					sdata.FormBinder.deserialize($("#form_1"), eval('(' + profileinfo.basic + ')'));
				}
				if (profileinfo.picture){
					var json = eval('(' + profileinfo.picture + ')');
					$("#picture_holder").html("<img src='/sdata/f/public/" + profileinfo.userId + "/" + json.name + "' width='250px'/>");
				}
				if (profileinfo.aboutme){
					sdata.FormBinder.deserialize($("#form_3"), eval('(' + profileinfo.aboutme + ')'));
				}
				if (profileinfo.contactinfo){
					sdata.FormBinder.deserialize($("#form_4"), eval('(' + profileinfo.contactinfo + ')'));
				}
				
				$("#firstname").attr("value", profileinfo.firstName);
				$("#lastname").attr("value", profileinfo.lastName);
				var link = document.location.protocol + "//" + document.location.host + "/site/~" + profileinfo.userId;
				$("#portfolio").html("<a href='" + link + "'>" + link + "</a>");
				
				$("#picture_form").attr("action","/sdata/f/public/" + profileinfo.userId);
				$("#realname").attr("value", profileinfo.userId);
				
			},
			onFail: function(status){	
			}
		});
		
		sdata.Ajax.request({
        	httpMethod: "GET",
            url: "/dev/resources/countries_by_name.json",
            onSuccess: function(data)
            {
				var countries = eval('(' + data + ')');
				var select = document.getElementById("homecountry");
				for (var i in countries){
					var option = new Option(i,i);
					select.options[select.options.length] = option;
				}
				if (profileinfo){
					if (profileinfo.aboutme){
						sdata.FormBinder.deserialize($("#form_3"), eval('(' + profileinfo.aboutme + ')'));
					}
				}
			},
			onFail : function(status){
				
			}
		});
		
	}
	
	$("#1_save").bind("click", function(ev){
		
		var basic = sdata.JSON.stringify(sdata.FormBinder.serialize($("#form_1")));
		var firstName = $("#firstname").attr("value");
		var lastName = $("#lastname").attr("value");
		var data = {"firstName" : firstName, "lastName" : lastName, "basic" : basic};
		
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
		
	});
	
	$("#3_save").bind("click", function(ev){
		
		var aboutme = sdata.JSON.stringify(sdata.FormBinder.serialize($("#form_3")));
		var data = {"aboutme" : aboutme};
		
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
		
	});
	
	$("#4_save").bind("click", function(ev){
		
		var contactinfo = sdata.JSON.stringify(sdata.FormBinder.serialize($("#form_4")));
		var data = {"contactinfo" : contactinfo};
		
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
		
	});
	
	$("#profile_upload").bind("click", function(ev){});
	
	var hideAllPanes = function(){
		$("#link_basic").removeClass("on");
		$("#link_picture").removeClass("on");
		$("#link_aboutme").removeClass("on");
		$("#link_contactinfo").removeClass("on");
		$("#tab_basic").hide();
		$("#tab_picture").hide();
		$("#tab_aboutme").hide();
		$("#tab_contactinfo").hide();
	}
	
	$("#link_basic").bind("click", function(ev){
		hideAllPanes();
		$("#link_basic").addClass("on");
		$("#tab_basic").show();
	});
	
	$("#link_picture").bind("click", function(ev){
		hideAllPanes();
		$("#link_picture").addClass("on");
		$("#tab_picture").show();
	});
	
	$("#link_aboutme").bind("click", function(ev){
		hideAllPanes();
		$("#link_aboutme").addClass("on");
		$("#tab_aboutme").show();
	});
	
	$("#link_contactinfo").bind("click", function(ev){
		hideAllPanes();
		$("#link_contactinfo").addClass("on");
		$("#tab_contactinfo").show();
	});

    init();
	
};

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


sdata.registerForLoad("sakai.editprofile");
