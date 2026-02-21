import { useState } from "react";

const ChartTab: React.FC = () => {
  const [selected, setSelected] = useState<"optionOne" | "optionTwo" | "optionThree">("optionOne");

  const getButtonClass = (option: "optionOne" | "optionTwo" | "optionThree") =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  const tabs: { key: "optionOne" | "optionTwo" | "optionThree"; label: string; short: string }[] = [
    { key: "optionOne", label: "Monthly", short: "Mo" },
    { key: "optionTwo", label: "Quarterly", short: "Qr" },
    { key: "optionThree", label: "Annually", short: "Yr" },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setSelected(tab.key)}
          className={`px-2 sm:px-3 py-1.5 font-medium rounded-md text-xs sm:text-sm whitespace-nowrap hover:text-gray-900 dark:hover:text-white transition-colors ${getButtonClass(tab.key)}`}
        >
          {/* Show short label on xs, full label on sm+ */}
          <span className="sm:hidden">{tab.short}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ChartTab;
