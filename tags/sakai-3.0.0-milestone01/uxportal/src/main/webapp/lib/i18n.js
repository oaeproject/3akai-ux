sdata.events.Listener.onLoad(function() {

	document.body.style.display = "none";
	var tostring = document.body.innerHTML;
	var sdataMeUrl;
	
	if (window.location.protocol == "file:") {
		sdataMeUrl = "lib/demo_sdata_me.json";
	} else {
		sdataMeUrl = "/sdata/me?sid=" + Math.random();
	}
	sdata.Ajax.request({
		url : sdataMeUrl,
		httpMethod : "GET",
		onSuccess : function(data) {
			var mejson = eval('(' + data + ')');
			sdata.Ajax.request({
				url : "bundle/default.json",
				httpMethod : "GET",
				onSuccess : function(data) {
					var defaultjson = eval('(' + data + ')');
					if (mejson.items.userLocale) {
						sdata.Ajax.request({
							url: "bundle/" + mejson.items.userLocale.language + "_" + mejson.items.userLocale.country + ".json",
							httpMethod: "GET",
							onSuccess: function(data){
								var localjson = eval('(' + data + ')');
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