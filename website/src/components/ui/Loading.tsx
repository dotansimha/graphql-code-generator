import { FC } from 'react';
import styles from './loading.module.css';

export const Loading: FC = ({ color, height }) => {
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
};
