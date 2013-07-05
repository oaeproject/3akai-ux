///////////////////
// USER CREATION //
///////////////////

userUtil().createUsers();

casper.run(function() {
    this.test.done();
});
