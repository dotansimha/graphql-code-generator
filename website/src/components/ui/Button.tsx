import { FC } from 'react';
import classnames from 'classnames';
import styles from './button.module.css';

export const Button: FC = ({ mobileHide, ...props }) => {
  return (
    <button
      {...props}
      className={classnames({
        [styles.buttonContained]: props.contained,
        [styles.button]: !props.contained,
        [styles.mobileHide]: !!mobileHide,
        [props.className]: true,
      })}
    >
      {props.children}
    </button>
  );
};
