import classNames from 'classnames';
import React from 'react';
import './index.css';

interface ButtonProps {
  /**
   * 按钮类型
   * @default primary
   */
  type?: 'primary' | 'secondary';

  /**
   * 按钮大小
   * @default medium
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * 按钮文本
   */
  label?: string;

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;

  /**
   * 是否加载中
   * @default false
   */
  loading?: boolean;

  /**
   * 点击事件
   */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

function calcTypeClass(type: ButtonProps['type']): string {
  let typeClass = '';
  switch (type) {
    case 'primary':
      typeClass = 'btn-primary';
      break;
    case 'secondary':
      typeClass = 'btn-secondary';
      break;
  }

  return typeClass;
}

function calcSizeClass(size: ButtonProps['size']): string {
  let sizeClass = '';
  switch (size) {
    case 'small':
      sizeClass = 'btn-sm';
      break;
    case 'large':
      sizeClass = 'btn-lg';
      break;
  }

  return sizeClass;
}

/**
 * 通用按钮组件
 */
export default function Button({
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  ...props
}: ButtonProps): JSX.Element {
  const { label, onClick } = props;
  const btnClasses = classNames(
    'btn',
    calcTypeClass(type),
    calcSizeClass(size),
    {
      'btn-disabled': disabled,
      'btn-loading': loading,
    },
  );
  return (
    // eslint-disable-next-line react/button-has-type
    <button onClick={onClick} className={btnClasses}>
      {loading && <span>Loading...</span>}
      {!loading && label && <span>{label}</span>}
    </button>
  );
}
