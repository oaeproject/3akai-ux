var userlist;
var container = "<div id='dummyContainer'><div id='dummyDiv'></div><div id='dummyTemplate'><!--${all}--></div></div>";
var dummyForm = "<form action='javascript:;' id='dummyForm'>" +
					"<input type='text' name='name' value='john doe'/>" +
					"<input type='text' value='should not be saved'/>" +
					"<input type='radio' checked='true' name='gender' value='male'/>" +
					"<input type='radio' name='gender' value='female'/>" +
					"<input type='checkbox' checked='true' name='color' value='red'/>" +
					"<input type='checkbox' name='color' value='green'/>" +
					"<input type='checkbox' name='color' value='blue'/>" +
					"<select name='shape'>" +
					"<option value='square'>Square</option>" +
					"<option value='circle'>Circle</option>" +
					"<option value='rectangle'>Rectangle</option>" +
					"<textarea rows='10' cols='30' name='description'>Demo text area</textarea>" + 
					"</select>" +
				"</form>";

/**
 * A function to create new users, the user will be added to the list of dummy users.
 * @param {Array} user The user to be added in following format: {"firstName": "First", "lastName": "User", "email": "first.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user1"}
 */
var createUser = function(user){
	$.ajax({
        url: "/system/userManager/user.create.json",
        type: "POST",
        data: user,
        complete: function(){
    		userlist.push(user);
            count++;
            createUsers(count);
        }
    });
}

/**
 * A recursive function that creates users from the userlist
 * @param {Integer} count The current number of the user in the userlist array
 */
var createDummyUsers = function(count){

    if(count !== userlist.length){

        $.ajax({
            url: "/system/userManager/user.create.json",
            type: "POST",
            data: userlist[count],
            complete: function(){
                count++;
                createDummyUsers(count);
            }
        });
    }
};

/**
 * A recursive function that removes users from the userlist
 * @param {Integer} count The current number of the user in the userlist array
 */
var removeUsers = function(count){

    if(count !== userlist.length){
        var username = userlist[count][":name"];
        $.ajax({
            url: "/system/userManager/" + username + ".delete.json",
            type: "POST",
            complete: function(){
                count++;
                removeUsers(count);
            }
        });
    }
}

/**
 * Append a dummy form to the page
 * @return void
 */
var createDummyForm = function(){
	$("body").append(dummyForm);
}

/**
 * Remove the dummy form from the page
 * @return void
 */
var removeDummyForm = function(){
	$("#dummyForm").remove();
}

/**
 * Create a dummy container with a output div and a template div
 * @return void
 */
var createDummyDivs = function(){
    $("body").append(container);
}

/**
 * Remove the dummy container and all its children
 * @return void
 */
var removeDummyDivs = function(){
    $("#dummyContainer").remove();
}

/**
 * Do some setup before the module starts (equal to setUp in JUnit)
 * In this case, if it's a messaging test, we create some dummy users
 * @return void
 */
QUnit.moduleStart = function (name) {
	switch(name){
		case "Messaging":
	    	d = new Date();
	    	u1time = d.getMilliseconds();
	    	dummyUser = dummyUser + u1time;
	    	pathToMessages = [];
	    	userlist = [
	    	            {"firstName": "First", "lastName": "User", "email": "first.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user1"+u1time},
	    	            {"firstName": "Second", "lastName": "User", "email": "second.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user2"+u1time}
	    	        ];
	        //create users
	    	createDummyUsers(0);
	    	break;
		case "TemplateRenderer":
			//create a div and a template
			createDummyDivs();
			break;
		case "FormToJSON":
			//create a dummy form
			createDummyForm();
			break;
	}
};

/**
 * After the test is done, we undo some of the things we did during the test to keep sakai clean.(equal to tearDown in JUnit)
 * In this case, if the test is a messaging test, we remove all the dummy users
 */
QUnit.moduleDone = function (name, failures, total) {
    switch(name){
    	case "Messaging":
	
	        //remove messages
	        deleteMessages();
	
	        //remove users
	        removeUsers(0);
	        break;

    	case "TemplateRenderer":
			//remove all dummy divs
    		removeDummyDivs();
			break;
    	case "FormToJSON":
    		//remove the dummy form
			removeDummyForm();
			break;
    }
};