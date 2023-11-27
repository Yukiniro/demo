import React from "react";
import classNames from "classnames";
import "./index.css";

export interface ButtonProps {
  type?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

function calcTypeClass(type: ButtonProps["type"]): string {
  let typeClass = "";
  switch (type) {
    case "primary":
      typeClass = "btn-primary";
      break;
    case "secondary":
      typeClass = "btn-secondary";
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

export default function Button(props: ButtonProps): JSX.Element {
  const { type = "primary", size = "medium", label = "", disabled, loading, onClick = () => {} } = props;
  const btnClasses = classNames("btn", calcTypeClass(type), calcSizeClass(size), {
    "btn-disabled": disabled,
    "btn-loading": loading,
  });
  return (
    // eslint-disable-next-line react/button-has-type
    <button onClick={onClick} className={btnClasses}>
      {loading && <span>Loading...</span>}
      {!loading && label && <span>{label}</span>}
    </button>
  );
}
