/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

casper.test.begin('Widget - Create user', function(test) {

    /**
     * Verify that the create user form can be opened and is visible
     */
    var openCreateUser = function() {
        casper.waitForSelector('#usermanagement-widget button#usermanagement-createuser', function(){
            test.assertExists('#usermanagement-widget button#usermanagement-createuser', 'Create user trigger exists');
            casper.click('#usermanagement-widget button#usermanagement-createuser');
            // TODO: When widgets have an event that indicates it's done loading this wait needs to be replaced
            casper.wait(configUtil.searchWaitTime, function(){
                test.assertVisible('#createuser-modal', 'The create user modal is shown after trigger');
            });
        });
    };

    /**
     * Verify that the complete create user form is available
     */
    var verifyCreateUserForm = function() {
        test.assertExists('form#createuser-form', 'The create user form is present');
        test.assertExists('#createuser-firstname', 'The create user form firstName field is present');
        test.assertExists('#createuser-lastname', 'The create user form lastName field is present');
        test.assertExists('#createuser-email', 'The create user form email field is present');
        test.assertExists('#createuser-username', 'The create user form username field is present');
        test.assertExists('#createuser-password', 'The create user form password field is present');
        test.assertExists('#createuser-password-repeat', 'The create user form password_repeat field is present');
    };

    /**
     * Submit the following forms and validate that there is an error:
     *  - form completly empty
     *  - form without first name
     *  - form without last name
     *  - form without email
     *  - form without username
     *  - form without password
     *  - form without repeat password
     *  - form with invalid email
     *  - form with not matching passwords
     *  - form with too short password
     *  - form with too short username
     *  - form with an already in use username
     *
     * @param   {String}    Username that is already in use
     */
    var verifyCreateUserFormValidation = function(username, isGlobalAdminServer) {
        casper.waitForSelector('form#createuser-form', function() {
            // Empty form
            casper.fill('form#createuser-form',{
                'firstName'       : '',
                'lastName'        : '',
                'email'           : '',
                'username'        : '',
                'password'        : '',
                'password_repeat' : ''
            }, true);
            test.assertVisible('#firstName-error', 'Verify validating empty create user form, firstName error is visible');
            test.assertVisible('#lastName-error', 'Verify validating empty create user form, lastName error is visible');
            test.assertVisible('#email-error', 'Verify validating empty create user form, email error is visible');
            test.assertVisible('#username-error', 'Verify validating empty create user form, username error is visible');
            test.assertVisible('#password-error', 'Verify validating empty create user form, password error is visible');
            test.assertVisible('#password_repeat-error', 'Verify validating empty create user form, password_repeat error is visible');

            // Form without firstName
            casper.fill('form#createuser-form',{
                'firstName'       : '',
                'lastName'        : 'Doe',
                'email'           : 'JohnDoe@hotmail.com',
                'username'        : 'jdoe',
                'password'        : 'password',
                'password_repeat' : 'password'
            }, true);
            test.assertVisible('#firstName-error', 'Verify validating empty first name, firstName error is visible');
            test.assertNotVisible('#lastName-error', 'Verify validating empty first name, lastName error is not visible');
            test.assertNotVisible('#email-error', 'Verify validating empty first name, email error is not visible');
            test.assertNotVisible('#username-error', 'Verify validating empty first name, username error is not visible');
            test.assertNotVisible('#password-error', 'Verify validating empty first name, password error is not visible');
            test.assertNotVisible('#password_repeat-error', 'Verify validating empty first name, password_repeat error is not visible');

            // Form without lastName
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : '',
                'email'           : 'JohnDoe@hotmail.com',
                'username'        : 'jdoe',
                'password'        : 'password',
                'password_repeat' : 'password'
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating empty last name, firstName error is not visible');
            test.assertVisible('#lastName-error', 'Verify validating empty last name, lastName error is visible');
            test.assertNotVisible('#email-error', 'Verify validating empty last name, email error is not visible');
            test.assertNotVisible('#username-error', 'Verify validating empty last name, username error is not visible');
            test.assertNotVisible('#password-error', 'Verify validating empty last name, password error is not visible');
            test.assertNotVisible('#password_repeat-error', 'Verify validating empty last name, password_repeat error is not visible');

            // Form without email
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : 'Doe',
                'email'           : '',
                'username'        : 'jdoe',
                'password'        : 'password',
                'password_repeat' : 'password'
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating empty email, firstName error is not visible');
            test.assertNotVisible('#lastName-error', 'Verify validating empty email, lastName error is not visible');
            test.assertVisible('#email-error', 'Verify validating empty email, email error is visible');
            test.assertNotVisible('#username-error', 'Verify validating empty email, username error is not visible');
            test.assertNotVisible('#password-error', 'Verify validating empty email, password error is not visible');
            test.assertNotVisible('#password_repeat-error', 'Verify validating empty email, password_repeat error is not visible');

            // Form without username
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : 'Doe',
                'email'           : 'JohnDoe@hotmail.com',
                'username'        : '',
                'password'        : 'password',
                'password_repeat' : 'password'
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating empty username, firstName error is not visible');
            test.assertNotVisible('#lastName-error', 'Verify validating empty username, lastName error is not visible');
            test.assertNotVisible('#email-error', 'Verify validating empty username, email error is not visible');
            test.assertVisible('#username-error', 'Verify validating empty username, username error is visible');
            test.assertNotVisible('#password-error', 'Verify validating empty username, password error is not visible');
            test.assertNotVisible('#password_repeat-error', 'Verify validating empty username, password_repeat error is not visible');

            // Form without password
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : 'Doe',
                'email'           : 'JohnDoe@hotmail.com',
                'username'        : 'jdoe',
                'password'        : '',
                'password_repeat' : 'password'
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating empty password, firstName error is not visible');
            test.assertNotVisible('#lastName-error', 'Verify validating empty password, lastName error is not visible');
            test.assertNotVisible('#email-error', 'Verify validating empty password, email error is not visible');
            test.assertNotVisible('#username-error', 'Verify validating empty password, username error is not visible');
            test.assertVisible('#password-error', 'Verify validating empty password, password error is visible');
            test.assertVisible('#password_repeat-error', 'Verify validating empty password, password_repeat error is visible');

            // Form without password_repeat
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : 'Doe',
                'email'           : 'JohnDoe@hotmail.com',
                'username'        : 'jdoe',
                'password'        : 'password',
                'password_repeat' : ''
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating empty repeated password, firstName error is not visible');
            test.assertNotVisible('#lastName-error', 'Verify validating empty repeated password, lastName error is not visible');
            test.assertNotVisible('#email-error', 'Verify validating empty repeated password, email error is not visible');
            test.assertNotVisible('#username-error', 'Verify validating empty repeated password, username error is not visible');
            test.assertNotVisible('#password-error', 'Verify validating empty repeated password, password error is not visible');
            test.assertVisible('#password_repeat-error', 'Verify validating empty repeated password, password_repeat error is visible');

            // Form with wrong password_repeat
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : 'Doe',
                'email'           : 'JohnDoe@hotmail.com',
                'username'        : 'jdoe',
                'password'        : 'password',
                'password_repeat' : 'somethingelse'
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating incorrect repeated password, firstName error is not visible');
            test.assertNotVisible('#lastName-error', 'Verify validating incorrect repeated password, lastName error is not visible');
            test.assertNotVisible('#email-error', 'Verify validating incorrect repeated password, email error is not visible');
            test.assertNotVisible('#username-error', 'Verify validating incorrect repeated password, username error is not visible');
            test.assertNotVisible('#password-error', 'Verify validating incorrect repeated password, password error is not visible');
            test.assertVisible('#password_repeat-error', 'Verify validating incorrect repeated password, password_repeat error is visible');

            // Form with wrong email
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : 'Doe',
                'email'           : 'faulty.com',
                'username'        : 'jdoe',
                'password'        : 'password',
                'password_repeat' : 'password'
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating invalid email, firstName error is not visible');
            test.assertNotVisible('#lastName-error', 'Verify validating invalid email, lastName error is not visible');
            test.assertVisible('#email-error', 'Verify validating invalid email, email error is visible');
            test.assertNotVisible('#username-error', 'Verify validating invalid email, username error is not visible');
            test.assertNotVisible('#password-error', 'Verify validating invalid email, password error is not visible');
            test.assertNotVisible('#password_repeat-error', 'Verify validating invalid email, password_repeat error is not visible');

            // Form with too short password
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : 'Doe',
                'email'           : 'JohnDoe@hotmail.com',
                'username'        : 'jdoe',
                'password'        : 'pw',
                'password_repeat' : 'pw'
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating too short password, firstName error is not visible');
            test.assertNotVisible('#lastName-error', 'Verify validating too short password, lastName error is not visible');
            test.assertNotVisible('#email-error', 'Verify validating too short password, email error is not visible');
            test.assertNotVisible('#username-error', 'Verify validating too short password, username error is not visible');
            test.assertVisible('#password-error', 'Verify validating too short password, password error is visible');
            test.assertNotVisible('#password_repeat-error', 'Verify validating too short password, password_repeat error is not visible');

            // Form with too short username
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : 'Doe',
                'email'           : 'JohnDoe@hotmail.com',
                'username'        : 'Jo',
                'password'        : 'password',
                'password_repeat' : 'password'
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating incorrect username, firstName error is not visible');
            test.assertNotVisible('#lastName-error', 'Verify validating incorrect username, lastName error is not visible');
            test.assertNotVisible('#email-error', 'Verify validating incorrect username, email error is not visible');
            test.assertVisible('#username-error', 'Verify validating incorrect username, username error is visible');
            test.assertNotVisible('#password-error', 'Verify validating incorrect username, password error is not visible');
            test.assertNotVisible('#password_repeat-error', 'Verify validating incorrect username, password_repeat error is not visible');

            // Form with an already existing username
            casper.fill('form#createuser-form',{
                'firstName'       : 'John',
                'lastName'        : 'Doe',
                'email'           : 'JohnDoe@hotmail.com',
                'username'        : isGlobalAdminServer ? 'administrator' : username,
                'password'        : 'password',
                'password_repeat' : 'password'
            }, true);
            test.assertNotVisible('#firstName-error', 'Verify validating taken username, firstName error is not visible');
            test.assertNotVisible('#lastName-error', 'Verify validating taken username, lastName error is not visible');
            test.assertNotVisible('#email-error', 'Verify validating taken username, email error is not visible');
            test.assertVisible('#username-error', 'Verify validating taken username, username error is visible');
            test.assertNotVisible('#password-error', 'Verify validating taken username, password error is not visible');
            test.assertNotVisible('#password_repeat-error', 'Verify validating taken username, password_repeat error is not visible');
        });
    };

    /**
     * Verifies that a user can create user through the widget
     */
    var verifyCreatingUser = function() {
        casper.waitForSelector('form#createuser-form', function() {
            var password = mainUtil.generateRandomString();
            casper.fill('form#createuser-form', {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'jd@gmail.com',
                'username': 'johndoe-' + mainUtil.generateRandomString(),
                'password': password,
                'password_repeat': password
            }, false);
            test.assertExists('#createuser-modal .modal-footer button[type="submit"]', 'Verify submit create user form button exists and submit');
            casper.click('#createuser-modal .modal-footer button[type="submit"]');
            // Verify that the user has been created
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'Verify new user has been successfully created');
            });
        });
    };

    casper.start(configUtil.adminUI, function(){
        // Create users to test with

        userUtil.createUsers(1, function(user1) {
            // Verify that the create user form can be opened
            casper.then(function() {
                casper.echo('# Verify opening create user modal on the global tenant', 'INFO');
                uiUtil.openAdmin();
                userUtil.doLogIn(configUtil.adminUsername, configUtil.adminPassword);
                uiUtil.openAdminUserManagement();
                casper.then(openCreateUser);
            });

            // Verify that the create user form is available
            casper.then(function() {
                casper.echo('# Verify create user form elements', 'INFO');
                verifyCreateUserForm();
            });

            // Verify that all the errors are shown when there is wrong or no input
            casper.then(function() {
                casper.echo('# Verify create user form validation', 'INFO');
                verifyCreateUserFormValidation(user1.username, true);
            });

            // Verify creating a user
            casper.then(function() {
                casper.echo('# Verify creating a user on the global tenant', 'INFO');
                verifyCreatingUser();
            });

            // Verify creating a user
            casper.then(function() {
                casper.echo('# Verify creating a user on a regular tenant', 'INFO');
                uiUtil.openAdminUserManagement(configUtil.tenantAlias);
                casper.then(function() {
                    casper.click('#usermanagement-widget button#usermanagement-createuser');

                    casper.wait(configUtil.modalWaitTime, function() {
                        verifyCreatingUser();
                    });
                });
            });

            userUtil.doLogOut();
        });
    });

    casper.run(function() {
        test.done();
    });
});
