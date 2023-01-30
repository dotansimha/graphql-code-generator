import { ReactElement } from 'react';
import styles from './loading.module.css';

export function Loading({ color, height }): ReactElement {
  return (
    <div
      className={styles.loadingContainer}
      style={{
        color,
        height,
      }}
    >
      <div>Loading...</div>
    </div>
  );
}
