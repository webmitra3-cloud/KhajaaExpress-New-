import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <section className="page-section container">
    <div className="card empty-state">
      <h1>Page not found</h1>
      <p className="muted-text">The page you requested does not exist.</p>
      <Link to="/" className="button inline-button">
        Back to Home
      </Link>
    </div>
  </section>
);

export default NotFoundPage;
