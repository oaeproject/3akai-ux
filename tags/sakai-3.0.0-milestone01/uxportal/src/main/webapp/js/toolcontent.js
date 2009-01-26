var sakai = sakai || {};
sakai.toolcontent = function(){

	var siteid = null;
	var toolurl = null;
	var tooltitle = null;

	var getVars = function(){
		var qs = new Querystring();
		siteid = qs.get("siteid","false");
		toolurl = qs.get("url","false");
		tooltitle = qs.get("title","false");
		var toolid = qs.get("id","false");

		var id = toolurl.replace(/~/g,"x").replace(/!/g,"x").replace(/-/g,"x");

		$("#tooltitle").text(tooltitle);
		var iframestring = "<iframe id='Main" + id + "' name='Main" + id + "' width='100%' src='/portal/tool/" + toolurl + "' frameborder='0'></iframe>";
		$("#tooltitle").attr("href","/portal/tool-reset/" + toolurl + "?panel=Main");
		$("#tooltitle").attr("target","Main" + id);
		
		//Make the Help link active
		//onclick="openWindow('/portal/help/main?help=" + sakai.resources + "', 'Help','resizable=yes,toolbar=no,scrollbars=yes,menubar=yes,width=800,height=600'); return false" title="Help for Resources" href="http://localhost:8080/portal/help/main?help=sakai.resources"
		$("#tool_help").attr("href","/portal/help/main?help=" + toolid);
		$("#tool_help").attr("Title","Help for " + tooltitle);
		$("#tool_help").bind("click", function(ev){
			window.open('/portal/help/main?help=' + toolid, 'Help','resizable=yes,toolbar=no,scrollbars=yes,menubar=yes,width=800,height=600'); 
			return false;
		});
		
		$("#main3").html(iframestring);
		if (siteid.substring(0,1) == "~" || siteid.substring(0,1) == "!"){
			$("#previoussitelink").attr("href","/dev/dashboard.html");
		} else {
			$("#previoussitelink").attr("href","/dev/site_home_page.html?siteid=" + siteid);
		}

		sdata.Ajax.request({
			url: '/sdata/site?siteid=' + siteid,
			responseType: 'json',
			onSuccess: function(data)
			{
				var json = data;
				$("#previoussitename").text(json.title);			
				$("#sitename").text(json.title);			
			}
		});

	}

	getVars(); 

};

sdata.registerForLoad("sakai.toolcontent");