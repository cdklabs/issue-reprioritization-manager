# Issue Graduation Manager

The purpose of this action is to earn trust with open-source contributors.
This action provides a mechanism for community escalation to repository
owners based on issue reactions.

The benefit is that this action automates backlog grooming and ensures that
repository owners are on top of the reactions and inertia throughout the
repository regardless of the initial triaged priority.

## Usage

Configure an action that runs once a week and graduates all `p2` issues
with 10+ reactions to `p1`:

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-graduation-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-graduation-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          graduation-threshold: 10
```

When an issue is graduated, an automated message is attached to the issue
explaining that the community attention has resulted in an upgraded priority.

## Advanced Usage

You can configure a special label that tells the action to skip graduating
certain issues:

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-graduation-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-graduation-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          skip-label: no-graduation
          graduation-threshold: 10
```

You can configure the graduation message:

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-graduation-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-graduation-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          graduation-threshold: 10
          graduation-message: this issue has graduated!
```

You can omit the graduation message entirely:

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-graduation-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-graduation-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          graduation-threshold: 10
          omit-message: true
```

You can run the action multiple times for different graduations:

```yaml
on: 
  schedule:
    - cron: "0 0 * * 0"
jobs:
  issue-graduation-manager:
    permissions:
      issues: write
    runs-on: ubuntu-latest
    steps:
      - uses: kaizen3031593/issue-graduation-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p2
          new-label: p1
          graduation-threshold: 10
      - uses: kaizen3031593/issue-graduation-manager@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          original-label: p1
          new-label: p0
          graduation-threshold: 50
```
