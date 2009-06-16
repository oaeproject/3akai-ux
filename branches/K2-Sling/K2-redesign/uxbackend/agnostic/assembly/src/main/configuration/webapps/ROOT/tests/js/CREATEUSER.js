var sakai = sakai || {};
sakai.post = function(){

	$("#btn_post").bind("click", function(ev){
		
		//id, name, description, type
		
		var firstName = $("#firstname").val();
		var userType = $("#type").val();
		var lastName = $("#lastname").val();
		var email = $("#email").val();
		var password = $("#password").val();
		var eid = $("#id").val();
		
		var parameters = {"userType":userType,"firstName":firstName, "lastName":lastName, "email":email, "password":password, "eid": eid};
		
		sdata.Ajax.request({
			url: "/rest/user/new",
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