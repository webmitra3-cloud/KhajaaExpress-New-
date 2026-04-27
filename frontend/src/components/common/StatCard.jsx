const StatCard = ({ label, value, helper }) => (
  <div className="card stat-card modern-stat-card">
    <div className="stat-card-head">
      <p className="stat-label">{label}</p>
      <span className="stat-accent-dot" />
    </div>
    <h3 className="stat-value">{value}</h3>
    {helper ? <p className="stat-helper">{helper}</p> : null}
  </div>
);

export default StatCard;