import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = "md", onChange, readOnly = true }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange && onChange(star)}
          className={`focus:outline-none transition-transform ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
        >
          <Star
            className={`${iconSize} ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-100 text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
