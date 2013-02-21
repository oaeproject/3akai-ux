require(
    [
        'jquery',
        'oae.core'
    ], function($, oae) {

        var loadWidgets = function() {
            $.ajax({
                url: '/api/ui/widgets',
                dataType: 'json',
                success: function(data) {
                    $(window).trigger('widgetsdone.qunit.oae', data);
                }
            });
        };

        loadWidgets();

    }
);
