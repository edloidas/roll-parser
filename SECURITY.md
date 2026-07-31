# Security Policy

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| 3.x     | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a vulnerability

Please do not open a public issue for security problems. Instead, use one of
the private channels:

- **GitHub**: [report a vulnerability](https://github.com/edloidas/roll-parser/security/advisories/new)
  via private vulnerability reporting — preferred.
- **Email**: [edloidas@gmail.com](mailto:edloidas@gmail.com) with
  `[roll-parser security]` in the subject if you cannot use GitHub.

Include the notation or input that triggers the problem, the observed
behavior, and the impact you believe it has. You should receive an initial
response within a week.

## Scope

roll-parser evaluates untrusted dice notation by design, so crashes, hangs,
unbounded resource consumption, or any input that escapes the typed
`RollParserError` contract are in scope — see the
[Safety limits](README.md#safety-limits) the library promises to enforce.
`SeededRNG` is documented as not cryptographically secure; predictability of
its sequences is not a vulnerability.
