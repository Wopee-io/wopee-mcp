# Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and releases.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

## Examples

```
feat: add new MCP tool for test case generation
fix: resolve authentication issue with Wopee API
docs: update README with installation instructions
chore: update dependencies to latest versions
```

## Breaking Changes

Use `!` after the type to indicate a breaking change:

```
feat!: remove deprecated API endpoint
```

Or add `BREAKING CHANGE:` in the footer:

```
feat: add new configuration option

BREAKING CHANGE: The old config format is no longer supported
```

## Release Notes

Semantic-release will automatically:
- Determine the version bump based on commit types
- Generate release notes from commit messages
- Publish to npm
- Create GitHub releases
- Update the CHANGELOG.md file
