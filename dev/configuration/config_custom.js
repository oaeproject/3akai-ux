define(["config/config"], function(config) {

    if ( ! config.customizationComplete ) {
        // Insert custom configuration here

        // Custom CSS Files to load in
        config.skinCSS = ["/dev/skins/default/skin.css"];

        // End custom configuration

        config.customizationComplete = true;
    }

    return config;
});
