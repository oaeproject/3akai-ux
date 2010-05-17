/**
 * A recursive function that creates users from the userlist
 * @param {Integer} count The current number of the user in the userlist array
 */
var createUsers = function(count){

    if(count !== userlist.length){

        $.ajax({
            url: "/system/userManager/user.create.json",
            type: "POST",
            data: userlist[count],
            complete: function(){
                count++;
                createUsers(count);
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
 * Do some setup before the module starts (equal to setUp in JUnit)
 * In this case, if it's a messaging test, we create some dummy users
 */
QUnit.moduleStart = function (name) {
    if(name.match(/Messaging/)){
    	d = new Date();
    	u1time = d.getMilliseconds();
    	pathToMessages = [];
    	userlist = [
    	            {"firstName": "First", "lastName": "User", "email": "first.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user1"+u1time},
    	            {"firstName": "Second", "lastName": "User", "email": "second.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user2"+u1time}
    	        ];
        //create users
        createUsers(0);
    }
};

/**
 * After the test is done, we undo some of the things we did during the test to keep sakai clean.(equal to tearDown in JUnit)
 * In this case, if the test is a messaging test, we remove all the dummy users
 */
QUnit.moduleDone = function (name, failures, total) {
    if(name.match(/Messaging/)){

        //remove messages
        //deleteMessages();

        //remove users
        removeUsers(0);
        stop();
    }
};