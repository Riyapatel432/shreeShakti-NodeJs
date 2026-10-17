exports.calculateQty = (categoryName, dimensions) => {
  const { od = 0, id = 0, l = 0, w = 0, thk = 0, nos = 1 } = dimensions || {};
  const cat = (categoryName || "").trim().toLowerCase();
  const count = Number(nos) > 0 ? Number(nos) : 1;

  if (cat.includes("tube") || cat.includes("pipe")) {
    return (Number(l) * count) / 1000;
  }
  if (cat.includes("plate") || cat.includes("sheet")) {
    return (Number(l) * Number(w) * Number(thk) * 7.85 * count) / 1000000;
  }
  if (cat.includes("round bar") || cat.includes("shaft")) {
    return (Number(od) * Number(od) * 0.006165 * Number(l) * count) / 1000;
  }
  if (cat.includes("ring") || cat.includes("flange")) {
    return (((Number(od) * Number(od)) - (Number(id) * Number(id))) * 0.006165 * Number(thk) * count) / 1000;
  }

  // Fallback dimension-based inferences
  if (Number(od) > 0 && Number(id) > 0 && Number(thk) > 0) {
    return (((Number(od) * Number(od)) - (Number(id) * Number(id))) * 0.006165 * Number(thk) * count) / 1000;
  }
  if (Number(l) > 0 && Number(w) > 0 && Number(thk) > 0) {
    return (Number(l) * Number(w) * Number(thk) * 7.85 * count) / 1000000;
  }
  if (Number(od) > 0 && Number(l) > 0) {
    return (Number(od) * Number(od) * 0.006165 * Number(l) * count) / 1000;
  }
  if (Number(od) > 0 && Number(id) > 0 && Number(l) > 0) {
    return (((Number(od) * Number(od)) - (Number(id) * Number(id))) * 0.006165 * Number(l) * count) / 1000;
  }
  if (Number(l) > 0) {
    return (Number(l) * count) / 1000;
  }

  return 0;
};
