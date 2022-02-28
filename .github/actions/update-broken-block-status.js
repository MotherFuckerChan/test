async function main() {
  const github = require('@actions/github');

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  const eventPayload = require(process.env.GITHUB_EVENT_PATH)

  const repo = eventPayload.repository.name
  const owner = eventPayload.repository.owner.login

  const commitState = eventPayload.state === "success" ? "success" : "failure"

  let branch2commit = {}
  let branches = (await Promise.all(["master"].map(async branch => {
    const { data: { commit }} =  await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: branch
    });
    branch2commit[branch] = commit
    return commit.sha === eventPayload.sha ? branch : null
  }))).filter(Boolean)

  let prs = []
  for (const branch of branches) {
    for (let page = 1; ; page++ ) {
      const { data: pagedData } = await octokit.rest.pulls.list({
        owner,
        repo,
        base: branch, 
        state: "open",
        per_page: 100,
        page
      })
      if (pagedData.length === 0) { break }
      prs = prs.concat(pagedData)
    }
  }

  const checkRuns = (await Promise.all(prs.map(async pr => {
    const { data: { check_runs } } = await octokit.rest.checks.listForRef({
      owner,
      repo,
      ref: pr.head.sha
    })
    const filteredRuns = check_runs
      .filter(run => run.name === "branch-broken-check")
      .filter(() => (commitState === "success") || (commitState === "failure" && pr.user.login !== branch2commit[pr.base.ref].author.login))
      .slice(0, 1)
    return filteredRuns
  }))).flat()

  checkRuns.forEach(async run => {
    await octokit.rest.checks.update({
      owner, 
      repo, 
      check_run_id: run.id,
      conclusion: commitState,
      output: {
        title: `Blocking`,
        summary: `Merge are blocked because branch ${branches} were broken.`,
        text: `broken commit(s): \n ` + branches.map(branch => {
          return `- [${branch}](${branch2commit[branch].html_url}): [${eventPayload.target_url}](${eventPayload.target_url})`
        }).join("\n")
      }
    })
  })
}

try {
  main()
} catch (e){
  core.setFailed(e)
}
