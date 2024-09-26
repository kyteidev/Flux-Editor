// Sourced from https://loading.io/css/

import styles from "./css/Loading.module.css";

const Loading = () => {
  return (
    <div
      class={`${styles.ldsEllipsis} flex items-center justify-center`}
      style={{ width: "60px", height: `100%` }}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Loading;
