export const validFavoriteForOrder = {
  added: '2017-04-13T05:00:07Z',
  favorite_item_id: 9526,
  menu_item_id: 12317,
  menu_item_json: [
    {
      id: 12317,
      instructions: 'Extra hot please.',
      made_for: 'John',
      option_groups: [
        {
          id: 473,
          option_items: [
            {
              id: 9432,
            },
          ],
        },
        {
          id: 474,
          option_items: [
            {
              id: 9436,
            },
            {
              id: 17136,
            },
          ],
        },
      ],
    },
  ],
  menu_item_name: 'Herb Roasted Chicken',
  name: 'New Favorite',
  updated: '2017-04-13T05:00:07Z',
};

export const invalidFavoriteForOrder = {
  added: '2017-04-13T05:00:07Z',
  favorite_item_id: 6969,
  menu_item_id: 12345,
  menu_item_json: [
    {
      id: 54321,
      instructions: 'Extra hot please.',
      made_for: 'John',
      option_groups: [
        {
          id: 123,
          option_items: [
            {
              id: 4567,
            },
          ],
        },
        {
          id: 456,
          option_items: [
            {
              id: 7891,
            },
            {
              id: 10111,
            },
          ],
        },
      ],
    },
  ],
  menu_item_name: 'Beans on toast',
  name: 'Hello Govna',
  updated: '2017-04-13T05:00:07Z',
};
