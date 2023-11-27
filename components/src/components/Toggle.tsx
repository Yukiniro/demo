import classNames from "classnames";

export interface ToggleProps {
  type?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  toggle?: boolean;
  disabled?: boolean;
}

function calcTypeClass(type: ToggleProps["type"]): string {
  let typeClass = "";
  switch (type) {
    case "primary":
      typeClass = "toggle-primary";
      break;
    case "secondary":
      typeClass = "toggle-secondary";
      break;
    default:
      typeClass = "toggle-primary";
      break;
  }

  return typeClass;
}

function calcSizeClass(size: ToggleProps["size"]): string {
  let sizeClass = "";
  switch (size) {
    case "small":
      sizeClass = "toggle-sm";
      break;
    case "large":
      sizeClass = "toggle-lg";
      break;
    default:
      sizeClass = "toggle-md";
      break;
  }

  return sizeClass;
}

export default function Toggle(props: ToggleProps): JSX.Element {
  const { type = "primary", size = "medium", disabled = false, toggle = false } = props;
  const toggleClasses = classNames("toggle", calcTypeClass(type), calcSizeClass(size));
  return <input type="checkbox" className={toggleClasses} checked={toggle} disabled={disabled} />;
}
