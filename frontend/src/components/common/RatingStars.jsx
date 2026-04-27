const STAR_COUNT = 5;

const RatingStars = ({
  value = 0,
  reviewCount = 0,
  showValue = false,
  interactive = false,
  onChange,
  size = "sm",
  className = "",
}) => {
  const normalizedValue = Math.max(0, Math.min(5, Number(value || 0)));
  const roundedValue = Math.round(normalizedValue);
  const starSize = size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm";

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <div className="flex items-center gap-1">
        {Array.from({ length: STAR_COUNT }).map((_, index) => {
          const filled = index < roundedValue;
          const baseClass = `${starSize} transition ${filled ? "text-amber-400" : "text-slate-300"}`;

          if (interactive) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => onChange?.(index + 1)}
                className={baseClass}
                aria-label={`Rate ${index + 1} stars`}
              >
                ★
              </button>
            );
          }

          return (
            <span key={index} className={baseClass}>
              ★
            </span>
          );
        })}
      </div>
      {showValue ? <span className="text-sm font-medium text-slate-600">{normalizedValue.toFixed(1)}</span> : null}
      {reviewCount ? <span className="text-xs text-slate-400">({reviewCount})</span> : null}
    </div>
  );
};

export default RatingStars;
