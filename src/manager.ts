import * as github from '@actions/github';
export interface IssueReprioritizationManagerProps {
  readonly originalLabel: string;
  readonly newLabel: string;
  readonly skipLabel: string;
  readonly threshold: number;
  readonly reprioritizationMessage: string;
  readonly omitMessage: boolean;
  readonly columnUrl: string;
}

export class IssueReprioritizationManager {
  private readonly client: ReturnType<typeof github.getOctokit>;
  private readonly owner: string;
  private readonly repo: string;
  private readonly originalLabel: string;
  private readonly newLabel: string;
  private readonly skipLabel: string;
  private readonly threshold: number;
  private readonly reprioritizationMessage: string;
  private readonly omitMessage: boolean;
  private readonly projectUrl: string;
  public reprioritizedIssues: number[] = [];
  public linkedPulls: number[] = [];

  constructor(token: string, props: IssueReprioritizationManagerProps) {
    this.client = github.getOctokit(token);
    this.owner = github.context.repo.owner;
    this.repo = github.context.repo.repo;
    this.originalLabel = props.originalLabel;
    this.newLabel = props.newLabel;
    this.skipLabel = props.skipLabel;
    this.threshold = props.threshold;
    this.reprioritizationMessage = props.reprioritizationMessage;
    this.omitMessage = props.omitMessage;
    this.projectUrl = props.columnUrl;
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
          // skip if skip label is present
          if (hasSkipLabel(issue.labels, this.skipLabel)) {
            continue;
          }
          const reprioritized = await this.considerIssuePriority(issue.number);
          if (reprioritized) {
            await this.getLinkedPulls(issue.number);
          }
        }
      });

    const columnId = validateProjectColumnUrl(this.projectUrl);
    if (columnId) {
      console.log(`adding ${this.reprioritizedIssues.length} issues to the project board`);
      for (const issue of this.reprioritizedIssues) {
        await this.addToProject(columnId, issue);
      }
    }

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

  private async getLinkedPulls(issueNumber: number) {
    await this.client
      .paginate(this.client.rest.issues.listEventsForTimeline, {
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      })
      .then(async (events) => {
        for (const event of events) {
          if (event.event === 'cross-referenced' && event.source?.issue?.pull_request) {
            this.linkedPulls.push(event.source.issue.number);
          }
        }
      });
  }

  private async considerIssuePriority(issueNumber: number): Promise<boolean> {
    const issue = await this.client.rest.issues.get({
      issue_number: issueNumber,
      owner: this.owner,
      repo: this.repo,
    });

    const count = issue.data.reactions?.total_count;
    if (count && count >= this.threshold) {
      // hasHiddenComment might be the most work this action is doing,
      // so we only want to call it if it is necessary to check for it.
      const hasComment = await this.hasHiddenComment(issueNumber);
      if (!hasComment) {
        await this.reprioritize(issueNumber);
        return true;
      }
    }
    return false;
  }

  private async hasHiddenComment(issueNumber: number): Promise<boolean> {
    let hasComment = false;
    await this.client
      .paginate(this.client.rest.issues.listComments, {
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      })
      .then(async (comments) => {
        // work backwards because comment in question is likely at the end
        for (let i = comments.length-1; i >= 0; i--) {
          const comment = comments[i];
          // if this is true then we've reprioritized this before
          if (comment.body?.includes(this.uniqueHiddenComment())) {
            hasComment = true;
            return;
          }
        }
      });

    return hasComment;
  }

  private async reprioritize(issueNumber: number) {
    console.log(`Upgrading issue #${issueNumber}`);
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
    this.reprioritizedIssues.push(issueNumber);
  }

  private async addMessage(issueNumber: number) {
    if (this.omitMessage) {
      return;
    }

    // adds the labeling into the hidden metadata to differentiate between different usages
    // of the same action (i.e. you can theoretically use this action from p2->p1 and p1->p0)
    const message = `${this.uniqueHiddenComment()}\n${this.reprioritizationMessage}`;
    console.log(`Adding comment to #${issueNumber}`);

    await this.client.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      body: message,
    });
  }

  /**
   * Returns a comment that is hidden in MarkDown that is "unique" to the kind of action.
   * Here, we say that a unique action has a different set of original label and new label.
   */
  private uniqueHiddenComment(): string {
    // we could add all the properties to this metadata to truly differentiate between different
    // "kinds" of reprioritization, but I don't think it's necessary. The only use case we are
    // guarding against is using the same action to reprioritize p2 to p1 and p1 to p0.
    return `<!--${this.originalLabel} to ${this.newLabel}-->`;
  }

  private async addToProject(columnId: number, issueNumber: number) {
    const issueId = await this.getIssueId(issueNumber);
    await this.client.rest.projects.createCard({
      column_id: columnId,
      content_id: issueId,
      content_type: 'Issue',
    });
  }

  private async getIssueId(issueNumber: number): Promise<number> {
    const issue = await this.client.rest.issues.get({
      issue_number: issueNumber,
      owner: this.owner,
      repo: this.repo,
    });

    return issue.data.id;
  }
}

function validateProjectColumnUrl(url: string): number | undefined {
  if (url === '') { return undefined; }

  const acceptedUrls = /^(?:https:\/\/)?github\.com\/(?<owner>[^\/]+)\/(?<repo>[^\/]+)\/projects\/(?<projectNumber>\d+)#column-(?<columnId>[^\/]+)/;
  const matchedUrl = url.match(acceptedUrls);
  if (!matchedUrl) {
    throw new Error(`The project url must look like "https://github.com/owner/repo/projects/1#column-00000000" but got ${url}`);
  }
  return matchedUrl.groups?.columnId ? Number(matchedUrl.groups?.columnId) : undefined;
}
