async function main() {
  const github = require('@actions/github');
  const core = require('@actions/core');

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

  const eventPayload = require(process.env.GITHUB_EVENT_PATH)

  const repo = eventPayload.repository.name
  const owner = eventPayload.repository.owner.login
  const baseRef = eventPayload.pull_request.base.ref


  // TODO(zhibing.chen) branches as a input param.
  if (["main", "master", "development"].indexOf(eventPayload.pull_request.base.ref) === -1) {
    process.exit(0)
  }

  const { data: states} = await octokit.rest.repos.listCommitStatusesForRef({
    owner,
    repo,
    ref: baseRef
  })

  if (states.length === 0){
    process.exit(0)
  }

  const state = states[0]

  const { data: {author: committer}} = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: baseRef,
  });

  // never block the user who made the branch broken 
  if (state.state !== "success" && eventPayload.pull_request.user.login !== committer.login) {
    core.setFailed(`PR was blocked because target branch ${baseRef} was broken/pending(not success). see broken detail ${state.target_url}`)
  }
}

try {
  main()
} catch (e){
  core.setFailed(e)
}
