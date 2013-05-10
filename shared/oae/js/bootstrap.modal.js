$.extend($.fn.modal.Constructor.prototype, {
    lock: function() {
        // Set isShown to false. Suggested by maker of Twitter Bootstrap https://github.com/twitter/bootstrap/issues/1202
        this.$element.data('modal').isShown = false;
        // Set button disabled
        $('#' + this.$element.attr('id') + ' [data-dismiss="modal"]').attr('disabled', 'disabled');
    },
    unlock: function() {
        // Set isShown to true
        this.$element.data('modal').isShown = true;
        // Set button enabled
        $('#' + this.$element.attr('id') + ' [data-dismiss="modal"]').removeAttr('disabled', 'disabled');
    }
});
