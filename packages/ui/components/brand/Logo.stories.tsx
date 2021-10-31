import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Logo, Props } from './Logo';

const meta: Meta = {
  title: 'Wordmark',
  component: Logo,
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

const Template: Story<Props> = args => <Logo {...args} />;

export const Default = Template.bind({});

Default.args = {};
