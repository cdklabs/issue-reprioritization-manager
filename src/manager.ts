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
          if (hasSkipLabel(issue.labels, this.skipLabel)) {
            continue;
          }
          const graduated = await this.considerGraduateIssue(issue.number);
          if (graduated) {
            await this.updateLinkedPrs(issue.number);
          }
        }
      });

    function hasSkipLabel(labels: (string | { name?: string })[], skipLabel: string): boolean {
      const filteredLabels = labels.filter((l) => {
        if (typeof l === 'string') {
          return l === skipLabel;
        } else {
          return l.name === skipLabel;
        }
      });
      return filteredLabels.length !== 0;
    }
  }

  private async updateLinkedPrs(issueNumber: number) {
    const events = await this.client.rest.issues.listEventsForTimeline({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
    });

    const linkedPulls = new Set<string>();
    for (const event of events.data) {
      console.log(event.event);
      if (event.event === 'connected' && event.url) {
        linkedPulls.add(event.url);
      } else if (event.event === 'disconnected' && event.url) {
        linkedPulls.delete(event.url);
      }
    }
    console.log(linkedPulls);
  }

  private async considerGraduateIssue(issueNumber: number): Promise<boolean> {
    const issue = await this.client.rest.issues.get({
      issue_number: issueNumber,
      owner: this.owner,
      repo: this.repo,
    });

    const count = issue.data.reactions?.total_count;
    if (count && count >= this.threshold) {
      await this.graduate(issueNumber);
      return true;
    }
    return false;
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