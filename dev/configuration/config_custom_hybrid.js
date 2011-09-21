define(["config/config"], function(config) {

    // Custom CSS Files to load in
    config.skinCSS = ["/dev/skins/default/skin.css"];

    // Hybrid
    config.showSakai2 = true;
    config.useLiveSakai2Feeds = true;

    config.defaultprivstructure["${refid}5"].dashboard.columns.column1.push({
        "uid": "${refid}1234",
        "visible": "block",
        "name": "mysakai2"
    });

    return config;
});
