var sakai = sakai || {};

sakai.comments = function(tuid, placement, showSettings){

	var json = {};
	json.items = {};

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
			$("#comments_output").html("<hr/>Please log in to see this widget");
		} else {
			json = {};
			json.items = {};
		}
		sdata.html.Template.render('comments_rendered_template',json,$("#" + tuid + " #comments_rendered"));
	}

	var showCommentsBox = function(){
		$("#" + tuid + " #comments_add_box").show();
	}

	var saveNewComment = function(){
		var value= $("#" + tuid + " #comment_add_textbox").attr("value");
		if (!value || value.replace(/ /g,"") == ""){
			alert("Please enter a value");
		} else {
			
			var parameters = {"comment" : value, "placement" : tuid + "/" + placement};

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
		$("#" + tuid + " #comments_add_box").hide();
	}

	$("#" + tuid + " #comments_add_comment").bind("click",function(ev){
		showCommentsBox();
	});
	$("#" + tuid + " #add_comment_cancel").bind("click",function(ev){
		hideCommentsBox();
	});
	$("#" + tuid + " #add_comment_button").bind("click",function(ev){
		saveNewComment();
	});

	if (showSettings){
		$("#" + tuid + " #comments_output").hide();
		$("#" + tuid + " #comments_settings").show();
		loadComments();
	} else {
		$("#" + tuid + " #comments_output").show();
		$("#" + tuid + " #comments_settings").hide();
		loadComments();
	}

};

sdata.widgets.WidgetLoader.informOnLoad("comments");