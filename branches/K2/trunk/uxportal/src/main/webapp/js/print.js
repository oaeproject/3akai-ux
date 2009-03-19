var sakai = sakai || {};

sakai._print = {};
sakai.print = function(){

	var doInit = function(){

		var qs = new Querystring();
		var pagetitle = qs.get("pagetitle","");
		$("#pagetitle").text(pagetitle);
	
		sdata.Ajax.request({
			url: "/sdata/p/_print/content",
			httpMethod: "GET",
			onSuccess: function(data){
				$(".content").html(data);
				window.print();
			},
			onFail: function(status){
			}
		});
	}

	doInit();

}

sdata.registerForLoad("sakai.print");