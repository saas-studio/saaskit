import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Benefits, Props } from '../src/marketing/Benefits';

const meta: Meta = {
  title: 'Benefits',
  component: Benefits,
  argTypes: {
    name: {
      control: {
        type: 'text',
      },
    },
    fontFamily: {
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

const Template: Story<Props> = args => <Benefits {...args} />;

export const Default = Template.bind({});

Default.args = {};
