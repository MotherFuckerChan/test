const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");

async function run() {
    const token = core.getInput("token");
    const octokit = new Octokit({auth: token});

    const { data: prs } = await octokit.issues.listForRepo({
        owner: "MotherFuckerChan",
        repo: "test",
        state: "closed",
        sort: "created",
        direction: "asc"
    });

    const today = new Date();

    for (const pr of prs) {
        const prCreateDate = Date.parse(pr.created_at.split("T")[0]);
        console.log(pr.created_at)
        const dayDiff = parseInt(Math.abs(today - prCreateDate) / 1000 / 60 / 60 / 24)
        console.log("DayDff", dayDiff)
        if (false) {
            octokit.issues.update({
                ...ghContext.repo,
                issue_number: issueNumber,
                state: "closed",
            });
            console.log(`Closed #${issue.number}.`);
        }
    }
}

run();