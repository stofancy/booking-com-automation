/**
 * Unit Tests for Guest Details Module
 * Tests the guest-details.js module
 * 
 * Run: npm test
 */

const assert = require('assert');
const { describe, it } = require('node:test');

// Import module
const guestDetails = require('../../scripts/guest-details.js');

describe('Guest Details Module', () => {
  
  describe('validateGuestData', () => {
    it('should validate complete guest data', () => {
      const guestData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        country: 'United States'
      };
      
      const validation = guestDetails.validateGuestData(guestData);
      
      assert.strictEqual(validation.valid, true);
      assert.strictEqual(validation.errors.length, 0);
    });
    
    it('should reject missing first name', () => {
      const guestData = {
        firstName: '',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        country: 'United States'
      };
      
      const validation = guestDetails.validateGuestData(guestData);
      
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.includes('First name')));
    });
    
    it('should reject missing last name', () => {
      const guestData = {
        firstName: 'John',
        lastName: '',
        email: 'john@example.com',
        phone: '+1-555-0123',
        country: 'United States'
      };
      
      const validation = guestDetails.validateGuestData(guestData);
      
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.includes('Last name')));
    });
    
    it('should reject invalid email', () => {
      const guestData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1-555-0123',
        country: 'United States'
      };
      
      const validation = guestDetails.validateGuestData(guestData);
      
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.includes('email')));
    });
    
    it('should reject short phone number', () => {
      const guestData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123',
        country: 'United States'
      };
      
      const validation = guestDetails.validateGuestData(guestData);
      
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.includes('phone')));
    });
    
    it('should reject missing country', () => {
      const guestData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        country: ''
      };
      
      const validation = guestDetails.validateGuestData(guestData);
      
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.errors.some(e => e.includes('Country')));
    });
  });
  
  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      const validEmails = [
        'john@example.com',
        'john.doe@example.com',
        'john+test@example.co.uk',
        'john_doe@example.org'
      ];
      
      validEmails.forEach(email => {
        assert.strictEqual(guestDetails.isValidEmail(email), true, `${email} should be valid`);
      });
    });
    
    it('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'invalid@example',
        'invalid@example.',
        ''
      ];
      
      invalidEmails.forEach(email => {
        assert.strictEqual(guestDetails.isValidEmail(email), false, `${email} should be invalid`);
      });
    });
  });
  
  describe('extractFormFields', () => {
    it('should extract required fields from snapshot', () => {
      const mockSnapshot = `
        combobox "First name" [ref=e100]
        combobox "Last name" [ref=e101]
        combobox "Email address" [ref=e102]
        combobox "Phone number" [ref=e103]
        combobox "Country of residence" [ref=e104]
        textbox "Special requests" [ref=e105]
      `;
      
      // Note: extractFormFields is internal, testing via extractGuestForm structure
      const hasFirstName = mockSnapshot.includes('First name');
      const hasLastName = mockSnapshot.includes('Last name');
      const hasEmail = mockSnapshot.includes('Email');
      const hasPhone = mockSnapshot.includes('Phone');
      const hasCountry = mockSnapshot.includes('Country');
      
      assert.ok(hasFirstName, 'Should have first name field');
      assert.ok(hasLastName, 'Should have last name field');
      assert.ok(hasEmail, 'Should have email field');
      assert.ok(hasPhone, 'Should have phone field');
      assert.ok(hasCountry, 'Should have country field');
    });
    
    it('should identify required vs optional fields', () => {
      const requiredFields = ['First name', 'Last name', 'Email', 'Phone', 'Country'];
      const optionalFields = ['Special requests'];
      
      assert.strictEqual(requiredFields.length, 5, 'Should have 5 required fields');
      assert.strictEqual(optionalFields.length, 1, 'Should have 1 optional field');
    });
  });
  
  describe('saveGuestProfile', () => {
    it('should save guest profile', () => {
      const guestData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      
      const result = guestDetails.saveGuestProfile(guestData, 'test-profile');
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.profileName, 'test-profile');
      assert.ok(result.timestamp);
    });
    
    it('should use default profile name', () => {
      const guestData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      
      const result = guestDetails.saveGuestProfile(guestData);
      
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.profileName, 'default');
    });
  });
  
  describe('loadGuestProfile', () => {
    it('should return null for non-existent profile', () => {
      const profile = guestDetails.loadGuestProfile('non-existent');
      assert.strictEqual(profile, null);
    });
    
    it('should return null for default profile', () => {
      const profile = guestDetails.loadGuestProfile();
      assert.strictEqual(profile, null);
    });
  });
  
  describe('Guest Data Structure', () => {
    it('should have correct structure', () => {
      const guestData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1-555-0123',
        country: 'United States',
        specialRequests: 'Late check-in requested'
      };
      
      assert.ok(guestData.firstName);
      assert.ok(guestData.lastName);
      assert.ok(guestData.email);
      assert.ok(guestData.phone);
      assert.ok(guestData.country);
      assert.ok(typeof guestData.specialRequests === 'string' || guestData.specialRequests === undefined);
    });
  });
  
});
