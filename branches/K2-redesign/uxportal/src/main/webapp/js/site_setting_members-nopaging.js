var sakai = sakai || {};
sakai.siteSettingsMembers = function(){
	var jsonUrl;
	var json;

	/*** Start of copy from site_setting_general.js - TODO refactor ***/
	var siteJson;
	var getSiteJsonUrl = function() {
		var siteJsonUrl;
		if (window.location.protocol == "file:") {
			siteJsonUrl = "js/demo_site.json";
		} else {
			var qs = new Querystring();
			var siteId = qs.get("site");
			if (siteId) {
				siteJsonUrl = "/direct/site/" + siteId + ".json";
			}
		}
		getSiteJsonUrl = function() {
			return siteJsonUrl;
		};
		return getSiteJsonUrl();
	};
	function refreshSiteJson() {
		// Work around Entity Broker JSON caching.
		$.ajax({
		  type: "GET",
		  url: getSiteJsonUrl(),
		  dataType: "json",
		  cache: false,
		  success: function(data){
			siteJson = data;
			refreshSiteScreen();
		  }
		});
	}
	function removeSuccessMessages() {
		$(".msg-success").hide();
	}
	/*** End of copy from site_setting_general.js - TODO refactor ***/

	function init() {
		$(".msg-success .msg-remove a").click(removeSuccessMessages);

		$("#command-selected-members").change(function() {
			if ($(this).val()) {
				$("#change-selected-members").removeClass("inactive").addClass("active");
			} else {
				$("#change-selected-members").removeClass("active").addClass("inactive");
			}
		});

		if (window.location.protocol == "file:") {
			jsonUrl = "js/demo_site_membership.json";
		} else {
			var qs = new Querystring();
			var siteId = qs.get("site");
			if (siteId) {
				jsonUrl = "/direct/membership/site/" + siteId + ".json";
			}
		}
		refreshSiteJson();
		refreshJson();
		$("div.ss-members").show();
	}

	function refreshJson() {
		// Work around Entity Broker JSON caching.
		$.ajax({
			type: "GET",
			url: jsonUrl,
			dataType: "json",
			cache: false,
			success: function(data){
				json = data;
				refreshMembersScreen();
				findInactiveMembers();
			},
			error: function(xmlHttpRequest, textStatus, errorThrown) {
				$(".msg-error .msg-text").text(xmlHttpRequest.statusText || errorThrown || textStatus);
				$(".msg-error").show();
			}
		});
	}

	function saveChanges(memberId, changedProps) {
		$.ajax({
			type: "POST",
			url: "/direct/membership/" + memberId,
			data: changedProps,
			success: function(data){
				$(".msg-success").show();
				refreshJson();
			},
			error: function(xmlHttpRequest, textStatus, errorThrown) {
				$(".msg-error .msg-text").text(xmlHttpRequest.statusText || errorThrown || textStatus);
				$(".msg-error").show();
			}
		});
	}

	function memberChanged() {
		var elementId = $(this).attr("id");
		var markerPos = elementId.lastIndexOf(".member-");
		if (markerPos >= 0) {
			var memberProp = elementId.slice(markerPos + ".member-".length);
			var memberId = elementId.slice(0, markerPos);
			if (console) console.log("memberId=" + memberId + ", memberProp=" + memberProp);
			var changedMember = {};
			changedMember[memberProp] = $(this).val();
			saveChanges(memberId, changedMember);
		}
	}

	function checkboxChanged() {
		// If any rows have been selected, enable the bottom
		// buttons. Otherwise, disable them.
		if ($("#membership-table input:checked").length > 0) {
			$("#delete-selected-members").removeClass("inactive").addClass("active");
			$("#command-selected-members").removeClass("inactive").removeAttr("disabled");
		} else {
			$("#delete-selected-members").removeClass("active").addClass("inactive");
			$("#command-selected-members").addClass("inactive").attr("disabled", "true");
		}
		$(".selected-count").text($("#membership-table input:checked").length);
	}

	function selectAllCheckboxes(){
		$(".checkbox").attr('checked', true);
		checkboxChanged();
		return false;
	}

	function selectAllVisibleCheckboxes(){
		$(".checkbox").attr('checked', true);
		checkboxChanged();
		return false;
	}

	function unSelectAllCheckboxes(){
		$(".checkbox").attr('checked', false);
		checkboxChanged();
		return false;
	}

	function getSelectedMembersData() {
		var selectedMembers = {};
		var checkedBoxes = $("#membership-table input:checked");
		$.each(checkedBoxes, function(index, item) {
			if (index == 0) {
				var targetMemberId;
				targetMemberId = $(item).attr("id");
				targetMemberId = targetMemberId.slice(0, targetMemberId.lastIndexOf(".member-"));
				if (console) console.log("Selected targetMemberId=" + targetMemberId);
				selectedMembers.targetMemberId = targetMemberId;
			} else {
				if (index == 1) {
					selectedMembers.additionalParams = {userIds: []};
				}
				var userId = $(item).attr("id").split("::")[0];
				if (console) console.log("Also selected userId=" + userId);
				selectedMembers.additionalParams.userIds.push(userId);
			}
		});
		return selectedMembers;
	}

	function updateSelectedMembers() {
		var updateCommand = $("#command-selected-members").val().replace("selected-members-", "");
		updateCommand = updateCommand.split("-");
		var params = {};
		params[updateCommand[0]] = updateCommand[1];
		var selectedMembers = getSelectedMembersData();
		if (selectedMembers.targetMemberId !== undefined) {
			var targetUrl = "/direct/membership/" + selectedMembers.targetMemberId;
			if (selectedMembers.additionalParams) {
				params.userIds = selectedMembers.additionalParams.userIds;
			}
			$.ajax({
				type: "POST",
				url: targetUrl,
				data: params,
				success: function(data){
					$(".msg-success").show();
					refreshJson();
				},
				error: function(xmlHttpRequest, textStatus, errorThrown) {
					$(".msg-error .msg-text").text(xmlHttpRequest.statusText || errorThrown || textStatus);
					$(".msg-error").show();
				}
			});
		}
	}

	function deleteSelectedMembers(){
		var selectedMembers = getSelectedMembersData();
		if (selectedMembers.targetMemberId !== undefined) {
			// Work around jquery.ajax bug: treats DELETE like POST instead of like GET.
			var targetUrl = "/direct/membership/" + selectedMembers.targetMemberId;
			if (selectedMembers.additionalParams) {
				var additionalParams = $.param(selectedMembers.additionalParams);
				targetUrl += (targetUrl.match(/\?/) ? "&" : "?") + additionalParams;
			}

			$.ajax({
				type: "DELETE",
				url: targetUrl,
				success: function(data) {
					$(".msg-success").show();
					refreshJson();
				}
			});
		}
	}

	function findInactiveMembers(){
		$(".memberStatus").each(function(index, item) {
			if($(item).val() == "false"){
				var rowParent = $(item).parents("tr");
				$("a", rowParent).addClass("c999999");
				$(".memberRole", rowParent).attr("disabled","disabled");
			}
		});
	}

	function refreshMembersScreen() {
		json["userRoles"] = siteJson.userRoles;
		$(".membership-count").text(json.membership_collection.length);
		sdata.html.Template.render("membership-table-template", json, $("#membership-table"));
		sdata.html.Template.render("selected-members-roles-template", json, $("#selected-members-roles"));
		$("#membership-table select").change(memberChanged);
		$("#membership-table input:checkbox").change(checkboxChanged);
		$(".selectAllMembers").click(selectAllCheckboxes);
		$(".selectAllVisibleMembers").click(selectAllVisibleCheckboxes);
		$(".unselectMembers").click(unSelectAllCheckboxes);
		$('#delete-selected-members').click(deleteSelectedMembers);
		$("#change-selected-members").click(updateSelectedMembers);
		$("#command-selected-members").addClass("inactive");
		$("#change-selected-members").removeClass("active").addClass("inactive");
	}

	function refreshSiteScreen() {
		document.title = siteJson.title + " - Members Settings";
		$("#back_site").attr("href", "/site/" + siteJson.id);
		$(".site-title").text(siteJson.title);
		$("a.site-setting-link").attr("href", "site_setting_general.html?site=" + siteJson.id);
	}

	init();
};

sdata.registerForLoad("sakai.siteSettingsMembers");
