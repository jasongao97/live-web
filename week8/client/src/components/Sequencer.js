import styles from "./Sequencer.module.css";

function Sequencer({ steps, current, onToggle, color }) {
  return (
    <div className={styles.sequence}>
      {steps.map((status, index) => (
        <div
          key={index}
          onClick={() => onToggle(index)}
          style={{
            backgroundColor: status === 1 ? color : "#111",
          }}
          className={`${styles.pad} ${index === current ? styles.active : ""}`}
        >
          <div className={styles.indicator}></div>
        </div>
      ))}
    </div>
  );
}

export default Sequencer;
