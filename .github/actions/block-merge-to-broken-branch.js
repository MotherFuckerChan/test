async function main() {
  const github = require('@actions/github');

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

  const event = process.env.GITHUB_EVENT_NAME
  const eventPayload = require(process.env.GITHUB_EVENT_PATH)


  const owner = eventPayload.repository.name
  const repo = eventPayload.repository.owner.login

  // 1. 获取当前分支 和 author
  // 2. 获取 target 分支的状态
  // 3. 获取 broken 的作者
  // 4. 判断 broken 是否由自己造成
  // 5. block merge

  if (["main", "master", "development"].indexOf(eventPayload.pull_request.base.ref) === -1) {
    process.exit(0)
  }

  const { data: checkRunsInfo } = await octokit.rest.checks.listForRef({
    owner,
    repo,
    ref: eventPayload.pull_request.base.ref,
    status: "completed",
    // check_name: "build"
  })

  if (checkRunsInfo.total_count === 0){
    process.exit(0)
  }

  checkRunsInfo.check_runs.each(run => {
    console.log("Run Info: ", run.id, run.name, ", ", run.conclusion)
  })

  const checkRun = checkRunsInfo.check_runs[0]

  if (checkRun.conclusion === "failure") {
    throw "Exists broken branch!"
  }

}

main()
