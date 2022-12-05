import * as core from '@actions/core';
import { IssueReprioritizationManager } from './manager';

async function run() {
  const token: string = core.getInput('github-token');
  const originalLabel: string = core.getInput('original-label');
  const newLabel: string = core.getInput('new-label');
  const skipLabel: string = core.getInput('skip-label');
  const threshold: number = Number(core.getInput('reprioritization-threshold'));
  const reprioritizationMessage: string = core.getInput('reprioritization-message');
  const omitMessage: boolean = core.getBooleanInput('omit-message');
  const projectUrl: string = core.getInput('project-url');

  console.log(`finding issues labeled ${originalLabel} and checking if they should be ${newLabel}.`);
  if (skipLabel !== '') {
    console.log(`skipping issues labeled ${skipLabel}.`);
  }

  const manager = new IssueReprioritizationManager(token, {
    originalLabel,
    newLabel,
    skipLabel,
    threshold,
    reprioritizationMessage: reprioritizationMessage,
    omitMessage,
    projectUrl,
  });

  await manager.doAllIssues();
  core.setOutput('num-reprioritized', manager.reprioritizedIssues.length.toString());
  console.log(`reprioritized a total of ${manager.reprioritizedIssues.length} issues`);
  core.setOutput('reprioritized-issues', JSON.stringify(manager.reprioritizedIssues));
  console.log(`these issues were reprioritized: ${manager.reprioritizedIssues}`);
  core.setOutput('linked-pulls', JSON.stringify(manager.linkedPulls));
  console.log(`linked pull requests from reprioritized issues include: ${JSON.stringify(manager.linkedPulls)}.`);
}

run().catch(error => {
  core.setFailed(error.message);
});
