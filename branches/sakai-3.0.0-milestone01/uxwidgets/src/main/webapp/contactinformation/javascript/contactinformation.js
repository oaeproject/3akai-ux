var sakai = sakai || {};

sakai.contactinformation = function(tuid, placement, showSettings){

	var rootel = $("#" + tuid);
	var mockupfeed = {items : [{id:1, url:"/dev/demo/CI1.xml",title:"Noah Botimer"},{id:2, url:"/dev/demo/CI2.xml",title:"John Doe"}]};
	var formtype = {items : [{id: 1, name: "Contact Information"},{id: 2, name: "Resume"}]};

	var loadSettings = function(){
		$("#contactinformation_list_output", rootel).html(sdata.html.Template.render('contactinformation_list_template',mockupfeed));
	}
	
	var finishSaving = function(success){
		if (success){
			$("#contactinformation_settings",rootel).hide();
			$("#contactinformation_output",rootel).show();
			doOutput();
		} else {
			alert("An error has occured");
		}
	}
	
	var doOutput = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/contactinformation?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				fillOutput(data);
			},
			onFail : function(status) {
				$("#contactinformation_output",rootel).html("No contact information selected");
			}
		});
	}
	
	var fillOutput = function(response){
		var saved = eval('(' + response + ')');
		var id = parseInt(saved["contactinformation_selected"]);
		for (var i = 0; i < mockupfeed.items.length; i++){
			var el = mockupfeed.items[i];
			if (el.id == id){
				sdata.Ajax.request({
					url :el.url + "?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						var myJsonObject=xml2json.parser(data);
						$("#ci_firstname",rootel).text(myJsonObject.contactinformation.firstname);
						$("#ci_lastname",rootel).text(myJsonObject.contactinformation.lastname);
						$("#ci_email",rootel).text(myJsonObject.contactinformation.email);
						//$("#contactinformation_output",rootel).html(sdata.JSON.stringify(myJsonObject));
					},
					onFail : function(status) {
						$("#contactinformation_output",rootel).html("No contact information found");
					}
				});
			}
		}
	}
	
	$("#contactinformation_save", rootel).bind("click", function(ev){
		var string = sdata.JSON.stringify(sdata.FormBinder.serialize($("#contactinformation_selection", rootel)));
		//alert(json["contactinformation_selected"]);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "contactinformation", string, finishSaving);
	});

	if (showSettings) {
		$("#contactinformation_settings",rootel).show();
		loadSettings();
	}
	else {
		$("#contactinformation_output",rootel).show();
		doOutput();
	}

};

sdata.widgets.WidgetLoader.informOnLoad("contactinformation");