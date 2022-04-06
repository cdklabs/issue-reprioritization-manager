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

## Advanced Usage

You can configure the reprioritization message:

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
