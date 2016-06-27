import Brandibble from '..';

export function seedEmail() {
  return `sanctuary-testing-${(new Date()).valueOf().toString()}@example.com`;
}

export const UnsecureApiKey = 'eyJhbGciOiJIUzI1NiIsImV4cCI6MTQ5ODEzNTc2NiwiaWF0IjoxNDY2NTk5NzY2fQ.eyJlbWFpbCI6Imh1Z2hAc2FuY3R1YXJ5LmNvbSIsImRvbWFpbiI6Imh0dHBzOi8vc2FuY3R1YXJ5LmNvbXB1dGVyIiwiYXBpX3VzZXJfaWQiOjEsIm5hbWUiOiJTYW5jdHVhcnkifQ.ZiQdEYSawYF7v-ZO2dkOzY4WnMFIf67GScYfsxab-vw';

export function seedText() {
  return `Testing ${(new Date()).valueOf().toString()}`;
}

export function buildRef() {
  return new Brandibble({
    apiKey: UnsecureApiKey,
    brandId: 6,
    apiEndpoint: 'http://unsecure.brandibble.co/api/'
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
