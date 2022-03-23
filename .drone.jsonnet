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
      "commands": [
          "echo 'In judge'"
      ],
      "when": {
          "paths": {
              "exclude": ["README.md"],
          },
      },
    },
    {
      "name": "Echo",
      "commands": [
          "echo '.MD Changed'"
      ],
    }
  ]
}
