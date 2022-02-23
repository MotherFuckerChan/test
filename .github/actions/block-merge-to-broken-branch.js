async function main() {
  const github = require('@actions/github');

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

  const event = process.env.GITHUB_EVENT_NAME
  const eventPayload = require(process.env.GITHUB_EVENT_PATH)


  const repo = eventPayload.repository.name
  const owner = eventPayload.repository.owner.login
  const baseRef = eventPayload.pull_request.base.ref

  console.log({owner, repo, baseRef})

  // 1. 获取当前分支 和 author
  // 2. 获取 target 分支的状态
  // 3. 获取 broken 的作者
  // 4. 判断 broken 是否由自己造成
  // 5. block merge

  if (["main", "master", "development"].indexOf(eventPayload.pull_request.base.ref) === -1) {
    process.exit(0)
  }

  const { data: deployments } = await octokit.rest.repos.listDeployments({
    owner,
    repo,
    ref: baseRef,
    // status: "completed",
    // check_name: "build"
  })

  console.log("Deployments: ", deployments)

  if (deployments.length === 0){
    process.exit(0)
  }

  deployments.forEach(async deploy => {
    console.log("Deploy Id: ", deploy.id, "==============")
    const { data: states }= await octokit.rest.repos.listDeploymentStatuses({
      owner,
      repo,
      deployment_id: deploy.id
    })
    states.forEach(st => {
      console.log(st.state, " => ", st.target_url)
    })
  })

  const checkRun = checkRunsInfo.check_runs[0]

  if (checkRun.conclusion === "failure") {
    throw "Exists broken branch!"
  }

}

main()
