const { actions } = require('projen');
const project = new actions.GitHubActionTypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'issue-graduation-manager',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();