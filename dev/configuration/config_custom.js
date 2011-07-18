define(["config/config"], function(config) {
    // Insert custom configuration here

    // Custom CSS Files to load in:
    config.skinCSS = ["/dev/skins/default/skin.css"];

    // Remove the Sign Up link:
    config.Navigation.splice(4,1);

    // Set UK style dates:
    config.defaultLanguage = "en_UK";

    // Prevent users changing their internal passwords through the UI:
    config.allowPasswordChange = false;

    // Make all content (uploaded to or created in Sakai OAE) visible to
    // logged in users only by default.
    config.Permissions.Content.defaultaccess = "everyone";
    config.Permissions.Documents.defaultaccess = "everyone";

    // Set up Raven / Friends links:
    config.Authentication.allowInternalAccountCreation = false;
    config.Authentication.internal = false;
    config.Authentication.external = [{
                label: "Raven",
                url: "https://ucamoae.caret.cam.ac.uk/system/ucam/auth/raven"
            }, {    
                label: "Friends",
                url: "https://ucamoae.caret.cam.ac.uk/system/ucam/auth/friends"
            }]

    return config;
});
