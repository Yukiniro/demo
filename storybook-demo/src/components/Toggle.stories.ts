import type { Meta, StoryObj } from "@storybook/react";
// eslint-disable-next-line import/no-named-default
import { default as Toggle } from "./Toggle";

const meta = {
  title: "components/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Type: Story = {
  args: {
    type: "info",
    checked: true,
  },
};

export const Size: Story = {
  args: {
    type: "info",
    checked: true,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    type: "info",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
