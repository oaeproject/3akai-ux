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
		$("#change-selected-members").click(function() {
			if ($(this).hasClass("active")) {
				var memberData = {"membership_collection": [{  "userId": "UserABC", "active": false}]};
				$.ajax({
					type: "PUT",
					url: jsonUrl,
					data: memberData,
					success: function(data) {
						$(".msg-success").show();
						refreshJson();
					}
				});
			}
		});

        if (window.location.protocol == "file:") {
            console.log("using local data........");
            jsonUrl = "js/demo_site_membership.json";
        } else {
            var qs = new Querystring();
            var siteId = qs.get("site");
            console.log("siteId is "+siteId);

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
                findInActiveMembers();
            }
        });
    }

	function saveChanges(memberId, changedProps) {
		$.post("/direct/membership/" + memberId, changedProps, function(data) {
			$(".msg-success").show();
			refreshJson();
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
		$("#membership-table-tablesorter").trigger("update");	// Needed for tablesorter
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

	//function to delete selected item. iterates through selected items and deletes each one when more than one item is selected
	function deleteSelectedMembers(){
		var selectedMembers = $("#membership-table input:checked");
		if (selectedMembers.length > 0) {
			var targetMemberId;
			var additionalParams;
			$.each(selectedMembers, function(index, item) {
				if (index == 0) {
					targetMemberId = $(item).attr("id");
					targetMemberId = targetMemberId.slice(0, targetMemberId.lastIndexOf(".member-"));
					if (console) console.log("Deleting targetMemberId=" + targetMemberId);
				} else {
					if (index == 1) {
						additionalParams = {userIds: []};
					}
					var userId = $(item).attr("id").split("::")[0];
					if (console) console.log("Also deleting userId=" + userId);
					additionalParams.userIds.push(userId);
				}
			});

			// Work around jquery.ajax bug: treats DELETE like POST instead of like GET.
			var targetUrl = "/direct/membership/" + targetMemberId;
			if (additionalParams) {
				additionalParams = $.param(additionalParams);
				targetUrl += (targetUrl.match(/\?/) ? "&" : "?") + additionalParams;
			}

			$.ajax({
				type: "DELETE",
				url: targetUrl,
				// data: additionalParams,
				success: function(data) {
					$(".msg-success").show();
					refreshJson();
				}
			});
		}
	}

	function findInActiveMembers(){
		var statusItems = $(".memberStatus");
		var targetRowId;
		if($(".memberStatus").length > 0){
			$.each($(".memberStatus"),function(index,item){
				if($(item).val() == "false"){
					targetRowId = $(item).attr("id");
					targetRowId = targetRowId.slice(0, targetRowId.lastIndexOf(".member-"));
					toggleInactiveRows(targetRowId);
				}
			});
		}
	}

	function toggleInactiveRows(rowId){
		if(console)console.log("current row id "+rowId);
		//disable role select
		$("tr[id="+rowId+"]").find('.memberRole').attr("disabled","disabled");
		//change row color
		$("tr[id="+rowId+"]").removeClass("bgF8F9FA").addClass("bgEBECED");
		//change font color
		$("tr[id="+rowId+"]").addClass("cCCCCCC");
		$("tr[id="+rowId+"]").find(".fs13").addClass("cCCCCCC");
	}

    function refreshMembersScreen() {
		json["userRoles"] = siteJson.userRoles;
        sdata.html.Template.render("membership-table-template", json, $("#membership-table"));
        sdata.html.Template.render("membership-count-template", json, $("#membership-count"));
//        $("#membership-table select").change(memberChanged);
        $("select.memberRole,select.memberStatus").change(memberChanged);
//        $("#membership-table input:checkbox").change(checkboxChanged);
//        $("#membership-table-template input:checkbox").change(checkboxChanged);
        $("input:checkbox").change(checkboxChanged);
        $(".selectAllMembers").click(selectAllCheckboxes);
        $(".selectAllVisibleMembers").click(selectAllVisibleCheckboxes);
        $(".unselectMembers").click(unSelectAllCheckboxes);
        $('#delete-selected-members').click(deleteSelectedMembers);
        $("#command-selected-members").addClass("inactive");
        $("#membership-table-tablesorter")
        .tablesorter({
			widgets: ['zebra'],
			// debug: true,
			textExtraction: function(node) {
				var t = "";
				if (node.childNodes[0]) {
					var inner = $("input,select", node);
					if (inner.length > 0) {
						// jQuery val() returns "on" for unchecked checkboxes
						if ((inner.val() !== undefined) && (inner.attr("checked") !== false)) {
							t = inner.val();
						}
					} else {
						// Default tablesorter logic below.
						if(node.childNodes[0] && node.childNodes[0].hasChildNodes()) {
							t = node.childNodes[0].innerHTML;
						} else {
							t = node.innerHTML;
						}
					}
				}
				return t;
			}
		}).tablesorterPager({container: $("#pager"), positionFixed: false});
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
