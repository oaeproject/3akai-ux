var sakai = sakai || {};
sakai.logout = function(){

	sdata.Ajax.request({
		url: "/rest/logout",
		httpMethod: "POST",
		onSuccess: function(data){
			document.location = "/dev/";
		},
		onFail: function(status){
			document.location = "/dev/";
		},
		postData: {"logout":"logout"},
		contentType: "multipart/form-data"
	});
	
}

sdata.registerForLoad("sakai.logout");