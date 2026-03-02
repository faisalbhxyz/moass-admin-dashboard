import styles from "./Preloader.module.css";

export function Preloader() {
  return (
    <div className={styles.overlay} role="status" aria-label="Loading">
      <div className={styles.spinner}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={styles.bar}
            style={{
              transform: `rotate(${i * 30}deg)`,
              opacity: 1 - (i / 12) * 0.88,
            }}
          />
        ))}
      </div>
    </div>
  );
}
