var sakai = sakai || {};

sakai.tangler = function(tuid, placement, showSettings){

	var functiontodoaftersettings = false;
	var rootel = $("#" + tuid);
	var argumentsCalleeDone = false;

	var fillInUniqueId = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/tangler?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				showForum(data,true);
			},
			onFail : function(status) {
				showForum(status,false);
			}
		});
	}
	
	var loadSavedId = function(){
		sdata.Ajax.request({
			url :"/sdata/f/" + placement + "/" + tuid + "/tangler?sid=" + Math.random(),
			httpMethod : "GET",
			onSuccess : function(data) {
				$("#tangler_code",rootel).val(data);
			},
			onFail : function(status) {
			}
		});
	}

	var showForum = function(response, exists){
		if (exists){
			try {
		
				var split = response.split("<script");

				//extract div
				var div = split[0];

				//extract ID & gID
				var start = split[1].split("embedtopic.js?id=");
				var start2 = split[1].split("&gId=");
				var id = start[1].split("&")[0];
				var gid = start2[1].split("\"")[0];

				//execute their code
				$("#tangler_output",rootel).html(div);

				// quit if this function has already been called
				if (argumentsCalleeDone) return;
		
				// flag this function so we don't do the same thing twice
				argumentsCalleeDone = true;
		
				// topic identifier
				//var id = params['id'];
				//if( !checkParam(id, "Tangler: Embed Topic ID not set.") )return;
		
				// forum identifier
				//var gId = params['gId'];
				//if( !checkParam(gId, "Tangler: Embed Forum ID not set.")) return;
		
				var eleId = "tangler-embed-topic-" + id;
				var embedElement = $("#" + eleId, rootel)[0];
				
				var contextUrl = false;
				//var contextUrl = params['cUrl'];
		
				var width = "410px";
				var height = "480px";
		
				if( embedElement.style )
				{
					width = embedElement.style.width?embedElement.style.width:'410px';
					height = embedElement.style.height?embedElement.style.height:'480px';
				}
				var iframeSrc = 'http://www.tangler.com/embed/topic/' + id;
				if( contextUrl )
					iframeSrc = contextUrl + "/embed/topic/" + id;
					
				var iframe = document.createElement("iframe");
				iframe.src = iframeSrc;
				iframe.width = width;
				iframe.height = height;
				iframe.scolling = 'no';
				iframe.marginwidth = '0';
				iframe.marginheight = '0';
				iframe.frameBorder = '0';
				iframe.style.border = 0;
				var isIE = window.ActiveXObject?true:false;
				if( !isIE ) 
				{
					var a = document.createElement("a");
					a.href = 'http://localhost:8080/forum/id-' + gid + '/topic/' + id;
					a.target = "_blank";
					a.appendChild(document.createTextNode("Join this disucssion"));
					iframe.appendChild(a);
				}
	
	
				embedElement.appendChild(iframe);


			} catch (err){

				alert(err);

				$("#tangler_output", rootel).text("No valid Tangler forum found");
			}
		} else {
			$("#tangler_output", rootel).text("No valid Tangler forum found");
		}
	}

	var saveNewSettings = function(){
		var val = $("#tangler_code",rootel).val();
		if (!val || val.replace(/ /g,"%20") == ""){
			sdata.Ajax.request({
				url :"/sdata/f/" + placement + "/" + tuid + "/tangler?sid=" + Math.random(),
				httpMethod : "DELETE",
				onSuccess : function(data) {
					finishNewSettings(true);
				},
				onFail : function(status) {
					finishNewSettings(false);
				}
			});
		}
		else {
			sdata.widgets.WidgetPreference.save("/sdata/f/" + placement + "/" + tuid, "tangler", val, finishNewSettings);
		}
	}

	var finishNewSettings = function(success){
		sdata.container.informFinish(tuid);
	}

	if (showSettings){
		$("#" + tuid + " #tangler_output").hide();
		$("#" + tuid + " #tangler_settings").show();
		loadSavedId();
	} else {
		$("#" + tuid + " #tangler_settings").hide();
		$("#" + tuid + " #tangler_output").show();
		fillInUniqueId();
	}

	$("#tangler_save", rootel).bind("click",function(e,ui){
		saveNewSettings();
	});
	$("#tangler_cancel", rootel).bind("click",function(e,ui){
		sdata.container.informCancel(tuid);
	});

};

sdata.widgets.WidgetLoader.informOnLoad("tangler");