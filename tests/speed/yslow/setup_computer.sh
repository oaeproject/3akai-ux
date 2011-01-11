#!/bin/bash

# This should set up ruby and rvm with the proper gems

bash < <( curl http://rvm.beginrescueend.com/releases/rvm-install-head )
echo '[[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm"  # This loads RVM into a shell session.' >> $HOME/.bash_profile
source .bash_profile
rvm install 1.9.2
rvm gemset create yslow
rvm use 1.9.2@yslow
gem install sinatra
gem install json
