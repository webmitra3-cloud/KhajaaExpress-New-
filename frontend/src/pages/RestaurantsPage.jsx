import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import LoadingSpinner from "../components/common/LoadingSpinner";
import RestaurantCard from "../components/common/RestaurantCard";

const RestaurantsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const fetchVendors = async (query = "") => {
    setLoading(true);
    try {
      const { data } = await api.get(`/vendors${query ? `?search=${encodeURIComponent(query)}` : ""}`);
      setVendors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearch(query);
    fetchVendors(query);
  }, [searchParams]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();

    if (query) {
      setSearchParams({ search: query });
      return;
    }

    setSearchParams({});
  };

  return (
    <section className="page-section container">
      <div className="page-header">
        <div>
          <h1>Restaurants</h1>
          <p className="muted-text">Browse approved vendors and open each restaurant to see the full menu.</p>
        </div>
      </div>

      <form className="search-row card form-card" onSubmit={handleSearch}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by restaurant name, dish, or location"
        />
        <button type="submit" className="button">
          Search
        </button>
      </form>

      {loading ? (
        <LoadingSpinner label="Loading restaurants..." />
      ) : (
        <div className="grid-3" style={{ marginTop: "1rem" }}>
          {vendors.map((vendor) => (
            <RestaurantCard key={vendor._id} vendor={vendor} />
          ))}
        </div>
      )}
    </section>
  );
};

export default RestaurantsPage;