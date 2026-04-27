import { Link } from "react-router-dom";

const SpaceCard = ({ space }) => {
  const rawPercent =
    space.budgetLimit > 0 ? (space.totalSpent / space.budgetLimit) * 100 : 0;

  const percentUsed = Math.min(rawPercent, 100);

  const isOverThreshold = rawPercent >= (space.thresholdPercent || 80);

  const isOverBudget = rawPercent > 100;

  const progressBarColor = isOverBudget
    ? "bg-red-600"
    : isOverThreshold
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <Link to={`/spaces/${space._id}`} className="block group">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {space.name}
          </h3>

          <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
            {rawPercent.toFixed(0)}% Used
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-6 flex-grow line-clamp-2">
          {space.description || "No description provided."}
        </p>

        <div className="mt-auto">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-600">
              Spent: ₹ {space.totalSpent.toLocaleString()}
            </span>
            <span className="text-gray-900">
              Limit: ₹ {space.budgetLimit.toLocaleString()}
            </span>
          </div>

          {isOverBudget && (
            <p className="text-xs text-red-600 mb-2 font-medium">Over Budget</p>
          )}

          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full ${progressBarColor}`}
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SpaceCard;
