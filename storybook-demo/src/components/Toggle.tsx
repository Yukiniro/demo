import classNames from "classnames";

export interface ToggleProps {
  type?: "success" | "warning" | "info" | "error";
  size?: "small" | "medium" | "large";
  checked?: boolean;
  disabled?: boolean;
}

function calcTypeClass(type: ToggleProps["type"]): string {
  let typeClass = "";
  switch (type) {
    case "success":
      typeClass = "toggle-success";
      break;
    case "warning":
      typeClass = "toggle-warning";
      break;
    case "info":
      typeClass = "toggle-info";
      break;
    case "error":
      typeClass = "toggle-error";
      break;
    default:
      typeClass = "toggle-success";
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
  const { type = "info", size = "medium", disabled = false, checked = false } = props;
  const toggleClasses = classNames("toggle", calcTypeClass(type), calcSizeClass(size));
  return <input type="checkbox" className={toggleClasses} checked={checked} disabled={disabled} />;
}
