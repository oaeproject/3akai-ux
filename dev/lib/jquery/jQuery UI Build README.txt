Our custom build includes:

Core
Widget
Mouse
Draggable
Droppable
Resizable
Selectable
Sortable
Effects Core
Effect "Pulsate"

Also, after doing a custom build, you need to wrap it in:

require(['jquery'], function (jQuery) {
});

to ensure it loads without issue as an RequireJS module.
