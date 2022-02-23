async function main() {
    const { Octokit } = require("@octokit/action");
    const core = require('@actions/core');
  
    const octokit = new Octokit();
    const event = process.env.GITHUB_EVENT_NAME
    const eventPayload = require(process.env.GITHUB_EVENT_PATH)
  
    const owner = "UrbanCompass"
    const repo = "glide-devapp"
  
    // 1. 获取当前分支 和 author
    // 2. 获取 target 分支的状态
    // 3. 获取 broken 的作者
    // 4. 判断 broken 是否由自己造成
    // 5. block merge
  
    console.log(eventPayload)
  
    if (["main", "master", "development"].indexOf(eventPayload.base.ref) === -1) {
      process.exit(0)
    }
  
    const checkRuns = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}/check-runs', {
      owner,
      repo,
      ref: eventPayload.base.ref,
      status: "completed",
      // check_name: "build"
    })
  
    if (checkRuns.length === 0){
      process.exit(0)
    }
  
    checkRuns.each(run => {
      console.log("Run Info: ", run.id, run.name, ", ", run.conclusion)
    })
  
    const checkRun = checkRuns[0]
  
    if (checkRun.conclusion === "failure") {
      throw "Exists broken branch!"
    }
  
  }

main()
