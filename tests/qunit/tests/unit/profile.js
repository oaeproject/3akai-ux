module("Profile");

(function(){

var profile = {}; profile.basic = {}; profile.basic.elements = {}; 
profile.basic.elements.firstName = {}; profile.basic.elements.lastName = {};
profile.basic.elements.firstName.value = "Ken";
profile.basic.elements.lastName.value = "Griffey";
    
test("Retrieve user's first name from profile", function() {
    var firstName = sakai.api.User.getProfileBasicElementValue(profile, "firstName");
    ok(firstName === "Ken", "The user's first name was properly retrieved");
    start();
});

test("Retrieve a user's display name", function() {
    var displayName = sakai.api.User.getDisplayName(profile);
    ok(displayName === "Ken Griffey", "Display name properly retrieved");
    start();
});

test("Change a user's first name", function() {
    sakai.api.User.setProfileBasicElementValue(profile, "firstName", "Bob");
    ok(profile.basic.elements.firstName.value === "Bob", "First name properly changed");
    start();
});

})();