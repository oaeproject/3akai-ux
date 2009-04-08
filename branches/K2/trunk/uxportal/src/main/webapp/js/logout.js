var sakai = sakai || {};
sakai.logout = function(){

	var LOGIN_PAGE = "/dev/redesign/index.html";

	sdata.Ajax.request({
		url: "/rest/logout",
		httpMethod: "POST",
		onSuccess: function(data){
			document.location = LOGIN_PAGE;
		},
		onFail: function(status){
			document.location = LOGIN_PAGE;
		},
		postData: {"logout":"logout"},
		contentType: "multipart/form-data"
	});
	
}

sdata.registerForLoad("sakai.logout");