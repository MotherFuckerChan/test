const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");
const context = github.context;

async function run() {
    const token = core.getInput("token");
    const octokit = new Octokit({auth: token});

    const { data: prs } = await octokit.issues.listForRepo({
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
            octokit.pulls.update({
                ...context.repo,
                pull_number: pr.number,
                state: "closed",
            });
            console.log(`Closed #${pr.number}.`);
        }
    }
}

run();