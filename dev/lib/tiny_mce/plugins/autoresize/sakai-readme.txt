This plugin has been edited to fix a bug it has in Firefox.

Line 60 was
    t.autoresize_min_height = ed.getElement().offsetHeight;
and now is
    if (ed.getElement().offsetHeight > 0) {
        t.autoresize_min_height = ed.getElement().offsetHeight;
    } else if (ed.getElement().style.height) {
        t.autoresize_min_height = ed.getElement().style.height;
        if (typeof t.autoresize_min_height === "string") {
            t.autoresize_min_height = t.autoresize_min_height.replace("px", "");
        }
    } else {
        t.autoresize_min_height = 0;
    }
to allow setting of the height by style and not by its calculated offsetHeight, which doesn't work in some browsers when the element has yet to be rendered.