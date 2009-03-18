var History = {

	history_cur : -1,
	readyForReload : false,

	historyChange : function(newLocation, historyData) {
		History.checkChange();
	},

	checkChange : function(){
		var str = "" + document.location;
		var hashIndex = str.indexOf("#");
		var ourarg = 1;
		if (hashIndex != -1){
			var hashString = str.substring(hashIndex + 1);
			var hashInt = parseInt(hashString);
			if (hashString == "" || hashInt == -1){
				hashInt = 1;
			}
			ourarg = hashInt;
		}
	},

	history_change : function(){
		var str = "" + document.location;
		var hashIndex = str.indexOf("#");
		var ourarg = "";
		if (hashIndex != -1){
			var hashString = str.substring(hashIndex + 1);
			ourarg = hashString;
		}
		if (ourarg != History.history_cur){
			History.history_cur = ourarg;
			if (ourarg){
				sakai._search.doSearch(parseInt(ourarg.split("|")[1]),ourarg.split("|")[1]);
			} else {
				sakai._search.reset();
			}
		}
		setTimeout("History.history_change()",100);
	}, 

	addBEvent: function(id){

		var a = new Array();
		a[0] = "" + id;
		a[1] = "" + id;
		dhtmlHistory.add(a[0],a[1]);

	}

}

window.dhtmlHistory.create({debugMode: false});

window.onload = function() {
	dhtmlHistory.initialize();
	dhtmlHistory.addListener(History.historyChange);
};