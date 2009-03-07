// Modal dialog


$(document).ready(function() { 

//Init page_permissions modal dialog
$('#page_permissions_dialog').jqm({
	modal: true,
	trigger: $('#page_permissions_link'),
	ajax: '@href',
	ajaxText: '<strong>loading window...</strong>',
	overlay: 20,
	toTop: true
});

$('#save_as_template_dialog').jqm({
	modal: true,
	trigger: $('#save_as_template_link'),
	ajax: '@href',
	ajaxText: '<strong>loading window...</strong>',
	overlay: 20,
	toTop: true
});

$('#page_from_template_dialog').jqm({
	modal: true,
	trigger: $('#page_from_template_link'),
	ajax: '@href',
	ajaxText: '<strong>loading window...</strong>',
	overlay: 20,
	toTop: true
});

});  