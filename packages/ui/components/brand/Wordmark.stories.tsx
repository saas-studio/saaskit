import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Wordmark, Props } from './Wordmark';

const meta: Meta = {
  title: 'Wordmark',
  component: Wordmark,
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

const Template: Story<Props> = args => <Wordmark {...args} />;

export const Default = Template.bind({});

Default.args = {};
