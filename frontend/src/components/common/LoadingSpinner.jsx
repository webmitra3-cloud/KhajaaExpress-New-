const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="loading-state">
    <div className="spinner" />
    <p>{label}</p>
  </div>
);

export default LoadingSpinner;
