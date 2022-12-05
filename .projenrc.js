const { GitHubActionTypeScriptProject, RunsUsing } = require('projen-github-action-typescript');
const project = new GitHubActionTypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'issue-reprioritization-manager',
  devDeps: ['projen-github-action-typescript'],
  actionMetadata: {
    author: 'Kaizen Conroy',
    runs: {
      main: 'dist/index.js',
      using: RunsUsing.NODE_16,
    },
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
        description: 'new label attached to all reprioritized issues',
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
        description: 'display this message on issues that were reprioritized',
        required: false,
        default: [
          'This issue has received a significant amount of attention',
          'so we are automatically upgrading its priority.',
          'A member of the community will see the re-prioritization',
          'and provide an update on the issue.',
        ].join(' '),
      },
      'omit-message': {
        description: 'set this flag if you do not want automatic messages on reprioritized issues',
        required: false,
        default: false,
      },
      'project-url': {
        description: 'the url of the org-level project you want to add reprioritized issues to',
        requried: false,
      },
      'project-scope': {
        description: 'project scopes can be either user level or organization level',
        required: false,
        default: 'organization',
      },
    },
    outputs: {
      'num-reprioritized': {
        description: 'returns the number of reprioritized issues',
      },
      'reprioritized-issues': {
        description: 'returns a list of reprioritized issues',
      },
      'linked-pulls': {
        description: 'returns a list of linked pull requests from reprioritized issues',
      },
    },
    branding: {
      color: 'purple',
      icon: 'arrow-up-circle',
    },
  },
});
project.synth();