define([
	'dojo/_base/declare'
], function (declare) {
	return declare(null, {
	    handleWithPHP: function() {
            return this.config.proxy && this.config.proxy.usePHPHandlers;
        }
	});
});