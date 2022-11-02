# standup-summary

This script uses the GitHub API to query events for a GH user and then prints out a list of Pull Requests and Issues that the GH user is associated with and their titles.

# Prerequisites
Generate a readonly GitHub [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) and set the environement variables `GH_API_TOKEN` and `GH_USERNAME`

# Usage

`node standup.js [--all | -a]`

*Only tested on node 14.x*

The script by default will only include events from the previous workday until runtime (assumes Monday-Friday work week).

# Flags
Passing `--all` or `-a` will summarize all events returned by the GH API for the given username.
