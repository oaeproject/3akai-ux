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
	
	var resetErrorFields = function(){
		$("#firstname_label").css("color","");
		$("#lastname_label").css("color","");
		$("#email_label").css("color","");
		$("#username_label").css("color","");
		$("#password_label").css("color","");
		$("#password_repeat_label").css("color","");
		$("#uword_label").css("color","");
	}
	
	var setErrorField = function(id){
		$("#" + id).css("color","rgb(250,0,0)");
	}
	
	var setError = function(string){
		$("#warning1").show();
		$("#spacer").show();
		$("#alert_id1").html(string);
	}
	
	var hideError = function(){
		$("#warning1").css("height","1em");
		$("#warning1").hide();
		$("#spacer").hide();
	}
	
	$("#hideSuccess").bind("click", function(ev){
		$("#saveinfo1").hide();
		$("#spacer").hide();
	});
	
	$("#hideError").bind("click", function(ev){
		hideError();
	})

	$("#checkUserName").bind("click", function(){
		checkingUserExists = true;
		$("#saveinfo1").hide();
		$("#spacer").hide();
		resetErrorFields();
		hideError();
		checkUserName();
		//doCreateSite();
	});
	
	var checkUserName = function(){
		
		//check empty
		$("#saveinfo1").hide();
		$("#spacer").hide();
		
		var value = $("#username").attr("value");
		if (!value || value.replace(/ /g, "") == ""){
			resetErrorFields();
			setErrorField("username_label");
			setError("The username shouldn't be empty");
			return false;
		}
		
		//check spaces
		if (value.indexOf(" ") != -1){
			resetErrorFields();
			setErrorField("username_label");
			setError("The username shouldn't contain spaces");
			return false;
		}
		
		//check length of username
		if (value.length < 3){
			resetErrorFields();
			setErrorField("username_label");
			setError("The username should be at least 3 characters long");
			return false;
		}
		
		//check existence
		sdata.Ajax.request({
            httpMethod: "GET",
            url: "/rest/user/" + value + "/exists?sid=" + Math.random(),
            onSuccess: function(data){
				resetErrorFields();
				setErrorField("username_label");
				setError("The username already exists");
				return false;
			}, 
			onFail : function(data){
				if (checkingUserExists){
					resetErrorFields();
					$("#username_label").css("color","#2E8A28");
					return true;
				} else {
					doCreateSite();
				}	
			}	
		});
		
	}
	
	var doCreateSite = function(){
		var firstname = $("#firstname").attr("value");
		var lastname = $("#lastname").attr("value");
		var email = $("#email").attr("value");
		var username = $("#username").attr("value");
		var password = $("#password").attr("value");
		
		var data = {"userType":"default","firstName":firstname, "lastName":lastname, "email":email, "password":password, "eid": username};
		sdata.Ajax.request({
        	url :"/rest/user/new",
        	httpMethod : "POST",
        	postData : data,
        	contentType : "application/x-www-form-urlencoded",
            onSuccess : function(data) {
				
				var resp = eval('(' + data + ')');
						
				$("#saveinfo1").show();
				$("#spacer").show();
				$("#check_availability").hide();
				$("#save_account").hide();
				$("#cancel_button").text("Go Back");
				
			},
			onFail: function(data){
				resetErrorFields();
				setError("<b>Oops</b> A problem has occured. Please try again");
			}
		});
		
	}
	
	var doSave = function(){
		
		$("#saveinfo1").hide();
		$("#spacer").hide();
		checkingUserExists = false;
		
		resetErrorFields();
		hideError();
		
		//check empty
		var errors = [];
		var error_fields = [];
		
			//firstname
			if (checkEmpty("firstname")){
				errors[errors.length] = "First Name";
			}
			
			//lastname
			if (checkEmpty("lastname")){
				errors[errors.length] = "Last Name";
			}
			
			//email
			if (checkEmpty("email")){
				errors[errors.length] = "Email Address";
			}
			
			//username
			if (checkEmpty("username")){
				errors[errors.length] = "Username";
			}
			
			//password
			if (checkEmpty("password")){
				errors[errors.length] = "Password";
			}
			
			//repeat password
			if (checkEmpty("password_repeat")){
				errors[errors.length] = "Re-Type Password";
			}
			
			//uword
			if (checkEmpty("uword")){
				errors[errors.length] = "Word verification";
			}
		
		
		if (errors.length > 0){
			var result = "You need to fill out the following field(s):<br/><br/>";
			for (var i = 0; i < errors.length; i++){
				result += "- " + errors[i] + "<br/>";
			}
			var height = 2*16 + (errors.length*16);
			$("#warning1").css("height","" + height + "px");
			setError(result);
			return false;
		}
		
		//check CAPTCHA
		
		if (!jcap()){
			setErrorField("uword_label");
			setError("The given word does not match the text inside the image!");
			return false;
		}
		
		//check valid email
		if (!echeck($("#email").attr("value"))){
			setErrorField("email_label");
			setError("Invalid email address");
			return false;
		}
		
		//check length password
		var pass = $("#password").attr("value");
		if (pass.length < 4){
			setErrorField("password_label");
			setError("The password should contain at least 4 characters");
			return false;
		}
		
		//check match password
		var pass2 = $("#password_repeat").attr("value");
		if (pass != pass2){
			setErrorField("password_label");
			setErrorField("password_repeat_label");
			setError("The passwords don't match");
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
		var value = $("#" + field).attr("value");
		if (!value || value.replace(/ /g,"") == ""){
			setErrorField(field + "_label");
			return true;
		} else {
			return false;
		}
	}
	
};

sdata.registerForLoad("sakai.newaccount");