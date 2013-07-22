casper.echo('Prepare environment for tests');

// Set up test tenant
casper.start('http://admin.oae.com', function() {
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

casper.run(function() {
	casper.test.done();
});
