# Open Academic Environment (OAE Project)

3akai-ux is the front-end for the Open Academic Environment project.

## Build status

[![Build Status](https://travis-ci.org/oaeproject/3akai-ux.png?branch=master)](https://travis-ci.org/oaeproject/3akai-ux)

## Installing OAE

Documentation on how to install and configure OAE can be found in the [back-end repository](https://github.com/oaeproject/Hilary).

## HTTPS

In order to run the the OAE project on HTTPS we recommend following [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-16-04). In a nutshell:

```
# create the certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout <SOME_PATH>/nginx-selfsigned.key -out <SOME_PATH>/nginx-selfsigned.crt
```

Then create a `self-signed.conf` file next to `nginx.conf`, uncomment both lines and replace `<%= nginxConf.NGINX_SSL_HOME %>` with the path you picked above (`SOME_PATH`):

```
ssl_certificate     <%= nginxConf.NGINX_SSL_HOME %>;/nginx-selfsigned.crt;
ssl_certificate_key <%= nginxConf.NGINX_SSL_HOME %>;/nginx-selfsigned.key;
```

Finally, uncomment the following lines in `nginx.conf`:

```
# listen   443 ssl default_server;
# include self-signed.conf;
```

Reload nginx and HTTPS should work now.

## Offline Development

By default 3akai-ux uses the Open Sans font family available from Google's Web Font CDN. When developing locally without a live internet connection, that CDN will be inaccessible. To ensure maximum visual fidelity, those fonts can be installed as system fonts on the local machine. The entire collection can be downloaded from [Google](http://www.google.com/fonts#UsePlace:use/Collection:Open+Sans).

## Widget development

Documentation (WIP) on how to create custom OAE widgets can be found on the [Widget Wiki](https://github.com/oaeproject/3akai-ux/wiki/Widget-Development-%5BWIP%5D)

### Install dependencies

`lerna` and `yarn` are required to download 3akai-ux dependencies. To do so, run this command in your 3akai-ux directory: `lerna bootstrap`

Note that Hilary and its dependencies should be installed and running on your system before the tests can be run successfully.

## Get in touch

The project website can be found at http://www.oaeproject.org. The [project blog](http://www.oaeproject.org/blog) will be updated with the latest project news from time to time.

The mailing list used for Apereo OAE is oae@apereo.org. You can subscribe to the mailing list at https://groups.google.com/a/apereo.org/d/forum/oae.

Bugs and other issues can be reported in our [issue tracker](https://github.com/oaeproject/3akai-ux/issues). 

## Special thanks to

- [BrowserStack](https://www.browserstack.com) for graciously supporting cross-browser testing.
- [Crowdin](http://crowdin.com/project/apereo-oae) for providing our internationalisation platform.
