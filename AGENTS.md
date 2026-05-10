# AGENTS.md

## Purpose
Defines engineering standards for all contributors (human or AI).

All implementations must be:
- Secure by design
- Well-architected (SOLID + DRY)
- Testable with enforced coverage
- Performance-conscious
- Platform-aware (reuse over rebuild)

---

## 1. Security (Non-Negotiable)

Assume zero-trust.

### Requirements
- Validate and sanitize all inputs
- Enforce authentication and authorization
- Use least privilege
- Never hardcode secrets
- Use environment variables or secret managers
- Encrypt sensitive data (in transit required, at rest if needed)
- Produce a threat model in `docs/security.md` — attack surfaces, data flows, OWASP Top 10 mitigations

---

### OWASP Awareness
Avoid:
- Injection
- Broken authentication
- Sensitive data exposure
- Security misconfiguration
- Vulnerable dependencies

---

### Secrets Management

- Never commit secrets to source code
- Use environment variables or secret managers

### Branch Protection

- Direct pushes to `main` or `master` are blocked via pre-push hook
- All changes must go through a PR

---

### Secrets Scanning (MANDATORY)

- Gitleaks must run as a pre-commit hook on every commit
- Codebases must also be scanned in CI pipeline

#### Enforcement
- Block commits if any secrets are detected (pre-commit)
- Reject PRs if any secrets are detected in code (CI)

---

## 2. Architecture (SOLID + DRY)

### SOLID
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

### DRY
- Avoid duplication
- Reuse logic
- Prefer composition

---

## 3. Testing & Coverage

### Requirements
- Code must be testable
- External systems must be mockable

### Test Types
- Unit tests
- Integration tests
- UI tests

### Coverage
- ≥80% overall
- ≥90% critical logic

### Mutation Testing
- A mutation testing tool must be run to verify test quality
- Target: ≥70% mutation score
- Coverage alone does not prove tests catch bugs

---

## 4. Performance

### Goals
- Fast responses
- Responsive UI

---

## 5. Platform Awareness

- Always check service registry before building features
- Prefer reuse over reimplementation
- Match using capabilities

---

## 6. Service Documentation (SERVICE.md)

### When Required
- service-* repositories

### Must Include
- Description
- Capabilities
- API
- Usage guidance

### Enforcement
Reject PRs if:
- Missing or outdated

---

## 7. Enforcement

### CI/CD

Must include:

- SAST scanning
- SCA (Software Composition Analysis)
- Dependency scanning
- SBOM generation
- Secrets scanning
- DAST scanning
- IaC scanning
- Container image scanning
- License compliance scanning

---

### SBOM

- CycloneDX required

### Vulnerability Policy

Reject if:
- HIGH or CRITICAL vulnerabilities exist

### Vulnerability SLA

Remediation must occur within:
- CRITICAL → 24 hours
- HIGH → 7 days
- MEDIUM → 30 days

---

### Dependency Management

- Automated updates required (Renovate Bot)

Reject if:
- Vulnerable dependencies unresolved

---

## 8. Runtime & Dependency Security

### SAST
- Static analysis must be enforced

---

### DAST
- Runtime scanning must be enforced

---

### SCT
- Continuous dependency monitoring required

---

### IaC Scanning
- Checkov must scan all ARM/Bicep/Terraform templates

---

### Container Scanning
- Trivy must scan all container images for CVEs

---

### Principle

Security must cover:
- Code
- Dependencies
- Runtime
- Secrets
- Infrastructure as Code
- Container images

---

## 9. Code Review Rules

Reject PRs if:

- Security risks
- Missing tests
- Poor architecture
- Performance issues

---

## 10. Agent Behavior

Agents must:
- Prefer platform services
- Follow SOLID/DRY
- Ensure testability
- Consider performance

### Tests Are Not Optional

Every feature shipped must include:
- Unit tests for all new logic
- Coverage meeting thresholds (≥80% overall, ≥90% critical)
- E2E tests for any UI or user-facing flows

Do NOT mark a feature complete without tests. Do NOT ask the user if tests are needed — they always are.

---

## 11. Definition of Done

- [ ] Secure
- [ ] Threat model documented
- [ ] Tested
- [ ] Coverage met (≥80% overall, ≥90% critical)
- [ ] Mutation score met (≥70%)
- [ ] Performance considered
- [ ] Platform reuse applied
- [ ] SERVICE.md updated (if service)
- [ ] SBOM generated
- [ ] No HIGH/CRITICAL vulnerabilities
- [ ] Vulnerability SLA acknowledged for any open findings
- [ ] No secrets exposed
- [ ] DAST passed
- [ ] IaC scan passed
- [ ] Container scan passed
- [ ] License scan passed
- [ ] PR template checklist completed