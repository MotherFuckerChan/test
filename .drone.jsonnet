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
      "name": "Echo",
      "commands": [
          "echo '.MD Changed'"
      ],
    },
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
  ]
}

