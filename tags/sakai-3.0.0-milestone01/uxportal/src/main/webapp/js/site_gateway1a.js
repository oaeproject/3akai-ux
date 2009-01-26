var sakai = sakai || {};
sakai.siteGateway1a = function(){

    var siteJson;
    var userJson;
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

    function init() {
        refreshSiteJson();
        getCurrentUserId();
        $("#join-site").click(joinSite);
    }

    /**
     * from site_setting members
     */
    function joinSite(){
        var postUrl = "/direct/membership/join/site/" + siteJson.id;
        $.ajax({
            type: "POST",
            url: postUrl,
            success: function(data){
                document.location = "/site/" + siteJson.id;
               // $("#join-site").hide();
                //$("#msg-success-default").show();
                // var siteLocation = "/dev/site_home_page.html?siteid="+siteJson.entityId;
                // $("#site-location").attr("href",siteLocation);
            },
            error: function(xmlHttpRequest, textStatus, errorThrown) {
                $(".msg-error .msg-text").text(xmlHttpRequest.statusText || errorThrown || textStatus);
                $(".msg-error").show();
                $("#msg-success-spacer").show();
            }
        });
		return false;
    }

    function refreshSiteJson() {
        // Work around Entity Broker JSON caching.
        $.ajax({
            type: "GET",
            url: getSiteJsonUrl(),
            dataType: "json",
            cache: false,
            success: function(data){
                siteJson = data;
                $("#site-title").text(siteJson.title);
				if (siteJson.description) {
					$('.site-gateway1-p').text(sdata.util.stripHTML(siteJson.description));
				} else {
					$('.site-gateway1-p').html("<i>No description provided</i>");
				}
				$("#joinstring").text("Join " + siteJson.title);
				
				//sign-for-account3-div
				$.ajax({
		            type: "GET",
		            url: "/sdata/mcp",
		            dataType: "json",
		            cache: false,
		            success: function(data){
		                
						var member = false;
						for (var i = 0; i < data.items.length; i++){
							if (data.items[i].id == siteJson.id){
								member = true;
							}
						}
						
						if (member){
							$(".sign-for-account3-div").html("<a href='/site/" + siteJson.id + "'>Visit " + siteJson.title + "</a>");
						}
						
						$(".sign-for-account3-div").show();	
						
		            }
		        });
            }
        });
    }

    function getCurrentUserId(){
        $.ajax({
            type: "GET",
            url: "/sdata/me",
            dataType: "json",
            cache: false,
            success: function(data){
                userJson = data;
                $("#user-name").text(userJson.items.displayId);                
            }
        });
    }

    function removeSuccessMessages() {
		$(".msg-success-default").hide();
	}
	function removeErrorMessages() {
		$(".msg-error-default").hide();		
	}

    init();
};

sdata.registerForLoad("sakai.siteGateway1a");
