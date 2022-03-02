async function main() {
  const github = require('@actions/github');

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  const eventPayload = require(process.env.GITHUB_EVENT_PATH)

  const repo = eventPayload.repository.name
  const owner = eventPayload.repository.owner.login

  const commitState = eventPayload.state === "success" ? "success" : "failure"

  let branch2committer = {}
  let branches = (await Promise.all(["master"].map(async branch => {
    const { data: { commit }} =  await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: branch
    });
  try {
    const {data: prs} = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      repo,
      owner,
      commit_sha: commit.sha
    })
    branch2committer[branch] = prs[0].user
  } catch {
    branch2committer[branch] = commit.author
  }
    return commit.sha === eventPayload.sha ? branch : null
  }))).filter(Boolean)

  branches.forEach(async branch => {
    for (let page = 1; ; page++ ) {
      const { data: pagedPrs } = await octokit.rest.pulls.list({
        owner,
        repo,
        base: branch,
        state: "open",
        per_page: 100,
        page
      })
      if (pagedPrs.length === 0) { break }
      pagedPrs.forEach(async pr => {
        console.log(`Update pr [${pr.id}] status to ${commitState}`)
        const setFailure = commitState === "failure" && branch2committer[pr.base.ref].login !== pr.user.login 
        await octokit.rest.repos.createCommitStatus({
          repo,
          owner,
          sha: pr.head.sha,
          state: setFailure ? "failure" : "success",
          context: `[${pr.base.ref}] status`,
          description: setFailure ? `is broken, so pr blocked.` : "is passed."
        })
      })
    }
  })
}

try {
  main()
} catch (e){
  core.setFailed(e)
}
