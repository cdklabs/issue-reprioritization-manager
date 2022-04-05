import * as core from '@actions/core';
import { IssueGraduationManager } from './manager';

async function run() {
  const token: string = core.getInput('github-token');
  const originalLabel: string = core.getInput('original-label');
  const newLabel: string = core.getInput('new-label');
  const skipLabel: string = core.getInput('skip-label');
  const threshold: number = Number(core.getInput('graduation-threshold'));
  const graduationMessage: string = core.getInput('graduation-message');
  const omitMessage: boolean = core.getBooleanInput('omit-message');

  console.log(`finding issues labeled ${originalLabel} and checking if they should be ${newLabel}. Skipping issues labeled ${skipLabel}.`);
  const manager = new IssueGraduationManager(token, {
    originalLabel,
    newLabel,
    skipLabel,
    threshold,
    graduationMessage,
    omitMessage,
  });

  await manager.doAllIssues();
  core.setOutput('num-graduated', manager.numGraduated.toString());
  console.log(`graduated a total of ${manager.numGraduated} issues`);
  core.setOutput('linked-pulls', JSON.stringify(manager.linkedPulls));
  console.log(`linked pull requests from graduated issues include: ${JSON.stringify(manager.linkedPulls)}.`);
}

run().catch(error => {
  core.setFailed(error.message);
});
