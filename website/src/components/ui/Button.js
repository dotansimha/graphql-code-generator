import styles from './button.module.css';
import React from 'react';
import classnames from 'classnames';

export const Button = props => {
  return <button {...props} className={classnames(props.contained ? styles.buttonContained : styles.button, props.mobileHide ? styles.mobileHide : '', props.className)}>{props.children}</button>;
};
