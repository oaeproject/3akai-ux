sdata.i18n = sdata.i18n || {};

sdata.i18n.defaultBundle = false;
sdata.i18n.localBundle = false;

sdata.events.Listener.onLoad(function() {

	document.body.style.display = "none";
	var tostring = document.body.innerHTML;
	var sdataMeUrl;
	
	if (window.location.protocol == "file:") {
		sdataMeUrl = "lib/demo_sdata_me.json";
	} else {
		sdataMeUrl = "/rest/me?sid=" + Math.random();
	}
	sdata.Ajax.request({
		url : sdataMeUrl,
		httpMethod : "GET",
		onSuccess : function(data) {
			var mejson = eval('(' + data + ')');
			sdata.Ajax.request({
				url : "/dev/bundle/default.json",
				httpMethod : "GET",
				onSuccess : function(data) {
					var defaultjson = eval('(' + data + ')');
					sdata.i18n.defaultBundle = defaultjson;
					if (mejson.locale) {
						sdata.Ajax.request({
							url: "/dev/bundle/" + mejson.locale.language + "_" + mejson.locale.country + ".json",
							httpMethod: "GET",
							onSuccess: function(data){
								var localjson = eval('(' + data + ')');
								sdata.i18n.localBundle = localjson;
								var newstring = sdata.i18n.processhtml(tostring, localjson, defaultjson);
								document.body.innerHTML = newstring;
								document.body.style.display = "block";
								sdata.readyToLoad = true;
								sdata.performLoad();
								sdata.widgets.WidgetLoader.insertWidgets(null);
							},
							onFail: function(status){
								var newstring = sdata.i18n.processhtml(tostring, null, defaultjson);
								document.body.innerHTML = newstring;
								document.body.style.display = "block";
								sdata.readyToLoad = true;
								sdata.performLoad();
								sdata.widgets.WidgetLoader.insertWidgets(null);
							}
						});
					} else {
						var newstring = sdata.i18n.processhtml(tostring, null, defaultjson);
						document.body.innerHTML = newstring;
						document.body.style.display = "block";
						sdata.readyToLoad = true;
						sdata.performLoad();
						sdata.widgets.WidgetLoader.insertWidgets(null);
					}
				},
				onFail : function(status) {
					document.body.style.display = "block";
					sdata.readyToLoad = true;
					sdata.performLoad();
					sdata.widgets.WidgetLoader.insertWidgets(null); 
				}
			});	
		},
		onFail : function(status) {
			document.body.style.display = "block";
			sdata.readyToLoad = true;
			sdata.performLoad();
			sdata.widgets.WidgetLoader.insertWidgets(null); 
		}
	});

});