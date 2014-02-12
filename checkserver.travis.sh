#!/bin/sh
# Verify that Hilary has started up and is ready to
# start responsding to requests. Once /api/me returns
# a 200 status code Travis can continue.
echo "Check Hilary startup status"

# Variables used to check the Hilary start up status
URL="http://admin.oae.com/api/me"
ME=false

# Execute curl request to /api/me and verify the response
checkServerStatus() {
    ME="$(curl -sL -w '%{http_code}' $URL -o /dev/null)"
    verifyServerStatus
}

# Verify that the server is up by checking if a 200 status code came back
verifyServerStatus() {
    if [ $ME -eq 200 ]
    then
        echo "Hilary started. Status code "$ME
    else
        echo "Hilary not started yet. Status code "$ME "Retrying in 2 seconds"
        sleep 2
        checkServerStatus
    fi
}

# Initialize the first status check
checkServerStatus
