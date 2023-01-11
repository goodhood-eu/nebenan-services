## v7.0.0 Changes
- **Breaking**: Deep imports have been removed in favor of single bundles:
    - Before: `import { track } from 'nebenan-services/lib/analytics'`
    - Now: `import { track } from 'nebenan-services'`
- **Breaking**: `createScrollManager(History, Window)` does not return `stateHistory` anymore
- Add typescript support
- Add esm support

## v6.0.0 Breaking change
- Update dependencies and peerDependencies
