import styles from './button.module.css';
import React from 'react';
import classnames from 'classnames';

export const Button = ({ mobileHide, ...props}) => {
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
