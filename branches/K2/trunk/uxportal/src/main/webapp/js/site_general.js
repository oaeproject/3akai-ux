var sakai = sakai || {};
sakai.SiteBase = {

	json : null,
	qs : null,
	v3 : null,
	currentsite: null,
	
	onInit : function(){
		qs = new Querystring();
		$("#initialcontent").hide();
		sakai.SiteBase.currentsite = qs.get("siteid","false");
		if (sakai.SiteBase.currentsite == "false"){
			document.location = "/dev/";
		} else {
			sakai.SiteBase.loadSiteInfo();
		}
	},
	
	loadSiteInfo : function(){
		var url = "/rest/site/get/" + sakai.SiteBase.currentsite + "?sid=" + Math.random();
    
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
			var skin = sakai.SiteBase.json.skin;
			sakai.SiteBase.doInit(skin);
		} else {
			
		}
	},

	doInit : function(skin){

		var url = "";

		if (skin){
			url = "/dev/skins/" + skin + "/" + skin + ".html?sid=" + Math.random();
		} else {
			url = "/dev/skins/default/default.html?sid=" + Math.random();
		}
		
		sdata.Ajax.request( {
			url : url,
			onSuccess : function(data) {
				sakai.SiteBase.processInit(data,true);
			},
			onFail : function(status) {
				sakai.SiteBase.processInit(status,false);
			}
		});

	},

	processInit: function(response, exists){
	
		if (exists) {

			var template = response;
			template = template.substring(template.toLowerCase().indexOf("<body") + 5);
			template = template.substring(template.toLowerCase().indexOf(">") + 1);
			template = template.substring(0, template.toLowerCase().indexOf("</body>"));
			
			sdata.widgets.WidgetLoader.sethtmlover("initialcontent", template);
			sdata.widgets.WidgetLoader.insertWidgets(null);
		
		} else {
			sakai.SiteBase.doInit(null);	
		}
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