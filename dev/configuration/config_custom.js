define(["config/config"], function(config) {
    // Insert custom configuration here

    // Custom CSS Files to load in
    config.skinCSS = ["/dev/skins/default/skin.css"];

    config.Authentication.allowInternalAccountCreation = false;
    config.Authentication.external = [{
                label: "Raven",
                url: "https://ucamoae.caret.cam.ac.uk/system/ucam/auth/raven"
            }, {    
                label: "Friends",
                url: "https://ucamoae.caret.cam.ac.uk/system/ucam/auth/friends"
            }];

    return config;
});
