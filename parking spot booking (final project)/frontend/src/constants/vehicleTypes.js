export const vehicleTypeOptions = [
  { value: "hatchback", label: "Hatchback" },
  { value: "sedan", label: "Sedan" },
  { value: "muv_suv", label: "MUV/SUV" },
  { value: "convertible", label: "Convertible" },
  { value: "coupe", label: "Coupe" },
  { value: "wagon", label: "Wagon" },
  { value: "jeep", label: "Jeep" },
  { value: "van", label: "Van" },
];

const legacyVehicleTypeAliases = {
  car: "sedan",
  suv: "muv_suv",
  bike: "hatchback",
  ev: "sedan",
  "muv/suv": "muv_suv",
};

const byValue = Object.fromEntries(vehicleTypeOptions.map((item) => [item.value, item.label]));

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s/-]+/g, "_");

export const normalizeVehicleType = (value) => {
  const normalized = normalize(value);
  return legacyVehicleTypeAliases[normalized] || normalized;
};

export const getVehicleTypeLabel = (value) => {
  const key = normalizeVehicleType(value);
  return byValue[key] || String(value || "");
};

export const formatVehicleTypes = (values = []) =>
  (Array.isArray(values) ? values : [])
    .map((value) => getVehicleTypeLabel(value))
    .filter(Boolean)
    .join(", ");
