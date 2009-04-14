var sakai = sakai || {};

sakai.newaccount = function(){
	
	var checkingUserExists = false;
	
	$("input").keypress(function (e) {
		if (e.which == 13){
			doSave();
		}
	});
	
	$("#save_account").bind("click", function(ev){
		doSave();
	});
	
	$("#cancel_button").bind("click", function(ev){
		document.location = "/dev/redesign/index.html";
	});
	
	var resetErrorFields = function(){
		$("input").removeClass("invalid");
		$("#username_taken").hide();
		$("#username_short").hide();
		$("#username_spaces").hide();
		$("#username_empty").hide();
		$("#firstname_empty").hide();
		$("#lastname_empty").hide();
		$("#email_empty").hide();
		$("#password_repeat_empty").hide();
		$("#password_empty").hide();
		$("#password_short").hide();
		$("#password_repeat_nomatch").hide();
		$("#uword_empty").hide();
		$("#uword_nomatch").hide();
		$("#email_invalid").hide();
		$("#username_label").css("color","#666")
		$(".create-account-notification").hide();
	}

	$("#checkUserName").bind("click", function(){
		checkingUserExists = true;
		resetErrorFields();
		checkUserName();
	});
	
	var checkUserName = function(){
		
		//check empty
		$("#saveinfo1").hide();
		$("#spacer").hide();
		
		var value = $("#username").attr("value");
		if (!value || value.replace(/ /g, "") == ""){
			resetErrorFields();
			$("#username").addClass("invalid");
			$("#username_empty").show();
			return false;
		}
		
		//check spaces
		if (value.indexOf(" ") != -1){
			resetErrorFields();
			$("#username").addClass("invalid");
			$("#username_spaces").show();
			return false;
		}
		
		//check length of username
		if (value.length < 3){
			resetErrorFields();
			$("#username").addClass("invalid");
			$("#username_short").show();
			return false;
		}
		
		//check existence
		sdata.Ajax.request({
            httpMethod: "GET",
            url: "/rest/user/" + value + "/exists?sid=" + Math.random(),
            onSuccess: function(data){
				resetErrorFields();
				$("#username").addClass("invalid");
				$("#username_taken").show();
				return false;
			}, 
			onFail : function(data){
				if (checkingUserExists){
					resetErrorFields();
					$("#username_label").css("color","#2E8A28");
					return true;
				} else {
					doCreateUser();
				}	
			}	
		});
		
	}
	
	var doCreateUser = function(){
		
		var firstname = $("#firstname").val();
		var lastname = $("#lastname").val();
		var email = $("#email").val();
		var username = $("#username").val();
		var password = $("#password").val();
		
		var data = {"userType":"default","firstName":firstname, "lastName":lastname, "email":email, "password":password, "eid": username};
		sdata.Ajax.request({
        	url :"/rest/user/new",
        	httpMethod : "POST",
        	postData : data,
        	contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {
				
				var resp = eval('(' + data + ')');
						
				$("#buttons").hide();
				$("#success_message").show();
				
			},
			onFail: function(data){
				resetErrorFields();
				//setError("<b>Oops</b> A problem has occured. Please try again");
			}
		});
		
	}
	
	var doSave = function(){
		
		$("#saveinfo1").hide();
		$("#spacer").hide();
		checkingUserExists = false;
		
		resetErrorFields();
		
		//check empty
		var errors = [];
		var error_fields = [];
		
			//firstname
			if (checkEmpty("firstname")){
				$("#firstname").addClass("invalid");
				$("#firstname_empty").show();
			}
			
			//lastname
			if (checkEmpty("lastname")){
				$("#lastname").addClass("invalid");
				$("#lastname_empty").show();
			}
			
			//email
			if (checkEmpty("email")){
				$("#email").addClass("invalid");
				$("#email_empty").show();
			}
			
			//username
			if (checkEmpty("username")){
				$("#username").addClass("invalid");
				$("#username_empty").show();
			}
			
			//password
			if (checkEmpty("password")){
				$("#password").addClass("invalid");
				$("#password_empty").show();
			}
			
			//repeat password
			if (checkEmpty("password_repeat")){
				$("#password_repeat").addClass("invalid");
				$("#password_repeat_empty").show();
			}
			
			//uword
			if (checkEmpty("uword")){
				$("#uword").addClass("invalid");
				$("#uword_empty").show();
			}
		
		
		if (errors.length > 0){
			return false;
		}
		
		//check CAPTCHA
		
		if (!jcap()){
			$("#uword").addClass("invalid");
			$("#uword_nomatch").show();
			return false;
		}
		
		//check valid email
		if (!echeck($("#email").attr("value"))){
			$("#email").addClass("invalid");
			$("#email_invalid").show();
			return false;
		}
		
		//check length password
		var pass = $("#password").val();
		if (pass.length < 4){
			$("#password").addClass("invalid");
			$("#password_short").show();
			return false;
		}
		
		//check match password
		var pass2 = $("#password_repeat").attr("value");
		if (pass != pass2){
			$("#password_repeat").addClass("invalid");
			$("#password_repeat_nomatch").show();
			return false;
		}
		
		//check username
		if (! checkUserName()){
			return false;
		}
	}
	
	var echeck = function(str) {

		var at="@"
		var dot="."
		var lat=str.indexOf(at)
		var lstr=str.length
		var ldot=str.indexOf(dot)
		if (str.indexOf(at)==-1){
		   //alert("Invalid E-mail ID")
		   return false
		}

		if (str.indexOf(at)==-1 || str.indexOf(at)==0 || str.indexOf(at)==lstr){
		   //alert("Invalid E-mail ID")
		   return false
		}

		if (str.indexOf(dot)==-1 || str.indexOf(dot)==0 || str.indexOf(dot)==lstr){
		    //alert("Invalid E-mail ID")
		    return false
		}

		 if (str.indexOf(at,(lat+1))!=-1){
		    //alert("Invalid E-mail ID")
		    return false
		 }

		 if (str.substring(lat-1,lat)==dot || str.substring(lat+1,lat+2)==dot){
		    //alert("Invalid E-mail ID")
		    return false
		 }

		 if (str.indexOf(dot,(lat+2))==-1){
		    //alert("Invalid E-mail ID")
		    return false
		 }
		
		 if (str.indexOf(" ")!=-1){
		    //alert("Invalid E-mail ID")
		    return false
		 }

 		 return true					
	}
	
	var checkEmpty = function(field){
		var value = $("#" + field).val();
		if (!value || value.replace(/ /g,"") == ""){
			return true;
		} else {
			return false;
		}
	}
	
};

sdata.registerForLoad("sakai.newaccount");