var sakai = sakai || {};
sakai.siteSettingsGeneral = function(){
	var siteJson;

	var getSiteJsonUrl = function() {
		var siteJsonUrl;
		if (window.location.protocol == "file:") {
			siteJsonUrl = "js/demo_site.json";
		} else {
			var qs = new Querystring();
			var siteId = qs.get("site");
			if (siteId) {
				siteJsonUrl = "/direct/site/" + siteId + ".json?sid=" + Math.random();
			}
		}
		getSiteJsonUrl = function() {
			return siteJsonUrl;
		};
		return getSiteJsonUrl();
	};

	function refreshSiteJson() {
		// Work around Entity Broker JSON caching.
		sdata.Ajax.request( {
			httpMethod : "GET",
			url : getSiteJsonUrl(),
			onSuccess : function(data) {
				siteJson = eval('(' + data + ')');
				refreshSiteScreen();
			}
		});
	}

	function init() {
		$("input,textarea,select").change(valueChanged);
		$(".undo-changes").click(undo);
		$(".save").click(saveChanges);
		$(".msg-error .msg-remove a").click(removeErrorMessages);
		$(".msg-success .msg-remove a").click(removeSuccessMessages);

		$(".site-joinable").click(function() {
			if ($("#site-joinable-3")[0].checked == true) {
				$("#site-joiner-roles-display").show();
			} else {
				$("#site-joiner-roles-display").hide();
			}
		});

		refreshSiteJson();
		$("#site_setting_general").show();
	}

	function valueChanged() {
		$(".undo-changes").removeClass("undo-changes").addClass("undo-changes-active");
	}
	
	function saveStep2(postUrl, changedData, data, data2){
		//.anon selected
		
		if ($("#site-joinable-1")[0].checked) {
			$.post(postUrl, data, function(response){
				saveStep3(postUrl, changedData, data, data2);
			});
			changedData.pubView = true;
			changedData.joinable = true;
		}
		else {
			$.ajax({
				type: "DELETE",
				url: postUrl + "?f=ro&roleId=.anon&siteid=" + siteJson.id,
				data: data,
				success: function(msg){
			   	 saveStep3(postUrl, changedData, data, data2);
			    }
			});
		}
		
	}
	
	function saveStep3(postUrl, changedData, data, data2){
		//.anon selected
		
		if ($("#site-joinable-1")[0].checked) {
			$.post(postUrl, data2, function(data){
				saveStep4(postUrl, changedData, data, data2)
			});
		}
		else {
			saveStep4(postUrl, changedData, data, data2)
		}
		
	}
	
	function saveStep3(postUrl, changedData, data, data2){
	
		if ($("#site-joinable-3")[0].checked){
			changedData.pubView = true;
			changedData.joinable = true;
			changedData.joinerRole = $("#site-joiner-role").val();
		}
		
		if ($("#site-joinable-4")[0].checked){
			changedData.pubView = false;
			changedData.joinable = false;
		}
		
		var postUrl = "/direct/site/" + siteJson.id;
		if (changedData.joinable == "true") {
			changedData.joinerRole = $("#site-joiner-role option:selected").val();
		}
		$.post(postUrl, changedData, function(data) {				
			$(".msg-success").show();
			refreshSiteJson()
		});	
	}
	
	function saveStep1(postUrl, changedData, data, data2){
		//.auth selected
			
		if ($("#site-joinable-2")[0].checked) {
			$.post(postUrl, data2, function(response) {
				saveStep2(postUrl, changedData, data, data2)
			});
			changedData.pubView = true;
			changedData.joinable = true;
		} else {
			$.ajax({
			   type: "DELETE",
			   url: postUrl + "?f=ro&roleId=.auth&siteid=" + siteJson.id,
			   data: data2,
			   success: function(msg){
			   	saveStep2(postUrl, changedData, data, data2)
			   }
			 });
		}
	}

	function saveChanges() {
		removeErrorMessages();
		removeSuccessMessages();
		
		if (isValid()) {
			
			var postUrl = "/sdata/site/" + siteJson.id;
			var data = {
				f: "ro",
				siteid : siteJson.id,
				roleId : ".anon"
			}
			var data2 = {
				f: "ro",
				siteid : siteJson.id,
				roleId : ".auth"
			}
			var select = document.getElementById("site-skin");
			var selectedSkin = select.options[select.selectedIndex].value;
			var changedData = {
				title: $("#site-title").val(),
				shortDescription: $("#site-description").val(),
				published: $("input[name='site-published']:checked").val(),
				skin: selectedSkin
			};
			
			
			saveStep1(postUrl, changedData, data, data2);
			
		}
	}

	function refreshSiteScreen() {
		document.title = siteJson.title + " - General Settings";
		$("#back_site").attr("href", "/site/" + siteJson.id);

		$(".site-title").text(siteJson.title);
		$(".site-owner-name").text(siteJson.siteOwner.userDisplayName);
		$(".site-id").text(siteJson.id);

		$("#site-title").val(siteJson.title);
		$("#site-description").val(siteJson.shortDescription);
		
		var toselect = 0;
		var select = document.getElementById("site-skin");
		for (var i = 0; i < select.options.length; i++){
			if (select.options[i].value == siteJson.skin){
				toselect = i;
			}
		}
		select.selectedIndex = toselect;
		
		if (siteJson.published) {
			$("input[name='site-published'][value='true']").attr("checked","checked");
		} else {
			$("input[name='site-published'][value='false']").attr("checked","checked");
		}

		// Include .auth and .anon
			
			var cont = true;
			
			// Check .anon
			if (cont) {
				for (var i = 0; i < siteJson.userRoles.length; i++) {
					if (siteJson.userRoles[i] == ".anon") {
						cont = false;
						$("#site-joinable-1").attr("checked", "checked");
					}
				}
			}
			
			// Check .auth	
			if (cont){
				for (var i = 0; i < siteJson.userRoles.length; i++) {
					if (siteJson.userRoles[i] == ".auth") {
						cont = false;
						$("#site-joinable-2").attr("checked", "checked");
					}
				}
			}
			
			if (cont){
				if (siteJson.joinable) {
					$("#site-joinable-3").attr("checked","checked");
					$("#site-joiner-roles-display").show();
				} else {
					$("#site-joinable-4").attr("checked","checked");
					$("#site-joiner-roles-display").hide();
				}
			}

		$("select#site-joiner-role").html("");
		for (var i = 0; i < siteJson.userRoles.length; i++) {
			var role = siteJson.userRoles[i];
			var selected = (role == siteJson.joinerRole) ? " selected" : "";
			$('<option value="' + role + '"' + selected + '>' + role + '</option>').appendTo($("select#site-joiner-role"));
		}

		$("a.site-members-link").attr("href", "site_setting_members.html?site=" + siteJson.id);

		$(".undo-changes-active").removeClass("undo-changes-active").addClass("undo-changes");
	}

	function undo() {
		removeErrorMessages();
		removeSuccessMessages()
		refreshSiteScreen();
	}

	function isValid() {
		// Site name (AKA "title") is mandatory.
		var siteTitle = $("#site-title").val();
		if (!siteTitle) {
			$("#site-title-label").addClass("msg-error-cause");
			$(".msg-error .msg-text").text("Please enter a site name.");
			$(".msg-error").show();
			return false;
		} else {
			return true;
		}
	}

	function removeErrorMessages() {
		$(".msg-error-cause").removeClass("msg-error-cause");
		$(".msg-error").hide();
	}
	function removeSuccessMessages() {
		$(".msg-success").hide();
	}

	init();
};

sdata.registerForLoad("sakai.siteSettingsGeneral");
