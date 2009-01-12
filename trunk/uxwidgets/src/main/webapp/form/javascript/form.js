var sakai = sakai || {};

sakai.form = function(tuid, placement, showSettings){

	var rootel = $("#" + tuid);
	var step1 = false;
	var step2 = false;
	var step3 = false;
	var formid = false;
	var templateid = false;
	var dataid = false;
	var dataurl = false;

	var loadSettings = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/step1?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				var json = eval('(' + data + ')');
				formid = json["form_step1_selected"];
				checkStep2();
			},
			onFail : function(status) {
				$("#form_step1", rootel).show();
				sdata.Ajax.request({
					url :"/direct/forms/types.json?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						step1 = eval('(' + data + ')');
						$("#form_step1_output", rootel).html(sdata.html.Template.render('form_step1_template',step1));
					},
					onFail : function(status) {
						alert("An error has occured");
					}
				});
			}
		});
	}
	
	$("#form_goto_step2", rootel).bind("click", function(ev){
		var string = sdata.JSON.stringify(sdata.FormBinder.serialize($("#form_step1_form", rootel)));
		formid = sdata.FormBinder.serialize($("#form_step1_form", rootel))["form_step1_selected"];
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "step1", string, checkStep2);
	});
	
	var checkStep2 = function(){
		$("#form_step1").hide();
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/step2?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				var json = eval('(' + data + ')');
				templateid = json["form_step2_selected"];
				checkStep3();
			},
			onFail : function(status) {
				$("#form_step2", rootel).show();
				sdata.Ajax.request({
					url :"/dev/demo/forms_template_" + formid + ".json?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						step2 = eval('(' + data + ')');
						$("#form_step2_output", rootel).html(sdata.html.Template.render('form_step2_template',step2));
					},
					onFail : function(status) {
						alert("An error has occured");
					}
				});
			}
		});
	}
	
	$("#form_goto_step3", rootel).bind("click", function(ev){
		var string = sdata.JSON.stringify(sdata.FormBinder.serialize($("#form_step2_form", rootel)));
		templateid = sdata.FormBinder.serialize($("#form_step2_form", rootel))["form_step2_selected"];
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "step2", string, checkStep3);
	});
	
	var checkStep3 = function(){
		$("#form_step2").hide();
		$("#form_step3").show();
		sdata.Ajax.request({
			url :"/direct/forms/forms/" + formid + ".json?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				step3 = eval('(' + data + ')');
				$("#form_step3_output", rootel).html(sdata.html.Template.render('form_step3_template',step3));
			},
			onFail : function(status) {
				alert("An error has occured");
			}
		});
	}
	
	$("#form_save_step3", rootel).bind("click", function(ev){
		var obj = sdata.FormBinder.serialize($("#form_step3_form", rootel));
		dataid = sdata.FormBinder.serialize($("#form_step3_form", rootel))["form_step3_selected"];
		for (var i = 0; i < step3.items.length; i++){
			var item = step3.items[i];
			if (item.id == dataid){
				obj.url = item.url;
			}
		}
		var string = sdata.JSON.stringify(obj);
		sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "step3", string, loadPreview);
	});
	
	var loadPreview = function(){
		$("#form_step3").hide();
		$("#contactinformation_output",rootel).show();
		doOutput();
	}
	
	var finishSaving = function(success){
		/*
if (success){
			$("#contactinformation_settings",rootel).hide();
			$("#contactinformation_output",rootel).show();
			doOutput();
		} else {
			alert("An error has occured");
		}
*/
	}
	
	var doOutput = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/step1?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				var json1 = eval('(' + data + ')');
				formid = json1["form_step1_selected"];
				sdata.Ajax.request({
					url :"/sdata/f/" + placement + "/" + tuid + "/step2?sid=" + Math.random(),
					httpMethod : "GET",
					onSuccess : function(data) {
						var json2 = eval('(' + data + ')');
						templateid = json2["form_step2_selected"];
						sdata.Ajax.request({
							url :"/sdata/f/" + placement + "/" + tuid + "/step3?sid=" + Math.random(),
							httpMethod : "GET",
							onSuccess : function(data) {
								var json3 = eval('(' + data + ')');
								dataid = json3["form_step3_selected"];
								dataurl = json3["url"];
								renderForm();
							},
							onFail : function(status) {
								$("#contactinformation_output",rootel).html("Please configure me");
							}
						});
					},
					onFail : function(status) {
						$("#contactinformation_output",rootel).html("Please configure me");
					}
				});
			},
			onFail : function(status) {
				$("#contactinformation_output",rootel).html("Please configure me");
			}
		});
	}
	
	var renderForm = function(){
		// Get template
		
		sdata.Ajax.request({
			url :"/dev/demo/forms_template_" + formid + ".json?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				step2 = eval('(' + data + ')');
				for (var i = 0; i < step2.items.length; i++){
					if (step2.items[i].id == templateid){
						sdata.Ajax.request({
							url : step2.items[i].url + "?sid=" + Math.random(),
							httpMethod : "GET",
							onSuccess : function(data) {
								$("#contactinformation_template",rootel).html("<div id='template_" + formid + "_" + templateid + "' style='display:none'><!-- " + data + " --></div>");
								loadXmlData();
							},
							onFail : function(status) {
								$("#contactinformation_output",rootel).html("Please configure me");
							}
						});
					}
				}
			},
			onFail : function(status) {
				$("#contactinformation_output",rootel).html("Please configure me");
			}
		});
		
	}
	
	var loadXmlData = function(){
		// Get xml data --> json
		
		sdata.Ajax.request({
			url : dataurl + "?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
					var myJsonObject = xml2json.parser(data);
					//alert($("#" + 'template_' + formid + "_" + templateid).html());
					//alert(sdata.html.Template.render('template_' + formid + "_" + templateid, myJsonObject));
					$("#contactinformation_output", rootel).html(sdata.html.Template.render('template_' + formid + "_" + templateid, myJsonObject));
				},
				onFail: function(status){
					$("#contactinformation_output", rootel).html("Please configure me");
				}
			});
		
		// Render them together
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

sdata.widgets.WidgetLoader.informOnLoad("form");