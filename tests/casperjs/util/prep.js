casper.test.comment('Prepare environment for tests');

// Override default waitTimeout before test fails
casper.options.waitTimeout = 10000;

// Set up test tenant
casper.start('http://admin.oae.com', function() {
	casper.waitForSelector('#admin-login-form', function() {
		casper.then(function() {
			userUtil().doAdminLogIn('administrator', 'administrator');
		});

		casper.then(function() {
			adminUtil().createTenant('test', 'CasperJS Tenant', 'test.oae.com', function() {
				adminUtil().writeConfig('test', {
					'oae-principals/recaptcha/enabled': false
				}, function() {
					userUtil().doAdminLogOut();
				});
			});
		});
	});
});

casper.run(function() {
	casper.test.done();
});