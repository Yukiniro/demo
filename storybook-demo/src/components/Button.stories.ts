import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Type: Story = {
  args: {
    type: "primary",
    label: "Button",
  },
};

export const Label: Story = {
  args: {
    label: "Custom Content",
  },
};

export const Size: Story = {
  args: {
    size: "medium",
    label: "Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Button",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    label: "Button",
  },
};
