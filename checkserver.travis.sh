#!/bin/sh
# Verify that Hilary started up successfully and is ready
# to start responding to requests. Once `/api/me` returns
# a 200 status code, Travis can continue.
echo "Check Hilary startup status"

# Variables used to check the Hilary start up status
URL="http://admin.oae.com/api/me"
STATUS=false
ATTEMPT=0

# Execute curl request to `/api/me` and verify the response and
# verify that the server is up by checking if a 200 status code came back
checkHilaryStartup() {
    # Request `/api/me`
    STATUS="$(curl -sL -w '%{http_code}' $URL -o /dev/null)"
    # Increment the attempt counter
    ATTEMPT="$(($ATTEMPT+1))"
    # Check the status code
    if [ $STATUS -eq 200 ]
    then
        echo "Hilary started. Status code "$STATUS
    else
        # If the status code differs from 200 60 times, Hilary hasn't successfully
        # started in the 2 minute time frame and the script fails
        if [ $ATTEMPT -eq 60 ]
        then
            echo "Hilary failed to start after 2 minutes. Exiting."
            exit 1
        else
            echo "Hilary not started yet. Status code "$STATUS "Retrying in 2 seconds"
            sleep 2
            checkHilaryStartup
        fi
    fi
}

# Initialize the first status check
checkHilaryStartup
