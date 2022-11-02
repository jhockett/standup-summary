# standup-summary

This script expects two environment variables, a GitHub API token under `GH_API_TOKEN` and a GitHub username under `GH_USERNAME`.

# Usage
`node standup.js [-a | --all]`

The script by default will only include events from the previous workday until runtime (assumes Monday-Friday work week).

# Flags
Passing `-a` or `--all` will summarize all events returned by the GH API for the given username.
