import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const EditSpace = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Grab the passed space data
  const existingSpace = location.state?.space || {};

  // Form State pre-filled with existing data
  const [name, setName] = useState(existingSpace.name || "");
  const [description, setDescription] = useState(
    existingSpace.description || "",
  );
  const [budgetLimit, setBudgetLimit] = useState(
    existingSpace.budgetLimit || "",
  );
  const [thresholdPercent, setThresholdPercent] = useState(
    existingSpace.thresholdPercent || 80,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.put(`/spaces/${spaceId}`, {
        name,
        description,
        budgetLimit: Number(budgetLimit),
        thresholdPercent: Number(thresholdPercent),
      });
      navigate(`/spaces/${spaceId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update space.");
      setLoading(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (
      window.confirm(
        "Are you ABSOLUTELY sure? This will delete the space, all categories, and all expenses forever.",
      )
    ) {
      try {
        await api.delete(`/spaces/${spaceId}`);
        navigate("/dashboard"); // Kick them back to home after deletion
      } catch (err) {
        setError(err.response?.data?.error || "Failed to delete space.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Edit Space Settings
            </h1>
            <Link
              to={`/spaces/${spaceId}`}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition"
            >
              Cancel
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Space Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Limit (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Threshold (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    className="w-full accent-blue-600"
                    value={thresholdPercent}
                    onChange={(e) => setThresholdPercent(Number(e.target.value))}
                  />
                  <span className="text-gray-700 font-semibold w-12 text-right">
                    {thresholdPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition mb-4"
              >
                {loading ? "Saving..." : "Update Space"}
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-4">
              Once you delete a space, there is no going back. Please be
              certain.
            </p>
            <button
              onClick={handleDeleteSpace}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg transition font-medium text-sm"
            >
              Delete this Space
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditSpace;
