import { Switch } from "@douyinfe/semi-ui";

interface LabelSwitchProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

function LabelSwitch(props: LabelSwitchProps) {
  const { label, checked, disabled, onChange } = props;
  return (
    <div className="flex justify-between items-center px-4 py-2">
      <span>{label}</span>
      <Switch checked={checked} disabled={disabled} onChange={onChange}></Switch>
    </div>
  );
}

export default LabelSwitch;
