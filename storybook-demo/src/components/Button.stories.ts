import type { Meta, StoryObj } from "@storybook/react";
import Button from "../../../components/src/components/Button";
import "../index.css";

const meta = {
  title: "组件/Button",
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
    label: "Button",
  },
};

export const Label: Story = {
  args: {
    label: "Button",
  },
};

export const Size: Story = {
  args: {
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
