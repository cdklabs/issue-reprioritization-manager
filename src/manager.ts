import * as github from '@actions/github';

export interface IssueGraduationManagerProps {
  readonly originalLabel: string;
  readonly newLabel: string;
  readonly skipLabel: string;
  readonly threshold: number;
  readonly graduationMessage: string;
  readonly omitMessage: boolean;
}

export class IssueGraduationManager {
  private readonly client: ReturnType<typeof github.getOctokit>;
  private readonly owner: string;
  private readonly repo: string;
  private readonly originalLabel: string;
  private readonly newLabel: string;
  private readonly skipLabel: string;
  private readonly threshold: number;
  private readonly graduationMessage: string;
  private readonly omitMessage: boolean;
  public numGraduated = 0;

  constructor(token: string, props: IssueGraduationManagerProps) {
    this.client = github.getOctokit(token);
    this.owner = github.context.repo.owner;
    this.repo = github.context.repo.repo;
    this.originalLabel = props.originalLabel;
    this.newLabel = props.newLabel;
    this.skipLabel = props.skipLabel;
    this.threshold = props.threshold;
    this.graduationMessage = props.graduationMessage;
    this.omitMessage = props.omitMessage;
  }

  public async doAllIssues() {
    await this.client
      .paginate(this.client.rest.issues.listForRepo, {
        owner: this.owner,
        repo: this.repo,
        state: 'open',
        labels: this.originalLabel,
      })
      .then(async (issues) => {
        for (const issue of issues) {
          if (issue.labels.includes(this.skipLabel)) {
            continue;
          }
          await this.considerGraduateIssue(issue.number);
        }
      });
  }

  private async considerGraduateIssue(issueNumber: number) {
    const issue = await this.client.rest.issues.get({
      issue_number: issueNumber,
      owner: this.owner,
      repo: this.repo,
    });

    const count = issue.data.reactions?.total_count;
    if (count && count >= this.threshold) {
      await this.graduate(issueNumber);
    }
  }

  private async graduate(issueNumber: number) {
    await Promise.all([
      this.client.rest.issues.addLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        labels: [this.newLabel],
      }),
      this.client.rest.issues.removeLabel({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        name: this.originalLabel,
      }),
    ]);

    await this.addMessage(issueNumber);
    this.numGraduated +=1;
  }

  private async addMessage(issueNumber: number) {
    if (this.omitMessage) {
      return;
    }

    await this.client.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      body: this.graduationMessage,
    });
  }
}