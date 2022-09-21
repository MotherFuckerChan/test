const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");
const context = github.context;

async function run() {
    const token = core.getInput("GITHUB_TOKEN");
    // const octokit = new Octokit({auth: token});
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
    // const octokit = new github.GitHub(token);

    const { data: prs } = await octokit.rest.pulls.list({
        ...context.repo,
        state: "open",
        sort: "created",
        direction: "asc"
    });

    const today = new Date();

    for (const pr of prs) {
        const prCreateDate = Date.parse(pr.created_at.split("T")[0]);
        console.log(pr.created_at)
        const dayDiff = parseInt(Math.abs(today - prCreateDate) / 1000 / 60 / 60 / 24)
        console.log("DayDff", dayDiff)
        if (dayDiff >= 0) {
            await octokit.rest.pulls.update({
                // ...context.repo,
                owner: "MotherFuckerChan",
                repo: "test",
                pull_number: pr.number,
                state: "closed"
            });
            console.log(`Closed #${pr.number}.`);
        }
    }
}

run();