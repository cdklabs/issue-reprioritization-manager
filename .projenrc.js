const { actions } = require('projen');
const project = new actions.GitHubActionTypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'issue-graduation-manager',
  metadata: {
    author: 'Kaizen Conroy',
    inputs: [{
      id: 'github-token',
      description: 'GitHub token',
      required: true,
    }],
    branding: {
      color: 'purple',
      icon: 'arrow-up-circle',
    },
  },
});
project.synth();