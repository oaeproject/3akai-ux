var sakai = sakai || {};

sakai.blog = function(tuid, placement, showSettings){

	var rootel = $("#" + tuid);
	var siteid = placement.split("/")[0];
	var blogjson = {"date": "", "entries": []};
	var json = false;

	var doInit = function(){
		if (showSettings) {
			$("#blog_settings", rootel).show();
		}
		else {
			$("#blog_output", rootel).show();
		}

		$("#blog_current_form input", rootel).bind("change", function(ev){
			doNewBlog();
		});

		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/blog" + "?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				checkExistence(data,true);
			},
			onFail : function(status) {
				checkExistence(status,false);
			}
		});
	};

	var checkExistence= function(response, exists){
		if (exists){
			json = eval('(' + response + ')');
			blogjson["date"] = new Date(json["date"]).toLocaleString();
		} else {
			$("#blog_initial_settings", rootel).show();
		}

		showBlog();
	};

	var doNewBlog = function(){
		var el = $("#blog_current_form", rootel);
		json = sdata.FormBinder.serialize(el);
		if (isNaN(json.days)) {
			alert("Please enter a number of days.");
		}
		var earliest = new Date().getTime() - (json.days * 86400000);
		blogjson.date = new Date(earliest).toLocaleString();
		json = {"date": earliest};
		var val = sdata.JSON.stringify(json);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "blog", val, finishDoNew);
	}

	var showBlog = function(){
		sdata.Ajax.request({
			url :"/direct/blog-blog.json?location=/site/" + siteid + "&sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				var bc = eval('(' + data + ')')["blog-blog_collection"];
				for (i=0; i < bc.length; i++) {
					sdata.Ajax.request({
						url :"/direct/blog-entry.json?blogId=" + bc[i].id + "&date=" + json["date"] + "&sid=" + Math.random(),
						httpMethod : "GET",
						onSuccess : function(data2) {
							var entryjson = eval('(' + data2 + ')')["blog-entry_collection"];
							for (j=0; j< entryjson.length; j++) {
								var e = entryjson[j];
								var entry = {"author": e.ownerId, "title": e.title, "date": new Date(e.dateCreated).toLocaleString(), "link": e.entityURL};
								blogjson.entries.push(entry);
							}
							printBlog();
						},
						onFail : function(status2) {
							$("#blog_output_no_available", rootel).show();
						}
					});
				}
			},
			onFail : function(status) {
				alert("Error getting blogs for location: " + siteid);
			}
		});
	};

	var printBlog = function(){
		$("#blog_results", rootel).html(sdata.html.Template.render('blog_results_template',blogjson));
		$("#blog_results",rootel).show();
	};

	var finishDoNew = function(success){
		if (success){
			$("#blog_output",rootel).show();
			$("#blog_settings",rootel).hide();
			showBlog();
		} else {
			alert("An error has occured");
		}
	};

	doInit();

};

sdata.widgets.WidgetLoader.informOnLoad("blog");
