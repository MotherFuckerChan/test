{
  "kind": "pipeline",
  "type": "docker",
  "name": "Test",
  "trigger": {
    "event": [
      "pull_request",
      "push"
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
