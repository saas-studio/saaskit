import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Icon, Props } from './Icon';

const meta: Meta = {
  title: 'Wordmark',
  component: Icon,
  argTypes: {
    size: {
      control: {
        type: 'text',
      },
    },
    backgroundColor: {
      control: {
        type: 'text',
      },
    },
    foregroundColor: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<Props> = args => <Icon {...args} />;

export const Default = Template.bind({});

Default.args = {};
