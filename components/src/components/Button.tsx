import classNames from "classnames";

export type ButtonProps = {
  type?: "primary" | "secondary" | "ghost" | "default";
  size?: "small" | "medium" | "large";
  label: string;
  onClick?: () => void;
};

function calcTypeClass(type: ButtonProps["type"]): string {
  let typeClass = "";
  switch (type) {
    case "primary":
      typeClass = "btn-primary";
      break;
    case "secondary":
      typeClass = "btn-secondary";
      break;
    case "ghost":
      typeClass = "btn-ghost";
      break;
  }

  return typeClass;
}

function calcSizeClass(size: ButtonProps["size"]): string {
  let sizeClass = "";
  switch (size) {
    case "small":
      sizeClass = "btn-sm";
      break;
    case "large":
      sizeClass = "btn-lg";
      break;
  }

  return sizeClass;
}

export default function Button(props: ButtonProps) {
  const { type = "primary", size = "medium", label, onClick = () => {} } = props;
  const btnClasses = classNames("btn", calcTypeClass(type), calcSizeClass(size));
  return (
    <button onClick={onClick} className={btnClasses}>
      {label}
    </button>
  );
}
