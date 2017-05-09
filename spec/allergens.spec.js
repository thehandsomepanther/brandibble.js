/* global Brandibble expect it describe before */
import { shouldSucceed, TestingUser } from './helpers';
import includes from 'lodash.includes';

describe('Allergens', () => {
  it('exists', () => expect(Brandibble.allergens).to.exist);

  it('can show all allergens', () => {
    return Brandibble.allergens.all().then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.be.a('array');
    });
  });

  describe('customer actions', () => {
    let allergens;

    before(() => {
      const { email, password } = TestingUser;
      return Brandibble.customers.authenticate({
        email,
        password,
      }).then(response => {
        let customer = response.data;
        return Brandibble.allergens.all().then(({ data }) => {
          allergens = data;
          // Ensure testing allergen is removed!
          if (includes(customer.allergens, allergens[0].name)) {
            return Brandibble.allergens.remove([allergens[0].name]);
          }
          return true;
        });
      });
    });

    describe('adding allergens', () => {
      let added;

      before(() => {
        return Brandibble.allergens.create([allergens[0].name]).then(({ data }) => {
          added = data.added[0];
        });
      });

      it('should add customer allergen', () => {
        expect(added).to.equal(allergens[0].name);
      });

      describe('removing allergens', () => {
        let removed;

        before(() => {
          return Brandibble.allergens.remove([added]).then(({ data }) => {
            removed = data.removed[0];
          });
        });

        it('should remove customer allergen', () => {
          expect(removed).to.equal(allergens[0].name);
        });
      });

    });
  });
});
