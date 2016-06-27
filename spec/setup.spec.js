import { buildRef } from './helpers';
let BrandibbleRef = buildRef();

before(done => {
  BrandibbleRef.customers.create({
    first_name: 'Sanctuary',
    last_name: 'Testing',
    email: 'sanctuary-testing-customer@example.com',
    password: 'password'
  }).then(() => done()).catch(() => done());
});
