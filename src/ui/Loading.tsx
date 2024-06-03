import styles from "./css/Loading.module.css";

const Loading = () => {
  return (
    <div class={`${styles.ldsEllipsis} flex justify-center items-center`} style={{ width: "60px", height: `100%` }}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Loading;
