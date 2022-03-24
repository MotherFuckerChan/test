{
  "kind": "pipeline",
  "type": "docker",
  "name": "Test",
  "image": "python:3.6.5",
  "trigger": {
    "event": [
      "pull_request",
      "push"
    ],
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
      ]
    }
  ]
}
