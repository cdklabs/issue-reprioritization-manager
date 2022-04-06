# Issue Reprioritization Manager

The purpose of this action is to earn trust with open-source contributors.
This action provides a mechanism for community escalation to repository
owners based on issue reactions.

The benefit is that this action automates backlog grooming and ensures that
repository owners are on top of the reactions and inertia throughout the
repository regardless of the initial triaged priority.

## Usage

Configure an action that runs once a week and reprioritizes all `p2` issues
with 10+ reactions to `p1`:

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-reprioritization-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-reprioritization-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          reprioritization-threshold: 10
```

When an issue is reprioritized, an automated message is attached to the issue
explaining that the community attention has resulted in an upgraded priority.

Part of the message is a hidden comment that this action will filter for in
later runs. This means that if you decide that the original priority was
correct and manually change the labels from `new-label` to `original-label`, the
action will refuse to reprioritize that issue in the future.

## Advanced Usage

### Reprioritization Message

You can configure a custom reprioritization message:

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-reprioritization-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-reprioritization-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          reprioritization-threshold: 10
          reprioritization-message: this issue has been reprioritized!
```

You can omit the reprioritization message entirely:

> Note that omitting this message also omits the hidden comment that
> this action uses to filter issues that have been manually downgraded
> back to `original-label`. To skip reprioritizing these downgraded
> issues in future runs, use the [Skip Label](#skip-labels) property.

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-reprioritization-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-reprioritization-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          reprioritization-threshold: 10
          omit-message: true
```

### Skip Labels

> You do not need this property unless you are also omitting the reprioritization
> message. In all other cases, this action automatically detects reprioritized
> issues that were downgraded through a hidden comment in the message.

Provide a label that this action will use to skip reprioritization:

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-reprioritization-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-reprioritization-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          skip-label: no-reprioritization
          reprioritization-threshold: 10
          omit-message: true
```

### Multiple Runs

You can run the action multiple times for different reprioritizations:

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-reprioritization-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-reprioritization-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          reprioritizationn-threshold: 10
      - uses: kaizen3031593/issue-reprioritization-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p1
          new-label: p0
          reprioritizationn-threshold: 50
```
