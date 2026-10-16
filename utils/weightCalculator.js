exports.calculateQty = (categoryName, dimensions) => {
  const { od = 0, id = 0, l = 0, w = 0, thk = 0, nos = 1 } = dimensions || {};
  const cat = (categoryName || "").trim().toLowerCase();
  
  switch (cat) {
    case "tube":
    case "pipe":
      return (l * nos) / 1000;
    case "plate":
    case "sheet":
      return (l * w * thk * 7.85 * nos) / 1000000;
    case "round bar":
    case "shaft":
      return (od * od * 0.006165 * l * nos) / 1000;
    case "ring":
    case "flange":
      return (((od * od) - (id * id)) * 0.006165 * thk * nos) / 1000;
    default:
      return 0; // Or fallback to a generic weight if available
  }
};
