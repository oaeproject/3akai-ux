var sakai = sakai || {};
sakai.post = function(){

	$("#btn_post").bind("click", function(ev){
		
		//id, name, description, type
		
		var sitetitle = $("#name").val();
		var siteid = $("#id").val();
		var sitedescription = $("#description").val();
		var sitetype = $("#type").val();
		
		var parameters = {"name" : sitetitle, "description" : sitedescription, "id" : siteid, "type" : sitetype };

		sdata.Ajax.request({
			url: "/rest/site/create",
			httpMethod: "POST",
			onSuccess: function(data){
				showResult(data, true);
			},
			onFail: function(status){
				showResult(status, false);
			},
			postData: parameters,
			contentType: "application/x-www-form-urlencoded"
		});
		
	});
	
	var showResult = function(response, success){
		if (success){
			 $("#txt_result").text("SUCCESS");
		} else {
			 $("#txt_result").text("FAILED: " + response);
		}
	}
	
	
}

sdata.registerForLoad("sakai.post");