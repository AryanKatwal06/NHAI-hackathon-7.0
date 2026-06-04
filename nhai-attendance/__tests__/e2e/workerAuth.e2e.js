describe('Worker Authentication Flow', () => {
  beforeAll(async () => {
    // Launch app, simulate previous supervisor login has occurred
    await device.launchApp({ newInstance: true });
    
    // Bypass login if needed (depends on Detox mock setup, assuming PIN 1234)
    await waitFor(element(by.id('login-screen'))).toBeVisible().withTimeout(3000);
    await element(by.id('pin-input')).typeText('1234');
    await element(by.id('login-submit')).tap();
  });

  it('should complete authentication pipeline successfully', async () => {
    // Start auth from dashboard
    await element(by.id('start-auth-btn')).tap();
    await expect(element(by.id('authentication-screen'))).toBeVisible();
    
    // Wait for background signals to compute
    await waitFor(element(by.text('Background signals ready'))).toBeVisible().withTimeout(5000);
    
    // Simulate face detection (since we can't easily test real camera in CI)
    await element(by.id('simulate-face-btn')).tap();
    
    // Proceed to liveness
    await element(by.id('proceed-liveness-btn')).tap();
    await expect(element(by.id('liveness-screen'))).toBeVisible();
    
    // Wait for the first challenge to appear
    await waitFor(element(by.id('challenge-pass-btn'))).toBeVisible().withTimeout(1000);
    
    // Simulate passing the challenges
    // Note: Constants say CHALLENGE_COUNT = 2
    for(let i = 0; i < 2; i++) {
      await element(by.id('challenge-pass-btn')).tap();
      await new Promise(r => setTimeout(r, 500)); // small delay for UI transition
    }
    
    // Should transition to Results screen
    await waitFor(element(by.id('results-screen'))).toBeVisible().withTimeout(3000);
    
    // Verify successful authentication
    await expect(element(by.text('Authenticated'))).toBeVisible();
    
    // Return to dashboard
    await element(by.id('back-to-dashboard-btn')).tap();
    await expect(element(by.id('supervisor-dashboard'))).toBeVisible();
  });
});
