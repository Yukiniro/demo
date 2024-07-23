import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface InputFileProps {
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  id?: string;
}

export function InputFile(props: InputFileProps) {
  const { className, label, id, onChange } = props;
  return (
    <div className={`grid w-full max-w-sm items-center gap-1.5 ${className}`}>
      <Label htmlFor="picture">{label}</Label>
      <Input onChange={onChange} id={id} type="file" />
    </div>
  );
}
