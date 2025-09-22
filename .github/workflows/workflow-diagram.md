# GitHub Actions Workflow Diagram

## Workflow Overview

```mermaid
graph TD
    A[Push/PR to main/develop] --> B[CI/CD Pipeline]
    B --> C[Lint & Type Check]
    B --> D[Test Suite]
    B --> E[Security Audit]
    B --> F[Build Verification]
    
    C --> G[Quality Gate]
    D --> G
    E --> G
    F --> G
    
    G --> H{Quality Gate Passed?}
    H -->|Yes| I[Integration Tests]
    H -->|Yes| J[Performance Tests]
    H -->|No| K[❌ Build Failed]
    
    I --> L[✅ CI Complete]
    J --> L
    
    M[Version Tag Push] --> N[Publish Workflow]
    N --> O[Validate Version]
    N --> P[Run Tests]
    N --> Q[Build Package]
    N --> R[Publish to npm]
    N --> S[Create GitHub Release]
    
    O --> T{Version Valid?}
    T -->|Yes| P
    T -->|No| U[❌ Invalid Version]
    
    P --> V{Tests Pass?}
    V -->|Yes| Q
    V -->|No| W[❌ Tests Failed]
    
    Q --> X{Build Success?}
    X -->|Yes| R
    X -->|No| Y[❌ Build Failed]
    
    R --> Z{Published?}
    Z -->|Yes| S
    Z -->|No| AA[❌ Publish Failed]
    
    S --> BB[✅ Release Complete]
    
    CC[Manual Dispatch] --> DD[Release Management]
    DD --> EE[Calculate Version]
    DD --> FF[Update package.json]
    DD --> GG[Create Git Tag]
    DD --> HH[Push Changes]
    DD --> II[Create Release]
    
    EE --> JJ{Version Available?}
    JJ -->|Yes| FF
    JJ -->|No| KK[❌ Version Exists]
    
    FF --> LL[✅ Release Created]
    
    MM[Schedule/Manual] --> NN[Security Scan]
    NN --> OO[Dependency Audit]
    NN --> PP[CodeQL Analysis]
    NN --> QQ[License Check]
    NN --> RR[Secret Scan]
    
    OO --> SS[Security Summary]
    PP --> SS
    QQ --> SS
    RR --> SS
    
    TT[Schedule/Manual] --> UU[Performance Test]
    UU --> VV[Memory Usage]
    UU --> WW[Bundle Analysis]
    UU --> XX[Load Testing]
    UU --> YY[Regression Detection]
    
    VV --> ZZ[Performance Report]
    WW --> ZZ
    XX --> ZZ
    YY --> ZZ
    
    AAA[Weekly Schedule] --> BBB[Dependency Update]
    BBB --> CCC[Check Outdated]
    BBB --> DDD[Update Dependencies]
    BBB --> EEE[Create PR]
    
    CCC --> FFF{Updates Available?}
    FFF -->|Yes| DDD
    FFF -->|No| GGG[ℹ️ No Updates]
    
    DDD --> HHH{Tests Pass?}
    HHH -->|Yes| EEE
    HHH -->|No| III[❌ Update Failed]
    
    EEE --> JJJ[✅ PR Created]
```

## Workflow Triggers

### CI/CD Pipeline
- **Trigger**: Push/PR to main/develop
- **Purpose**: Validate code quality and functionality
- **Jobs**: Lint, Test, Security, Build, Integration, Performance

### Publishing
- **Trigger**: Version tag push (v*)
- **Purpose**: Publish package to npm
- **Jobs**: Validate, Test, Build, Publish, Release

### Release Management
- **Trigger**: Manual dispatch
- **Purpose**: Create new releases
- **Jobs**: Version bump, Tag creation, Release creation

### Security Scanning
- **Trigger**: Schedule (daily), Push/PR, Manual
- **Purpose**: Security vulnerability detection
- **Jobs**: Dependency audit, CodeQL, License check, Secret scan

### Performance Testing
- **Trigger**: Schedule (weekly), Push/PR, Manual
- **Purpose**: Performance monitoring
- **Jobs**: Memory usage, Bundle analysis, Load testing

### Dependency Updates
- **Trigger**: Schedule (weekly), Manual
- **Purpose**: Keep dependencies updated
- **Jobs**: Check outdated, Update dependencies, Create PR

## Environment Requirements

### Required Secrets
- `NPM_TOKEN` - npm publishing token
- `GITHUB_TOKEN` - GitHub API access (auto-provided)
- `WOPEE_API_KEY_TEST` - Test API key (optional)
- `WOPEE_PROJECT_UUID_TEST` - Test project UUID (optional)

### Environment Variables
- `NODE_VERSION: '18'`
- `NPM_VERSION: '8'`
- `REGISTRY_URL: 'https://registry.npmjs.org/'`

## Workflow Dependencies

```mermaid
graph LR
    A[CI/CD] --> B[Publishing]
    A --> C[Release Management]
    D[Security] --> E[Quality Gate]
    F[Performance] --> E
    G[Dependencies] --> A
```

## Success Criteria

### CI/CD Pipeline
- ✅ All linting passes
- ✅ All tests pass
- ✅ Security audit passes
- ✅ Build succeeds
- ✅ Quality gate passes

### Publishing
- ✅ Version validation passes
- ✅ Tests pass
- ✅ Build succeeds
- ✅ npm publish succeeds
- ✅ GitHub release created

### Security
- ✅ No critical vulnerabilities
- ✅ CodeQL analysis passes
- ✅ License compliance
- ✅ No secrets detected

### Performance
- ✅ Memory usage within limits
- ✅ Bundle size within limits
- ✅ No performance regressions
- ✅ Load tests pass

## Failure Handling

### Automatic Retry
- Network failures: 3 retries with exponential backoff
- Transient errors: Automatic retry
- Rate limiting: Wait and retry

### Manual Intervention
- Critical failures: Manual review required
- Security issues: Immediate notification
- Performance regressions: Alert and investigation

### Rollback Procedures
- Failed publishes: Version rollback
- Broken releases: Tag deletion
- Security issues: Immediate patching
