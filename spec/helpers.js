import Brandibble from '..';

export const TestingUser = {
  first_name: 'Sanctuary',
  last_name: 'Testing',
  email: 'sanctuary-testing-customer@example.com',
  password: 'password'
};

export const TestingAddress = {
  street_address: '123 Street St',
  unit: '4 FL',
  city: 'New York',
  state_code: 'NY',
  zip_code: 10013,
  latitude: 40.755912,
  longitude: -73.9709333,
  company: 'Sanctuary Computer, Inc.',
  contact_name: 'Hugh Francis',
  contact_phone: '5512213610'
};

export function seedEmail() {
  return `sanctuary-testing-${(new Date()).valueOf().toString()}@example.com`;
}

export const UnsecureApiKey = '***REMOVED***';

export function seedText() {
  return `Testing ${(new Date()).valueOf().toString()}`;
}

export function buildRef() {
  return new Brandibble({
    apiKey: UnsecureApiKey,
    brandId: 6,
    apiEndpoint: 'https://staging.brandibble.co/api/'
  });
}

export function shouldSucceed(response) {
  expect(response).to.be.a('object');
  expect(response).to.have.property('data');
  return response.data;
}

export function shouldError(response) {
  expect(response).to.be.a('object');
  expect(response).to.have.property('errors');
  return response.errors;
}
