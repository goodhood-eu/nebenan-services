## v7.0.0 Changes
- **Breaking**: Deep imports have been removed in favor of one single bundle:
    - Before: `import { track } from 'nebenan-services/lib/analytics'`
    - Now: `import { track } from 'nebenan-services'`
    - Before `import createScrollManager from 'nebenan-services/lib/scrollmanager'`
    - Now: `import { createScrollManager } from 'nebenan-services'`
- **Breaking**: Removed `setAnalyticsDisabled` and introduced `setAnalyticsEnabled`
- **Breaking**: Removed `UTM_KEY` export in favor of `getUTMKeysFromSession(session)`
- **Breaking**: `createScrollManager(History, Window)` does not return `stateHistory` anymore
- Add typescript support
- Add esm support

## v6.0.0 Breaking change
- Update dependencies and peerDependencies
