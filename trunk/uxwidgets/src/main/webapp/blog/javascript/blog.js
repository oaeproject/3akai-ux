var sakai = sakai || {};

sakai.blog = function(tuid, placement, showSettings){

	var json = {};
	json.items = {};
	var currentsite = false;

	var loadComments = function(){
		sdata.Ajax.request({
			url :"/sdata/comments?placement=" + tuid + "/" + placement + "&sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				renderComments(data,true);
			},
			onFail : function(status) {
				renderComments(status,false);
			},
			sendToLoginOnFail: "false"
		});
	}

	var renderComments = function(response, exists){
		if (exists) {
			json = eval('(' + response + ')');
		}
		else if (response == "401" || response == "403") {
			$("#blog_output").html("<hr/>Please log in to see this widget");
		} else {
			json = {};
			json.items = [];
		}
		
		var newjson = {};
		newjson.items = [];
		
		for (var index = json.items.length - 1; index >= 0; index--){
			newjson.items[newjson.items.length] = json.items[index];
		}
		
		sdata.html.Template.render('blog_rendered_template',newjson,$("#" + tuid + " #blog_rendered"));
	}

	var showCommentsBox = function(){
		$("#" + tuid + " #blog_add_box").show();
	}

	var saveNewComment = function(){
		var value= $("#" + tuid + " #blog_add_textbox").val();
		var newvalue = $("#" + tuid + " #blog_add_title").val();
		if (!value || value.replace(/ /g,"") == "" || !newvalue || newvalue.replace(/ /g,"") == ""){
			alert("Please enter a value");
		} else {
			
			var parameters = {"comment" : newvalue + "<br/><br/>" + value, "placement" : tuid + "/" + placement};

			sdata.Ajax.request({
				url :"/sdata/comments",
				httpMethod : "POST",
				onSuccess : function(data) {
					checksuccess(true);
				},
				onFail : function(status) {
					checksuccess(false);
				},
				postData : parameters,
				contentType : "application/x-www-form-urlencoded"
			});
			
			hideCommentsBox();
		}
	}

	var checksuccess = function(success){
		if (success){
			loadComments();
		} else {
			alert("An error has occured");
		}
	}		

	var hideCommentsBox = function(){
		$("#" + tuid + " #blog_add_box").hide();
	}

	$("#" + tuid + " #blog_add_blog").bind("click",function(ev){
		showCommentsBox();
	});
	$("#" + tuid + " #add_blog_cancel").bind("click",function(ev){
		hideCommentsBox();
	});
	$("#" + tuid + " #add_blog_button").bind("click",function(ev){
		saveNewComment();
	});
	
	var checkSiteRole = function(){
		
		var str = document.location.pathname;
		var spl = str.split("/");
		currentsite = spl[2];
		
		sdata.Ajax.request({
			url: "/sdata/site?siteid=" + currentsite,
			onSuccess: function(response){
				var site = eval('(' + response + ')');
				if (site.isMaintainer){
					$("#blog_add").show();
				} else {
					$("#blog_add").hide();
				}
			},
			onFail: function(httpstatus){
				// Ignore
			}
		});
		
	};

	if (showSettings){
		$("#" + tuid + " #blog_output").hide();
		$("#" + tuid + " #blog_settings").show();
		loadComments();
	} else {
		$("#" + tuid + " #blog_output").show();
		$("#" + tuid + " #blog_settings").hide();
		
		checkSiteRole();
		
		loadComments();
	}

};

sdata.widgets.WidgetLoader.informOnLoad("blog");