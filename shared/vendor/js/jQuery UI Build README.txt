Our custom build includes:

Core
Widget
Mouse
Draggable
Droppable
Resizable
Sortable

Also, after doing a custom build, you need to wrap it in:

require(['jquery'], function (jQuery) { ... });

to ensure it loads without issue as a RequireJS module.
