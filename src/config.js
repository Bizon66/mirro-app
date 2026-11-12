/* Build-time settings. Copyright (c) 2026 the app's author. All rights reserved. */
window.APP_CONFIG = {
  version: '1.0.0',
  // v1.0 ships without AI (no server, no API costs, fewer legal questions); AI arrives in 2.0
  features: {
    ai: false,
    // hidden test mode (5 taps on the version in Profile): everything unlocked for free.
    // MUST be false in the public Google Play / App Store release.
    testTools: true
  }
};
