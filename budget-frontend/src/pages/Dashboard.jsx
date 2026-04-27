import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import SpaceCard from "../components/SpaceCard";

const Dashboard = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const fetchSpaces = async () => {
    try {
      setError("");
      const { data } = await api.get("/spaces");
      setSpaces(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load spaces. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  // 🔵 Totals
  const totalGlobalBudget = spaces.reduce(
    (acc, space) => acc + space.budgetLimit,
    0,
  );
  const totalGlobalSpent = spaces.reduce(
    (acc, space) => acc + space.totalSpent,
    0,
  );

  const query = searchQuery.toLowerCase();

  const filteredSpaces = spaces.filter(
    (space) =>
      space.name.toLowerCase().includes(query) ||
      (space.description && space.description.toLowerCase().includes(query)),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Overview */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-1">
              Total Spaces
            </p>
            <p className="text-3xl font-bold text-gray-800">{spaces.length}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-1">
              Total Budget
            </p>
            <p className="text-3xl font-bold text-gray-800">
              ₹ {totalGlobalBudget.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium mb-1">
              Total Spent
            </p>
            <p className="text-3xl font-bold text-blue-600">
              ₹ {totalGlobalSpent.toLocaleString()}
            </p>
          </div>
        </section>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Spaces</h2>

          <div className="flex w-full sm:w-auto gap-4">
            <input
              type="text"
              placeholder="Search spaces..."
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Link
              to="/spaces/new"
              className="whitespace-nowrap px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              + New Space
            </Link>
          </div>
        </div>

        {/* States */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading your spaces...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : filteredSpaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No spaces found.</p>
            {searchQuery === "" && (
              <Link
                to="/spaces/new"
                className="text-blue-600 font-medium hover:underline"
              >
                Create your first budget space
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <SpaceCard key={space._id} space={space} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
