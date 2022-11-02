# standup-summary

This script expects two environment variables, a GitHub API token under `GH_API_TOKEN` and a GitHub username under `GH_USERNAME`.

# Usage
`node standup.js [-a | --all]`

The script by default will strip events not since the previous workday (assumes Monday-Friday work week).

# Flags
Passing `-a` or `--all` will grab all events returned by the GH API for the given username.
