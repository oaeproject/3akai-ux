These scripts are used to auto-collect YSlow! results and output them to
a text file.

Requirements:
ruby 1.9.2
rubygems 1.3.7
 - sinatra 1.1.2
 - json 1.4.6
Firefox
YSlow! plugin

Process is made on a Mac, not guaranteed anywhere else (but it should work on linux)
Note, rvm is not needed, just an easy way to manage your rubies
I use it in the process description to make installation easier, but feel
free to use a native ruby and rubygem build.
Also, I list version numbers as those are the ones that I was using at the time
and this is guaranteed to work with. It might work on ruby 1.8 and previous
versions of rubygems and sinatra/json.

Process:

1-3 are contained in setup_computer.sh

1. Install rvm 
 - bash < <( curl http://rvm.beginrescueend.com/releases/rvm-install-head )
2. Add to your .bash_profile
 - [[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm"  # This loads RVM into a shell session.
3. Install ruby and the gems
  - rvm install 1.9.2
  - rvm gemset create yslow
  - rvm use 1.9.2@yslow
  - gem install sinatra
  - gem install json
4. Open Firefox
5. Install Firefox addons
  - Firebug (http://getfirebug.com) 
  - YSlow! (http://developer.yahoo.com/yslow/)
6. Restart Firefox
7. go to 'about:config'
8. Set the following properties:
  extensions.yslow.autorun;true
  extensions.yslow.beaconInfo;all
  extensions.yslow.beaconUrl;http://localhost:4567/
  extensions.yslow.defaultRuleset;ydefault
  extensions.yslow.optinBeacon;true
9. run start_beacon.sh which starts a sinatra web server
10. Click around Sakai, allowing pages to load completely
11. check yslow_results.txt in this folder, which will log your output