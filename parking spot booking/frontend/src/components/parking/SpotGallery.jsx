import { useMemo, useState } from "react";

const SpotGallery = ({ images = [] }) => {
  const gallery = useMemo(() => images.map((item) => item.image_url), [images]);
  const [active, setActive] = useState(0);

  if (!gallery.length) return null;

  return (
    <div className="space-y-3">
      <img
        src={gallery[active]}
        alt="Parking spot"
        className="h-72 w-full rounded-2xl object-cover sm:h-96"
      />
      <div className="grid grid-cols-4 gap-2">
        {gallery.map((img, idx) => (
          <button
            key={`${img}-${idx + 1}`}
            type="button"
            onClick={() => setActive(idx)}
            className={`overflow-hidden rounded-xl border-2 ${
              idx === active ? "border-brand-600" : "border-transparent"
            }`}
          >
            <img src={img} alt={`Preview ${idx + 1}`} className="h-16 w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpotGallery;
