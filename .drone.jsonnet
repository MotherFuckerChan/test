[
{
  "kind": "pipeline",
  "type": "docker",
  "name": "branch",
  "trigger": {
    "event": [
      "pull_request"
    ],
    "branch": "development"
  },
  "steps": [
    {
      "name": "judge",
      "command": "echo 'In judge'",
      "when": {
          "paths": {
              "exclude": ["README.md"],
          },
      },
    },
    {
      "name": "Echo",
      "command": "echo '.MD Changed'",
    }
  ]
}
]
