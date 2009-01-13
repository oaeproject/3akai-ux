var sakai = sakai || {};
sakai.preferences = function(){
	
	var default_annc_notif;
	var default_mailarchive_notif;
	var default_resources_notif;
	var default_syllabus_notif;
	var display_syllabus = false;
    
	var init = function(){
        $("#back_dashboard").attr("href","/dev/dashboard.html");
        sdata.Ajax.request({
            httpMethod: "GET",
            url: "/sdata/prfc",
            responseType: 'json',
            onSuccess: function(data)
            {
                var pref_json_feed = data;
                
                default_annc_notif = data.anncNotifPref;
                default_mailarchive_notif = data.mailArchiveNotifPref;
                default_resources_notif = data.resourcesNotifPref;
                default_syllabus_notif = data.syllabusNotifPref;
                
                if (default_syllabus_notif != null) {
                	display_syllabus = true;
                }
                
                $("#preferences_choose_annc_notif").html(sdata.html.Template.render("preferences_annc_notif", pref_json_feed));
                $("#preferences_choose_mail_notif").html(sdata.html.Template.render("preferences_mail_notif", pref_json_feed));
                $("#preferences_choose_resources_notif").html(sdata.html.Template.render("preferences_resources_notif", pref_json_feed));
                if (display_syllabus) {
                	$("#preferences_choose_syll_notif").html(sdata.html.Template.render("preferences_syll_notif", pref_json_feed));
                }
            }
        });
    }

    init();

    sakai.preferences.saveNotifPref = function(){
    	//clear out alert message(s)
    	$("#save_success").hide();
    	
    	var data;
        var annc_notif = $("input[@name='anncNotif']:checked").val();
        var mailarchive_notif = $("input[@name='mailArchiveNotif']:checked").val();
        var resources_notif = $("input[@name='resourcesNotif']:checked").val();
        
        if (display_syllabus) {
        	var syllabus_notif = $("input[@name='syllNotif']:checked").val();
        	data = {"annc_notif":annc_notif,"mailarchive_notif":mailarchive_notif,"resources_notif":resources_notif,"syllabus_notif":syllabus_notif};
        } else {
        	data = {"annc_notif":annc_notif,"mailarchive_notif":mailarchive_notif,"resources_notif":resources_notif};
        }
        
        sdata.Ajax.request({
            url :"/sdata/prfc?savemode=savenoti",
            httpMethod : "POST",
            postData : data,
            contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {
        		default_annc_notif = annc_notif;
        		default_mailarchive_notif = mailarchive_notif;
        		default_resources_notif = resources_notif;
        		default_syllabus_notif = syllabus_notif;
        		
        		$("#preferences_undo_id1").hide();
                $("#preferences_undo_id2").show();
                $("#save_success").show();
				$("#spacer").show();
            },
            onFail : function(status) {
                //TODO ?
            }
        });
    }
    
    sakai.preferences.undo = function(){
		$("#save_success").hide();
    	$("input[@name='anncNotif']").each( function () {
    		if ($(this).val() == default_annc_notif)
    			$(this).attr("checked","checked");
    	});
    	
    	$("input[@name='mailArchiveNotif']").each( function () {
    		if ($(this).val() == default_mailarchive_notif)
    			$(this).attr("checked","checked");
    	});
    	
    	$("input[@name='resourcesNotif']").each( function () {
    		if ($(this).val() == default_resources_notif)
    			$(this).attr("checked","checked");
    	});
    	
    	if (display_syllabus) {
    		$("input[@name='syllNotif']").each( function () {
    			if ($(this).val() == default_syllabus_notif)
    				$(this).attr("checked","checked");
    		});
    	}

        $("#preferences_undo_id1").hide();
        $("#preferences_undo_id2").show();
    }
    
    sakai.preferences.valuechanged = function(){
        $("#preferences_undo_id1").show();
        $("#preferences_undo_id2").hide();
    }
    
    sakai.preferences.removeSuccessMsg = function() {
    	$("#save_success").hide();
		$("#spacer").hide();
    }
    
};

sdata.registerForLoad("sakai.preferences");
