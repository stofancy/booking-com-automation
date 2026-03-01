/**
 * Integration Test Configuration
 * Shared configuration for all integration tests
 */

export const TEST_CONFIG = {
  // Browser settings
  browser: {
    profile: 'chrome',
    timeout: 30000,
    snapshotTimeout: 10000
  },
  
  // Booking.com settings
  booking: {
    baseUrl: 'https://www.booking.com',
    testDestination: 'Paris',
    testDestinationId: '-1456928',
    testDates: {
      checkin: '2026-03-30',
      checkout: '2026-03-31'
    },
    testGuests: {
      adults: 2,
      children: 0,
      rooms: 1
    },
    testProperty: {
      name: 'Relais Hôtel du Vieux Paris',
      url: 'https://www.booking.com/hotel/fr/relaishotelvieuxparis.html'
    }
  },
  
  // Test thresholds
  thresholds: {
    minSearchResults: 10,
    minRoomOptions: 3,
    minFacilities: 5,
    accuracyThreshold: 0.9,
    priceRange: {
      min: 1000,
      max: 10000
    }
  },
  
  // Timing
  delays: {
    betweenTests: 2000,
    afterNavigation: 3000,
    afterInteraction: 1000
  }
};

export default TEST_CONFIG;
