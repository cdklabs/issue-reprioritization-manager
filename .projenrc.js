const { actions } = require('projen');
const project = new actions.GitHubActionTypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'issue-reprioritization-manager',
  metadata: {
    author: 'Kaizen Conroy',
    inputs: {
      'github-token': {
        description: 'GitHub token',
        required: true,
      },
      'original-label': {
        description: 'label that is candidate for reprioritization',
        required: true,
      },
      'new-label': {
        description: 'new label attached to all graduated issues',
        required: true,
      },
      'skip-label': {
        description: 'skip reprioritization on issues with this label',
        required: false,
      },
      'reprioritization-threshold': {
        description: 'the threshold count necessary for reprioritization',
        required: false,
        default: '20',
      },
      'reprioritization-message': {
        description: 'display this message on issues that graduate',
        required: false,
        default: [
          'This issue has received a significant amount of attention',
          'so we are automatically upgrading its priority.',
          'A member of the community will see the re-prioritization',
          'and provide an update on the issue.',
        ].join(' '),
      },
      'omit-message': {
        description: 'set this flag if you do not want automatic messages on graduated issues',
        required: false,
        default: false,
      },
    },
    outputs: {
      'num-graduated': {
        description: 'returns the number of graduated issues',
      },
      'linked-pulls': {
        description: 'returns a list of linked pull requests from graduated issues',
      },
    },
    branding: {
      color: 'purple',
      icon: 'arrow-up-circle',
    },
  },
});
project.synth();