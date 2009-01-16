var sakai = sakai || {};
sakai.SiteBase = {

	json : null,
	qs : null,
	v3 : null,
	currentsite: null,
	
	onInit : function(){
		$("#initialcontent").hide();
		var str = document.location.pathname;
		var spl = str.split("/");
		sakai.SiteBase.currentsite = spl[2];
		if (sakai.SiteBase.currentsite == "false"){
			document.location = "/dev/";
		} else {
			sakai.SiteBase.loadSiteInfo();
		}
	},
	
	loadSiteInfo : function(){
		var url = "/sdata/skin?site=" + sakai.SiteBase.currentsite + "&sid=" + Math.random();
    
		sdata.Ajax.request( {
			url : url,
			onSuccess : function(data) {
				sakai.SiteBase.processSiteInfo(data,true);
			},
			onFail : function(status) {
				sakai.SiteBase.processSiteInfo(status,false);
			}
		});
	},
	
	processSiteInfo : function(response, exists){
		if (exists) {
			sakai.SiteBase.json = eval('(' + response + ')');
			sakai.SiteBase.processInit();
		} else {
			
		}
	},

	processInit: function(response, exists){
	
		var template = sakai.SiteBase.json.skin;
		template = template.substring(template.toLowerCase().indexOf("<body") + 5);
		template = template.substring(template.toLowerCase().indexOf(">") + 1);
		template = template.substring(0, template.toLowerCase().indexOf("</body>"));
			
		sdata.widgets.WidgetLoader.sethtmlover("initialcontent", template);
		sdata.widgets.WidgetLoader.insertWidgets(null);
		
	}

}

sdata.events.Listener.onLoad(function() {
	document.body.style.display = "block";
	try {
		
		sakai.SiteBase.onInit();
	} catch (err){}
	sdata.readyToLoad = true;
	sdata.performLoad();
	sdata.widgets.WidgetLoader.insertWidgets(null);
});