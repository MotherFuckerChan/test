async function main() {
  const github = require('@actions/github');
  const core = require('@actions/core');

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

  const eventPayload = require(process.env.GITHUB_EVENT_PATH)

  const repo = eventPayload.repository.name
  const owner = eventPayload.repository.owner.login
  const baseRef = eventPayload.pull_request.base.ref


  // TODO(zhibing.chen) branches as a input param.
  if (["development"].indexOf(baseRef) === -1) {
    process.exit(0)
  }

  const { data: states} = await octokit.rest.repos.listCommitStatusesForRef({
    owner,
    repo,
    ref: baseRef
  })

  // only care of "drone/push"
  const filteredStates = states.filter(state => state.context === "continuous-integration/drone/push")

  if (filteredStates.length === 0){
    process.exit(0)
  }

  const state = filteredStates[0]

  const { data: commit} = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: baseRef,
  });

  let committer = null
  try {
    const {data: prs} = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      repo,
      owner,
      commit_sha: commit.sha
    })
    committer = prs[0].user
  } catch {
    committer = commit.author
  }

  // never block the user who made the branch broken 
  const setFailure = state.state !== "success" && eventPayload.pull_request.user.login !== committer.login
  console.log("Target Branch is ", state.state)
  await octokit.rest.repos.createCommitStatus({
    repo,
    owner,
    sha: eventPayload.pull_request.head.sha,
    state: setFailure ? "failure" : "success",
    context: `branch [${baseRef}]`,
    description: setFailure ? `is broken, so pr blocked. see: url` : "is passed."
  })
}

try {
  main()
} catch (e){
  core.setFailed(e)
}
