describe('Supervisor Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('should successfully complete first-time PIN setup and login', async () => {
    // Wait for Splash screen to transition
    await waitFor(element(by.id('login-screen'))).toBeVisible().withTimeout(3000);
    
    // First time PIN setup
    await element(by.id('pin-input')).typeText('1234');
    await element(by.id('confirm-pin-input')).typeText('1234');
    await element(by.id('login-submit')).tap();
    
    // Verify transition to Dashboard
    await expect(element(by.id('supervisor-dashboard'))).toBeVisible();
  });

  it('should configure worksite in settings', async () => {
    // Navigate to settings
    await element(by.id('settings-btn')).tap();
    await expect(element(by.id('settings-screen'))).toBeVisible();
    
    // Enter mock location data (simulate standard worksite)
    await element(by.text('Latitude')).typeText('12.9716');
    await element(by.text('Longitude')).typeText('77.5946');
    await element(by.text('Save Worksite')).tap();
    
    // Expect success alert
    await expect(element(by.text('Success'))).toBeVisible();
    await element(by.text('OK')).tap();
    
    // Go back
    await element(by.traits(['button']).and(by.text('Back'))).tap(); // Back button from nav
  });

  it('should enroll a new worker successfully', async () => {
    await element(by.id('enroll-btn')).tap();
    await expect(element(by.id('enrollment-screen'))).toBeVisible();
    
    // Fill worker details
    await element(by.id('enrollment-employee-id')).typeText('WORKER_001');
    await element(by.id('enrollment-full-name')).typeText('John Doe');
    await element(by.id('enrollment-next-btn')).tap();
    
    // Step 2: Capture face
    await expect(element(by.text('Step 2: Face Enrollment'))).toBeVisible();
    await element(by.id('enrollment-capture-btn')).tap();
    
    // Step 3: Wait for processing and completion
    await waitFor(element(by.text('✓ Enrollment Complete'))).toBeVisible().withTimeout(5000);
    await element(by.id('enrollment-done-btn')).tap();
    
    // Should be back on dashboard
    await expect(element(by.id('supervisor-dashboard'))).toBeVisible();
  });
});
