var sakai = sakai || {};
sakai.post = function(){

	$("#btn_post").bind("click", function(ev){
		var jsonstring = "test";
		sdata.widgets.WidgetPreference.save("/sdata/p/widgets","devstate",jsonstring, showResult);
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