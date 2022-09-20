const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");

async function run() {
    const token = core.getInput("token");
    const octokit = new Octokit({auth: token});

    const { data: prs } = await octokit.issues.listForRepo({
        owner: "MotherFuckerChan",
        repo: "test",
        // state: "open",
        sort: "created"
    });

    const datePattern = /(\d\d?)-(\d\d?)-(\d{2,4})/;
    const today = new Date();

    for (const pr of prs) {
        const results = datePattern.exec(pr.created_at.split("T"[0]));
        console.log("Ptd", results)

        if (results !== null) {
            let [month, day, year] = results.slice(1).map((part) => parseInt(part, 10));

            const prCreateDate = new Date(year, month - 1, day);

            console.log(`Date found in title: ${prCreateDate.toDateString()}`)
            const dayDiff = parseInt(Math.abs(today - prCreateDate) / 1000 / 60 / 60 / 24)
            console.log("DayDff")
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
}

run();