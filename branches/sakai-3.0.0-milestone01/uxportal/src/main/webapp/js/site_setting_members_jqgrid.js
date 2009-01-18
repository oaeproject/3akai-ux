var sakai = sakai || {};
sakai.siteSettingsMembers = function(){
    var jsonUrl;
    var json;
    var mydata;          	
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
	
	
	
    function loadGrid(){
	
        var lastsel2;
        
        $("#table1").jqGrid({
            datatype: "clientSide",  
            height:300,          
            colNames:['Members','Email', 'Last Login', 'Role','Status'],
            colModel:[
            {name:'Members',index:'Members',sorttype:"text",editable:false},
            {name:'Email',index:'Email', sorttype:"text"},
            {name:'Login',index:'Login', sorttype:"date",datefmt:"mm/dd/yyyy"},
            {name:'Role',index:'Role',sorttype:"text",editable: true,edittype:"select",editoptions:{value:"Instructor:Instructor;Student:Student;TA:TA"}},
            {name:'Status',index:'Status',sorttype:"text",editable: true,edittype:"select",editoptions:{value:"Active:Active;InActive:InActive;"}}
                    ],
            onSelectRow: function(id){ 
	            console.log("Current select row "+id + " last selected id "+lastsel2);
	            if(id && id!==lastsel2){ 
		            $('#table1').restoreRow(lastsel2);
	                $('#table1').editRow(id,true); lastsel2=id; 
	                } 
	              }, 
	        editurl:"",                             
            imgpath: 'lib/jqGrid/themes/basic',
            //multiselect: true,                      
        });        
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
            }
        });
    }
    
    function removeSuccessMessages() {
        $(".msg-success").hide();
    }
	

    function init() {
	    	  	   	    
        if (window.location.protocol == "file:") {
            if(console)console.log("using local data........");
            jsonUrl = "js/demo_site_membership.json";
        } else {
            var qs = new Querystring();
            var siteId = qs.get("site");
            if(console)console.log("siteId is "+siteId);
            if (siteId) {
                jsonUrl = "/direct/membership/site/" + siteId + ".json";
            }
        } 
        
        loadGrid();
        //loadData();
        //displayTable();
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
         	mydata = [];
                
                $.each(json.membership_collection,function(i,item){	               
	                var statusString = "InActive";
	                if(item.active) statusString = "Active";	                	                
	                var rowdata = {
		                Members:item.userDisplayName,
		                Email:item.userEmail,
		                Login:new Date(item.lastLoginTime).toLocaleString(),
		                Role:item.memberRole,		                
		                Status:statusString	                    
	                }
	                mydata[i] = rowdata;
	                
                });

                
	  for(var i=0;i<=mydata.length;i++){
            $("#table1").addRowData(i+1,mydata[i]);
            //console.log(i);
        }
        
        }
    });
}
    init();
};

sdata.registerForLoad("sakai.siteSettingsMembers");
