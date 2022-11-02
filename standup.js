const { Octokit } = require('octokit');

const main = async () => {
  // Octokit.js
  // https://github.com/octokit/core.js#readme
  const octokit = new Octokit({
    auth: process.env.GH_API_TOKEN,
  });

  const username = process.env.GH_USERNAME;

  const response = await octokit.request('GET /users/{username}/events', { username });

  const modifiedPullRequests = {};
  const mergedPullRequests = {};
  const reviewedPullRequests = {};
  const issues = {};

  const all = process?.argv?.find(arg => arg === '-a' || arg === '--all');

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay 0 is Sunday, 6 is Saturday

  const isRecent = (updatedAt) => {
    const currentDate = Date.now();
    const isMonday = new Date(currentDate).getDay() === 1;
    const numDaysToGoBack = isMonday ? 3 : 1;
    return currentDate - Date.parse(updatedAt) > numDaysToGoBack * 24 * 60 * 60 * 1000;
  }

  response.data.forEach((event) => {
    if (event?.org?.login === 'aws-amplify') {
      const { payload } = event;
      const prNumber = payload?.pull_request?.number;
      const updated_at = payload?.pull_request?.updated_at;
      switch(event.type) {
        case 'CreateEvent':
          return; // ignore branch creation for now
        case 'PullRequestEvent':
          if (updated_at && !all && isRecent(updated_at)) {
            return;
          }

          if (mergedPullRequests[prNumber] || payload.pull_request.user.login !== username) {
            return;
          }
          if (payload.pull_request.merged) {
            mergedPullRequests[prNumber] = payload;
            delete modifiedPullRequests[prNumber];
          } else {
            modifiedPullRequests[prNumber] = payload;
          }
          return;
        case 'PullRequestReviewEvent':
          if (updated_at && !all && isRecent(updated_at)) {
            return;
          }
          if (payload.action === 'created' && payload?.review?.user?.login === username) {
            reviewedPullRequests[prNumber] = payload;
          }
          return;
        case 'PushEvent':
          // ignore for now
          return;
        case 'PullRequestReviewCommentEvent':
          if (updated_at && !all && isRecent(updated_at)) {
            return;
          }
          if (payload.action === 'created') {
            reviewedPullRequests[prNumber] = payload;
          }
          return;
        case 'IssuesEvent':
          if (payload.action === 'closed') {
            // api does not return enough info to determine when closed by PR so ignore
          } else {
            issues[payload.issue.number] = payload;
          }
          return;
        case 'IssueCommentEvent':
          issues[payload.issue.number] = payload;
          return;
        case 'ForkEvent':
          return;
        case 'DeleteEvent':
          return;
        default:
          console.error(event.type, 'was not handled');
          console.log(payload)
          return;
      }
    }
  });

  const standupBlurb = {
    previously: '',
    today: '',
    blockers: 'N/A',
  };

  const modifiedPrString = convertPrObjectsToString(modifiedPullRequests);
  if (modifiedPrString.length > 0) {
    standupBlurb.previously += `\n Worked on:\n${modifiedPrString}`;
  }

  const mergedPrString = convertPrObjectsToString(mergedPullRequests);
  if (mergedPrString.length > 0) {
    standupBlurb.previously += `\n Merged:\n${mergedPrString}`;
  }

  const reviewedPrString = convertPrObjectsToString(reviewedPullRequests);
  if (reviewedPrString.length > 0) {
    standupBlurb.previously += `\n Reviewed:\n${reviewedPrString}`;
  }

  const issuesString = convertIssueObjectsToString(issues);
  if (issuesString.length > 0) {
    standupBlurb.previously += `\n Interacted with:\n${issuesString}`;
  }

  console.log(`:rewind:: ${standupBlurb.previously}`);
  console.log(`:fast_forward:: ${standupBlurb.today}`);
  console.log(`:black_square_for_stop:: ${standupBlurb.blockers}`);

}

const convertPrObjectsToString = (issues) => (Object.values(issues).map(({ pull_request }) => `- ${pull_request.html_url} ${pull_request.title}`).join('\n'));
const convertIssueObjectsToString = (issues) => (Object.values(issues).map(({ issue }) => `- ${issue.html_url} ${issue.title}`).join('\n'));


main().catch(err => {
  console.log(err);
  process.exit(1);
});
