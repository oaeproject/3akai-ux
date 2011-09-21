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
    config.defaultprivstructure.structure0["sakai2sites"] =  {
        "_ref": "${refid}2345",
        "_title": "My Sakai 2 sites",
        "_order": 2,
        "_canEdit": true,
        "_reorderOnly": true,
        "_nonEditable": true,
        "main": {
            "_ref": "${refid}2345",
            "_order": 0,
            "_title": "My Sakai 2 sites"
        }
    };
    config.defaultprivstructure["${refid}2345"] = {
        "page": "<div id='widget_searchsakai2_${refid}2346' class='widget_inline'></div>"
    };
    config.Navigation[0].subnav.splice(2,0, {
        "url": "/me#l=sakai2sites",
        "id": "subnavigation_sakai2_link",
        "label": "MY_SAKAI2_SITES"
    });

    return config;
});
