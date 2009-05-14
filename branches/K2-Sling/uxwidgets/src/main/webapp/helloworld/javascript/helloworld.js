var sakai = sakai || {};

sakai.helloworld = function(tuid,placement,showSettings){

	/*
	 * Configuration variables
	 */
	
	var defaultColor = "#000000";
	var saveLocation = "color.txt";
	
	/*
	 * Dom identifiers
	 */
	
	var rootel = $("#" + tuid);
	var settingsContainer = "#settingsHelloContainer";
	var viewContainer = "#mainHelloContainer";
	var colorPicker = "#helloworld_color";
	var usernameContainer = "#helloworld_username";
	
	
	/*
	 * Functions 
	 */

	var doInit = function(){
		if (showSettings) {
			getPreferedColor(selectCurrentColor);
			$(settingsContainer, rootel).show();
		} else {
			var me = sdata.me;
			$(usernameContainer, rootel).text(me.profile.firstName);
			getPreferedColor(showHelloWorld);
		}
	}

	var getPreferedColor = function(callback){
		$.ajax({
			url: "/sdata/p/" + placement + "/" + tuid + "/" + saveLocation,
			cache : false,
			success: function(data){
				callback(data);
			},
			error: function(status){
				callback(defaultColor);
			}
		});
	}
	
	var showHelloWorld = function(color){
		$(viewContainer + " p", rootel).css("color",color);
		$(viewContainer, rootel).show();
	}
	
	var selectCurrentColor = function(color){
		var select = $(colorPicker,rootel).get(0);
		var toSelect = 0;
		for (var i = 0; i < select.options.length; i++){
			var option = select.options[i];
			option.value == color ? toSelect = i : null;
		}
		select.selectedIndex = toSelect;
	}
	
	$("#helloworld_save").bind("click", function(ev){
		var select = $(colorPicker, rootel).get(0);
		var selected = select.options[select.selectedIndex].value;
		sdata.widgets.WidgetPreference.save("/sdata/p/" + placement + "/" + tuid, saveLocation, selected, function(){
			sdata.container.informFinish(tuid, "helloworld");
		});
	});
	
	doInit();

};

sdata.widgets.WidgetLoader.informOnLoad("helloworld");