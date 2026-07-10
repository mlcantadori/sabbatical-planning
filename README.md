# sabbatical-planning
Planning a 1y sabbatical in Asia

## Photo validation

Validate that all chapter photo keywords are mapped and that direct image URLs are reachable:

```bash
node scripts/validate-photo-urls.mjs
```

Install a local pre-commit hook to run this check automatically before every commit:

```bash
bash scripts/install-pre-commit-hook.sh
```
