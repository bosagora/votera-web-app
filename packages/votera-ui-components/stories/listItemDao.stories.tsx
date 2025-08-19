import React from 'react';
import {Meta, Story} from '@storybook/react';

import {ListItemDao, ListItemDaoProps} from '../src/components/listItem';
import {useState} from '@storybook/addons';

export default {
  title: 'Components/ListItem/Dao',
  component: ListItemDao,
} as Meta;

const Template: Story<{daos: ListItemDaoProps[]}> = args => {
  const [selected, setSelected] = useState(args.daos[1].proposalTitle);

  return (
    <div className="space-y-2">
      <p>Selected item: {selected}</p>
      {args.daos.map((dao, index) => (
        <ListItemDao
          key={index}
          {...dao}
          selected={selected === dao.proposalTitle}
          onClick={() => setSelected(dao.proposalTitle)}
        />
      ))}
    </div>
  );
};

export const Dao = Template.bind({});
Dao.args = {
  daos: [
    {
      proposalTitle: 'Bushido DAO',
      proposalId: 'bushido.dao.eth',
    },
    {
      proposalTitle: 'Patito DAO',
      proposalId: 'patito.dao.eth',
    },
  ],
};
