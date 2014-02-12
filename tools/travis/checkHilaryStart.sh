#!/bin/sh
# Verify that Hilary started up successfully and is ready
# to start responding to requests. Once `/api/me` returns
# a 200 status code, Travis can continue.
echo "Check Hilary startup status"

# Variables used to check the Hilary start up status
URL="http://admin.oae.com/api/me"
STATUS=false
ATTEMPT=0

# Execute curl request to `/api/me` and check for a 200 status code
# to verify that Hilary has started up successfully
checkHilaryStartup() {

    # Increment the attempt counter
    ATTEMPT="$(($ATTEMPT+1))"

    # Request `/api/me`
    STATUS="$(curl -sL -w '%{http_code}' $URL -o /dev/null)"

    # Check the status code
    if [ $STATUS -eq 200 ]
    then
        echo "Hilary started. Status code "$STATUS
    else
        # If Hilary hasn't started up after 2 minutes, we back off and fail
        if [ $ATTEMPT -eq 60 ]
        then
            echo "Hilary failed to start after 2 minutes. Exiting"
            exit 1
        else
            echo "Hilary not started yet. Status code "$STATUS". Retrying in 2 seconds"
            sleep 2
            checkHilaryStartup
        fi
    fi
}

# Initialize the first status check
checkHilaryStartup
