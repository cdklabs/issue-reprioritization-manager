import * as core from '@actions/core';
import { HIDDEN_COMMENT, IssueReprioritizationManager } from './manager';

async function run() {
  const token: string = core.getInput('github-token');
  const originalLabel: string = core.getInput('original-label');
  const newLabel: string = core.getInput('new-label');
  const skipLabel: string = core.getInput('skip-label');
  const threshold: number = Number(core.getInput('reprioritization-threshold'));
  const reprioritizationMessage: string = `${HIDDEN_COMMENT}\n${core.getInput('reprioritization-message')}`;
  const omitMessage: boolean = core.getBooleanInput('omit-message');

  console.log(`finding issues labeled ${originalLabel} and checking if they should be ${newLabel}. Skipping issues labeled ${skipLabel}.`);
  const manager = new IssueReprioritizationManager(token, {
    originalLabel,
    newLabel,
    skipLabel,
    threshold,
    reprioritizationMessage: reprioritizationMessage,
    omitMessage,
  });

  await manager.doAllIssues();
  core.setOutput('num-reprioritized', manager.numReprioritized.toString());
  console.log(`reprioritized a total of ${manager.numReprioritized} issues`);
  core.setOutput('linked-pulls', JSON.stringify(manager.linkedPulls));
  console.log(`linked pull requests from reprioritized issues include: ${JSON.stringify(manager.linkedPulls)}.`);
}

run().catch(error => {
  core.setFailed(error.message);
});
