export const LICENCE = "10014022002711";
export const BARCODE = "7622202245589";
export const BARCODE_HUMAN = "7 622202 245589";

export const INGREDIENT_LINES = [
  "Sugar, Milk Solids (23%*), Cocoa Butter, Cocoa Solids, Fractionated Fat, Emulsifiers (442, 476), Flavours (Natural, Nature Identical and Artificial (Vanilla) Flavouring Substances).",
  "Contains Cocoa Butter Equivalent in addition to Cocoa Butter.",
  "Allergen Information: Contains Milk, Soy. May Contain Tree Nuts, Wheat, Barley.",
];

export const SERVING_LINE = "Serving size: 20g; No. of servings per package: 2*";

export type Nutrient = {
  key: string;
  label: string;
  value: number;
  unit: string;
  lessThan?: boolean;
  emphasize?: boolean;
};

export const NUTRIENTS: Nutrient[] = [
  { key: "energy", label: "Energy", value: 531, unit: "kcal" },
  { key: "protein", label: "Protein", value: 7.9, unit: "g" },
  { key: "carb", label: "Carbohydrate", value: 60.4, unit: "g" },
  { key: "sugars", label: "Total Sugars", value: 57.0, unit: "g", emphasize: true },
  { key: "added", label: "Added Sugars", value: 47.4, unit: "g", emphasize: true },
  { key: "fat", label: "Total Fat", value: 29.0, unit: "g" },
  { key: "sat", label: "Saturated Fat", value: 19.6, unit: "g" },
  { key: "trans", label: "Trans Fat", value: 0.1, unit: "g", lessThan: true },
  { key: "chol", label: "Cholesterol", value: 20.7, unit: "mg" },
  { key: "sodium", label: "Sodium", value: 129, unit: "mg" },
];

export function nutrient(key: string): Nutrient {
  const found = NUTRIENTS.find((item) => item.key === key);
  if (!found) throw new Error(`Unknown nutrient: ${key}`);
  return found;
}

export function formatNutrient(n: Nutrient, grams: number): string {
  if (n.lessThan) {
    const scaled = (n.value * grams) / 100;
    const digits = scaled >= 0.1 ? 1 : scaled >= 0.01 ? 2 : 3;
    return `< ${scaled.toFixed(digits)} ${n.unit}`;
  }
  const scaled = (n.value * grams) / 100;
  if (n.unit === "kcal") {
    return `${scaled.toFixed(grams === 100 ? 0 : 1)} ${n.unit}`;
  }
  if (n.unit === "mg" && n.key === "sodium" && grams === 100) {
    return `${scaled.toFixed(0)} ${n.unit}`;
  }
  return `${scaled.toFixed(1)} ${n.unit}`;
}

export function formatValue(n: Nutrient, grams: number): string {
  return formatNutrient(n, grams).replace(` ${n.unit}`, "");
}

export const COMPOSITION = [
  { key: "sugars", label: "Total sugars", grams: 57, color: "#E2B15A" },
  { key: "other-carb", label: "Other carbohydrate", grams: 3.4, color: "#F3D7A8" },
  { key: "fat", label: "Fat", grams: 29, color: "#6A3B24" },
  { key: "protein", label: "Protein", grams: 7.9, color: "#C4896A" },
  { key: "rest", label: "Not itemised", grams: 2.7, color: "#E4D7C6" },
];

export const INGREDIENT_NOTES = [
  {
    name: "Sugar",
    note: "Listed first, so it is the largest ingredient by weight. Added sugars on the panel are 47.4 g per 100 g.",
  },
  {
    name: "Milk solids (23%*)",
    note: "Declared at 23%. The asterisk is printed on the pack; the photograph has no footnote explaining it.",
  },
  {
    name: "Cocoa butter",
    note: "The fat from cocoa. The pack also says cocoa butter equivalent is used in addition to cocoa butter.",
  },
  {
    name: "Cocoa solids",
    note: "The non-fat part of the cocoa. The panel does not print a cocoa percentage.",
  },
  {
    name: "Fractionated fat",
    note: "A fat separated into fractions. The pack does not name the source.",
  },
  {
    name: "Emulsifiers (442, 476)",
    note: "442 is ammonium phosphatides. 476 is polyglycerol polyricinoleate (PGPR). They help chocolate flow and set.",
  },
  {
    name: "Flavours",
    note: "Declared as natural, nature-identical and artificial vanilla flavouring substances.",
  },
];

export const NOT_ON_PACK = [
  "A cocoa percentage",
  "A footnote for the asterisks on 23%* and 2*",
  "Fibre, vitamins or minerals",
  "A manufacturer address",
  "A storage instruction",
  "A green vegetarian mark",
];

export const FEATURES = [
  {
    n: "01",
    title: "The 100 g column is not the serving",
    body: "The pack lists 531 kcal and 57.0 g sugars per 100 g. The bar is 40 g. One serving is 20 g — about 106.2 kcal and 11.4 g sugars, calculated from that column.",
  },
  {
    n: "02",
    title: "Added sugars have their own line",
    body: "Total sugars are 57.0 g per 100 g. Added sugars are 47.4 g. A 20 g serving carries about 9.5 g of added sugar. We do not fold that into “energy”.",
  },
  {
    n: "03",
    title: "Allergens stay in plain sight",
    body: "Contains milk and soy. May contain tree nuts, wheat and barley. The same sentence sits in the hero, the label, the shop and the footer — not under a fold.",
  },
  {
    n: "04",
    title: "Cocoa butter equivalent is named",
    body: "The pack says it contains cocoa butter equivalent in addition to cocoa butter. We repeat that, instead of calling the bar plain cocoa.",
  },
];

export const BENEFITS = [
  {
    n: "01",
    title: "It tastes like milk chocolate",
    body: "Milk solids are declared at 23%*. Vanilla is declared as natural, nature-identical and artificial flavour. This is not dark chocolate, and it is not a yoghurt.",
  },
  {
    n: "02",
    title: "The portion is a number, not a vibe",
    body: "Half the bar is the labeled serving: 20 g. The guide below steps in 5 g increments so a smaller piece still has a figure attached. Those steps are a calculator, not a score line printed on the pack.",
  },
  {
    n: "03",
    title: "The name stops at the label",
    body: "Nourish is not a vitamin, a meal or a growth plan. It is a treat with the panel turned outward. That is the only work we ask the name to do.",
  },
];

export type Product = {
  id: string;
  name: string;
  pieces: string;
  price: number;
  compare?: number;
  note: string;
  featured?: boolean;
  image: string;
  alt: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "pocket",
    name: "The Pocket Bar",
    pieces: "1 × 40 g",
    price: 89,
    note: "The bar this panel belongs to. Two servings of 20 g.",
    featured: true,
    image: "/images/portrait.jpg",
    alt: "A single square of milk chocolate with a glossy drip against deep purple",
  },
  {
    id: "duo",
    name: "Two-Bar Sleeve",
    pieces: "2 × 40 g",
    price: 169,
    compare: 178,
    note: "Two of the same bar. Same panel, twice. About ₹84 a bar.",
    image: "/images/stack.jpg",
    alt: "Three unbranded chocolate bars in matte purple foil with gold edges",
  },
  {
    id: "tin",
    name: "Household Tin",
    pieces: "8 × 40 g",
    price: 599,
    compare: 712,
    note: "Eight bars for a home that portions chocolate. About ₹75 a bar.",
    image: "/images/bar-hero.jpg",
    alt: "Broken milk chocolate squares arranged on deep purple silk",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "I do not need a chocolate to be a vitamin. I need the sugar number where I can see it before the foil hits the floor.",
    name: "Meera K.",
    place: "Bengaluru",
  },
  {
    quote:
      "It tastes like the milk chocolate my son asks for after school. The difference is I can see the 20 gram serving before I say yes.",
    name: "Arjun R.",
    place: "Pune",
  },
  {
    quote:
      "The allergen line is the same size as the story. Milk, soy, and a may-contain for nuts, wheat and barley. That is the version I can use.",
    name: "Sara D.",
    place: "Kochi",
  },
];

export const FAQS = [
  {
    q: "Is Nourish a health food?",
    a: "No. It is milk chocolate. Sugar is the first ingredient. Per 100 g the pack lists 57.0 g total sugars and 47.4 g added sugars. We publish that before we talk about taste. It is not a meal, a vitamin or infant food.",
  },
  {
    q: "Why do the calories look different in two places?",
    a: "The nutrition table is printed per 100 g: 531 kcal. The serving size underneath is 20 g, and there are 2 servings in the package, so the bar is 40 g. A serving is one fifth of the 100 g column — about 106.2 kcal. The whole bar is about 212.4 kcal. Calculated figures are marked as calculated.",
  },
  {
    q: "What do the asterisks mean?",
    a: "The pack prints 23%* beside milk solids and 2* beside servings per package. The photograph does not include a footnote for either asterisk, so we do not invent one.",
  },
  {
    q: "What is cocoa butter equivalent?",
    a: "The pack states it contains cocoa butter equivalent in addition to cocoa butter. That means a permitted vegetable fat is used alongside cocoa butter. The pack does not name which fat, and neither do we.",
  },
  {
    q: "What are emulsifiers 442 and 476?",
    a: "442 is ammonium phosphatides. 476 is polyglycerol polyricinoleate, often called PGPR. Both are declared on the pack. They help chocolate flow when it is made and set when it cools.",
  },
  {
    q: "Who should avoid this bar?",
    a: "Anyone with an allergy or intolerance to milk, soy, tree nuts, wheat or barley. The pack says it contains milk and soy, and may contain tree nuts, wheat and barley. It is not gluten-free, not nut-free and not vegan. It is not suitable for infants. For young children, chocolate is also a choking hazard — an adult should portion it and stay nearby.",
  },
  {
    q: "Is the trans fat zero?",
    a: "The pack prints trans fat as less than 0.1 g per 100 g. That is a less-than figure, not a printed zero. Scaled to a 20 g serving it is less than 0.02 g.",
  },
  {
    q: "Are there vitamins, fibre or a cocoa percentage?",
    a: "Not on this panel. We do not add figures the pack does not print, and we do not dress the bar up as a fortified food.",
  },
  {
    q: "What is the licence number?",
    a: "The pack prints FSSAI Lic. No. 10014022002711, and the barcode 7 622202 245589. We reproduce both as printed. This page is not the licensing authority, and it does not display an official seal.",
  },
  {
    q: "How should a portion be counted?",
    a: "Use the 20 g serving as the pack’s own measure — half of the 40 g bar. The slider on this page steps in 5 g increments so smaller portions still have a number. Those steps are a measuring aid. The pack photograph does not show a scored front.",
  },
];

export const MARQUEE = [
  "Sugar listed first",
  "57.0 g sugars / 100 g",
  "47.4 g added sugars",
  "23% milk solids",
  "20 g serving",
  "2 servings per bar",
  "Trans fat < 0.1 g",
  "Contains milk & soy",
  "May contain tree nuts, wheat, barley",
  "Cocoa butter equivalent declared",
  `FSSAI Lic. No. ${LICENCE}`,
];

export const LABEL_TEXT = `Nourish Kids — pack panel
Ingredients: ${INGREDIENT_LINES.join(" ")}

Nutrition information per 100 g
${NUTRIENTS.map((n) => `${n.label}: ${formatNutrient(n, 100)}`).join("\n")}

${SERVING_LINE}

Per 20 g serving (calculated from the per 100 g column)
${NUTRIENTS.map((n) => `${n.label}: ${formatNutrient(n, 20)}`).join("\n")}

Allergens: Contains milk, soy. May contain tree nuts, wheat, barley.
FSSAI Lic. No. ${LICENCE}
Barcode ${BARCODE_HUMAN}`;
