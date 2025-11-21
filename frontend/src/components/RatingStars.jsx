import React, { useState } from "react";
import { Star } from "lucide-react";

export default function RatingStars({ initialRating = 0, onRate }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleRating = (value) => {
    setRating(value);
    if (onRate) onRate(value);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={20}
          className={`cursor-pointer transition
            ${
              (hover || rating) >= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-400"
            }`}
          onMouseEnter={() => setHover(value)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleRating(value)}
        />
      ))}
    </div>
  );
}
