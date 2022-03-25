{
  "kind": "pipeline",
  "type": "docker",
  "name": "Test",
  "trigger": {
    "event": [
      "pull_request",
      "push"
    ],
  },
  "steps": [
    {
      "name": "Echo",
      "image": "daocloud.io/library/nginx",
      "commands": [
          "echo '.MD Changed'"
      ],
    },
    {
      "name": "judge",
      "image": "daocloud.io/library/nginx",
      "commands": [
          "echo 'In judge'"
      ],
      "when": {
        "paths": {
          "include": ["fffREADME.md"]
        }
      }
    }
  ]
} 
  
