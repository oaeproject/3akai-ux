var sakai = sakai || {};
sakai.sites_edit = function(){
	
	sdata.widgets.WidgetLoader.insertWidgets("createsitecontainer");

	// Populate all my sites total
	var init = function() {
		sdata.Ajax.request({
			httpMethod: "GET",
			url: "/sdata/mcp?sid=" + Math.random(),
			onSuccess: function(data){
				sitesJson = eval('(' + data + ')');
				sdata.Ajax.request({
					httpMethod: "GET",
					url: "/sdata/me",
					onSuccess: function(data){
						profileJson = eval('(' + data + ')');
						// Remove 'MyWorkspace' from the list of sites to display
						for (i=0; i<sitesJson.items.length; i++)
						{
							if (sitesJson.items[i].id == profileJson.items.workspace)
							{
								sitesJson.items.splice(i,1);
								break;
							}
						}
						renderAllSitesTotal(sitesJson);
						// Maybe mcp should be extended to have the ownerId so we wouldn't have to match on fullname
						renderSitesTable(sitesJson, profileJson.items.firstname + " " + profileJson.items.lastname);
					}
				});
			}
		});
	};

	var renderAllSitesTotal = function(siteList) {
		var total = { total : siteList.items.length };
		$("#allSitesFolder_out").html(sdata.html.Template.render("allSitesFolder_template", total));
		$("#edit_my_sites_number_indicator").text("" + total.total);
	};
	
	$("#button_create_new_site").bind("click", function(ev){
		$("#createsitecontainer").show();
		sakai.createsite.initialise();
		return false;
	});


	var buildYuiDataTable = function(sitesJson, username) {
		var siteLinkFormatter = function(elCell, oRecord, oColumn, oData) {
			var siteName = oData;
			var siteId = oRecord.getData('id');
			elCell.innerHTML = "<a href=\"/site/" + siteId  + "\">" + siteName + "</a>";
		};
		var activeFormatter = function(elCell, oRecord, oColumn, oData) {
			if (oData)
			{
				elCell.innerHTML = "Active";
			} else {
				elCell.innerHTML = "Inactive";
			}
		};
		var leaveLinkFormatter = function(elCell, oRecord, oColumn, oData) {
			var siteOwner = oRecord.getData('owner');
			var siteId = oRecord.getData('id');
			if (siteOwner == username)
			{
				elCell.innerHTML = "N/A*";
			}
			else
			{
				elCell.innerHTML =
					"<a href='#' onclick=\"sakai.sites_edit().leaveSite('" + siteId + "'); return false\">Leave</a>";
			}
		};
		//{key:"site-checked", label:" ", formatter:"checkbox", sortable:true,
		//		className:"w28 bgEBECED"},
		var myColumnDefs = [
			{key:"title", label:"Site Name",
				formatter:siteLinkFormatter,
				sortable:true, className:"per47 fs13 siteName"},
			{key:"owner", label:"Site Owner", formatter:"string", sortable:true, className:"per21 fs13"},
			{key:"active", label:"Status",
				formatter:activeFormatter, sortable:true, className:"per16"},
			{key:"action", label:"Action",
				formatter:leaveLinkFormatter,
				sortable:true, className:"per16"}
		];
		var myDataSource = new YAHOO.util.DataSource(sitesJson);
		myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSON;
		myDataSource.responseSchema = {
			resultsList: "items",
			fields: ["title","owner","id","active"]
		};

		var oConfigs = {
			paginator: new YAHOO.widget.Paginator({
				rowsPerPage: 10,
				totalRecords: sitesJson.items.length,
				template: ""
			})
		};

		var myDataTable = new YAHOO.widget.DataTable("sites-table", myColumnDefs, myDataSource, oConfigs);

		myDataTable.subscribe("checkboxClickEvent", function(oArgs){
			var elCheckbox = oArgs.target;
			var record = this.getRecord(elCheckbox);
			record.setData("site-checked", elCheckbox.checked);
			checkboxChanged();
		});

		return myDataTable;
	};

	var renderSitesTable = function(sitesJson, username) {

		yuiDataTable = buildYuiDataTable(sitesJson, username);
		var paginator = yuiDataTable.getState().pagination.paginator;
		$(".nextPage").click(function() {
			if (paginator.hasNextPage()) {
				paginator.setPage(paginator.getNextPage());
			}
		});
		$(".prevPage").click(function() {
			if (paginator.hasPreviousPage()) {
				paginator.setPage(paginator.getPreviousPage());
			}
		});
		yuiDataTable.subscribe("renderEvent", function(oEvent) {
			if (!paginator.hasNextPage()) {
				$(".nextPage").addClass("nonbuttonInactive");
			} else {
				$(".nextPage").removeClass("nonbuttonInactive");
			}
			if (!paginator.hasPreviousPage()) {
				$(".prevPage").addClass("nonbuttonInactive");
			} else {
				$(".prevPage").removeClass("nonbuttonInactive");
			}
		});
	};

	var removeSuccessMessages = function() {
		$("#msg-success").hide();
	};

	$("#msg-success .msg-remove a").click(removeSuccessMessages);
	init();

	return {
		leaveSite : function(siteId) {
			removeSuccessMessages();
			sdata.Ajax.request({
				httpMethod: "POST",
				postData: { "action": "unjoin", "siteid": siteId },
				contentType : "application/x-www-form-urlencoded",
				url: "/sdata/mcp",
				onSuccess: function(data){
					init();
					$("#msg-success").show();
				}
			});
		}
	}
};

sdata.registerForLoad("sakai.sites_edit");
