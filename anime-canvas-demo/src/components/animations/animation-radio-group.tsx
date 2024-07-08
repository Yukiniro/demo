import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface AnimationRadioGroupProps {
  list: { value: string; label: string }[];
  onChange: (value: string) => void;
  value: string;
}

export function AnimationRadioGroup(props: AnimationRadioGroupProps) {
  const { list, onChange, value } = props;
  return (
    <RadioGroup onValueChange={onChange} value={value} className="flex justify-center mb-8">
      {list.map(item => {
        const { value, label } = item;
        return (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroupItem value={value} id={value} />
            <Label htmlFor={value}>{label}</Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
