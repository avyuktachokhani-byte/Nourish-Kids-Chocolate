import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  BARCODE,
  BARCODE_HUMAN,
  BENEFITS,
  COMPOSITION,
  FAQS,
  FEATURES,
  formatNutrient,
  formatValue,
  INGREDIENT_LINES,
  INGREDIENT_NOTES,
  LABEL_TEXT,
  LICENCE,
  MARQUEE,
  NOT_ON_PACK,
  NUTRIENTS,
  PRODUCTS,
  SERVING_LINE,
  TESTIMONIALS,
  nutrient,
  type Product,
} from "@/data";

const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const NAV = [
  { href: "#bar", id: "bar", label: "The bar" },
  { href: "#label", id: "label", label: "The label" },
  { href: "#ingredients", id: "ingredients", label: "Ingredients" },
  { href: "#stories", id: "stories", label: "Stories" },
  { href: "#shop", id: "shop", label: "Shop" },
];

const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const G = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const R = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLLGL", "LGGLGL"];

function eanBits(code: string) {
  const digits = code.split("").map(Number);
  const parity = PARITY[digits[0]] ?? "LLLLLL";
  let bits = "101";
  for (let i = 0; i < 6; i += 1) {
    const d = digits[i + 1] ?? 0;
    bits += parity[i] === "L" ? L[d] : G[d];
  }
  bits += "01010";
  for (let i = 0; i < 6; i += 1) bits += R[digits[i + 7] ?? 0];
  bits += "101";
  return bits;
}

function Barcode({ className = "" }: { className?: string }) {
  const bits = eanBits(BARCODE);
  const moduleW = 1.35;
  const quiet = 10;
  const width = quiet * 2 + bits.length * moduleW;
  const bars: ReactNode[] = [];
  for (let i = 0; i < bits.length; i += 1) {
    if (bits[i] !== "1") continue;
    const guard = i < 3 || (i >= 45 && i < 50) || i >= bits.length - 3;
    bars.push(
      <rect
        key={i}
        x={quiet + i * moduleW}
        y={0}
        width={moduleW}
        height={guard ? 58 : 48}
        fill="#1a1024"
      />,
    );
  }
  return (
    <div className={cn("bg-white px-3 pb-2 pt-3", className)}>
      <svg viewBox={`0 0 ${width} 60`} className="h-14 w-full" role="img" aria-label={`Barcode ${BARCODE_HUMAN}`}>
        {bars}
      </svg>
      <p className="mt-1 text-center font-mono text-[13px] tracking-[0.28em] text-ink">{BARCODE_HUMAN}</p>
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5 rounded-xl">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-plum text-cream shadow-[0_8px_20px_rgba(75,30,134,0.25)]">
        <span className="font-display text-lg leading-none">N</span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-gold bg-cream" />
      </span>
      <span className={cn("leading-tight", compact && "sr-only sm:not-sr-only")}>
        <span className="block font-display text-[1.15rem] tracking-tight text-ink">Nourish</span>
        <span className="block text-[10px] uppercase tracking-[0.22em] text-muted">Kids chocolate</span>
      </span>
    </a>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", shown && "in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Photo({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return <div className={cn("bg-gradient-to-br from-plum to-cocoa", className)} role="img" aria-label={alt} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setOk(false)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}

function PackLabel({ grams, showIngredients = true }: { grams: number; showIngredients?: boolean }) {
  const calculated = grams !== 100;
  const subtitle =
    grams === 100
      ? "(Per 100 g)"
      : grams === 20
        ? "(Per 20 g serving · calculated)"
        : grams === 5
          ? "(Per 5 g · calculated)"
          : `(Per ${grams} g · calculated)`;

  return (
    <article className="label-shadow overflow-hidden rounded-[1.4rem] bg-[#54248c] text-white">
      <div className="px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
        {showIngredients && (
          <>
            <h3 className="font-display text-[1.7rem] font-semibold tracking-wide text-white">INGREDIENTS</h3>
            <div className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-white/95">
              {INGREDIENT_LINES.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="my-5 h-px bg-white/35" />
          </>
        )}
        <h3 className={cn("font-display text-[1.45rem] font-semibold leading-tight tracking-wide sm:text-[1.65rem]", !showIngredients && "text-[1.7rem]")}>
          NUTRITION INFORMATION
        </h3>
        <p className="mt-1 text-center text-sm text-white/85">{subtitle}</p>
        {calculated && (
          <p className="mt-1 text-center text-[11px] uppercase tracking-[0.14em] text-gold-bright">
            Scaled from the printed per 100 g column
          </p>
        )}
        <dl className="mt-4 space-y-1.5 font-mono text-[12px] sm:text-sm">
          {NUTRIENTS.map((row) => (
            <div
              key={row.key}
              className={cn(
                "flex items-baseline gap-2",
                row.emphasize && "-mx-2 rounded-md bg-white/10 px-2 py-0.5",
              )}
            >
              <dt className="shrink-0">{row.label}</dt>
              <span aria-hidden="true" className="mb-[3px] flex-1 border-b border-dotted border-white/55" />
              <dd className="tick shrink-0 tabular-nums" key={`${row.key}-${grams}`}>
                {formatNutrient(row, grams)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-white/80 sm:text-xs">{SERVING_LINE}</p>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-gold-bright/90">
          Sugars rows are tinted on this page so they are easy to find. On the pack they share the type of every other line.
        </p>
      </div>
      <div className="border-t border-white/15 bg-[#431a78] px-5 py-5 text-center sm:px-7">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">As printed on the pack</p>
        <p className="mt-1 font-display text-sm italic text-gold-bright">FSSAI</p>
        <p className="mt-1 font-display text-xl leading-tight tracking-wide text-gold-bright sm:text-2xl">
          Lic. No.
          <span className="mt-1 block break-all">{LICENCE}</span>
        </p>
      </div>
      <Barcode />
    </article>
  );
}

function useFocusTrap(active: boolean, ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';
    const nodes = () =>
      Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
    nodes()[0]?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const list = nodes();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [active, ref]);
}

type CartLine = { id: string; qty: number };

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [active, setActive] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [basis, setBasis] = useState<100 | 20 | 5>(100);
  const [steps, setSteps] = useState(4);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const [copied, setCopied] = useState(false);
  const [ordered, setOrdered] = useState<CartLine[] | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const portionId = useId();

  useFocusTrap(menuOpen, menuRef, () => setMenuOpen(false));
  useFocusTrap(cartOpen, cartRef, () => setCartOpen(false));
  useFocusTrap(labelOpen, labelRef, () => setLabelOpen(false));

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = NAV.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -48% 0px", threshold: [0.1, 0.3, 0.6] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen || cartOpen || labelOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen, cartOpen, labelOpen]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nourish-cart");
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setCart(parsed.filter((line) => PRODUCTS.some((p) => p.id === line.id)));
      }
    } catch {
      /* ignore broken local storage */
    }
    setCartReady(true);
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    localStorage.setItem("nourish-cart", JSON.stringify(cart));
  }, [cart, cartReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const count = cart.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = cart.reduce((sum, line) => {
    const product = PRODUCTS.find((item) => item.id === line.id);
    return sum + (product ? product.price * line.qty : 0);
  }, 0);
  const portionGrams = steps * 5;
  const overlay = menuOpen || cartOpen || labelOpen;

  function add(id: string, qty = 1) {
    setCart((prev) => {
      const found = prev.find((line) => line.id === id);
      if (!found) return [...prev, { id, qty: Math.min(12, qty) }];
      return prev.map((line) => (line.id === id ? { ...line, qty: Math.min(12, line.qty + qty) } : line));
    });
    setToast(id);
    setBump((value) => value + 1);
    setOrdered(null);
  }

  function setQty(id: string, qty: number) {
    setCart((prev) => prev.flatMap((line) => (line.id === id ? (qty <= 0 ? [] : [{ ...line, qty: Math.min(12, qty) }]) : [line])));
  }

  async function copyLabel() {
    try {
      await navigator.clipboard.writeText(LABEL_TEXT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setLabelOpen(true);
    }
  }

  function confirmPreview() {
    setOrdered(cart);
    setCart([]);
  }

  return (
    <div id="top" className="font-sans text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-plum focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <div className="print-sheet hidden print:block">
        <h1 className="text-3xl">Nourish Kids — pack label</h1>
        <p className="mt-2 text-sm">Milk chocolate bar · 40 g · two servings of 20 g. Not a health food.</p>
        <h2 className="mt-6 text-xl">Ingredients</h2>
        {INGREDIENT_LINES.map((line) => (
          <p key={line} className="mt-2 text-sm">{line}</p>
        ))}
        <h2 className="mt-6 text-xl">Nutrition information (per 100 g, as printed)</h2>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {NUTRIENTS.map((row) => (
              <tr key={row.key}>
                <td className="py-0.5">{row.label}</td>
                <td className="py-0.5 text-right">{formatNutrient(row, 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm">{SERVING_LINE}</p>
        <h2 className="mt-6 text-xl">Per 20 g serving (calculated)</h2>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {NUTRIENTS.map((row) => (
              <tr key={row.key}>
                <td className="py-0.5">{row.label}</td>
                <td className="py-0.5 text-right">{formatNutrient(row, 20)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-sm">Contains milk and soy. May contain tree nuts, wheat and barley. Not gluten-free. Not vegan. Not infant food.</p>
        <p className="mt-2 text-sm">FSSAI Lic. No. {LICENCE} · Barcode {BARCODE_HUMAN}</p>
        <p className="mt-4 text-xs">Asterisks appear on the pack beside 23% milk solids and servings per package. No footnote is visible in the pack photograph.</p>
      </div>

      <div className={cn("no-print", overlay && "pointer-events-none")} inert={overlay ? true : undefined}>
        <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden="true">
          <div className="h-full origin-left bg-gold" style={{ transform: `scaleX(${progress})` }} />
        </div>

        <header className="fixed inset-x-0 top-0 z-40">
          <div className="bg-plum-deep text-cream">
            <div className="mx-auto flex max-w-[1180px] items-center justify-center gap-3 px-4 py-2 text-center text-[11px] uppercase tracking-[0.14em] sm:text-xs">
              <span className="lg:hidden">Full panel on this page · 40 g bar</span>
              <span className="hidden lg:inline">Pack panel, published in full · 40 g bar · two 20 g servings · Lic. No. {LICENCE}</span>
              <a href="#label" className="shrink-0 border-b border-gold-bright/70 text-gold-bright">
                Read it
              </a>
            </div>
          </div>
          <div className={cn("transition-all", scrolled ? "border-b border-line/80 bg-cream/85 shadow-[0_10px_30px_rgba(36,16,36,0.04)] backdrop-blur-xl" : "bg-cream/70 backdrop-blur-md")}>
            <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
              <Logo />
              <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
                {NAV.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "text-sm text-ink/80 transition hover:text-ink",
                      active === item.id && "text-plum",
                    )}
                    aria-current={active === item.id ? "true" : undefined}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                <a href="#shop" className="btn-shine hidden rounded-full bg-plum px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_rgba(75,30,134,0.22)] transition hover:-translate-y-0.5 hover:bg-plum-deep sm:inline-flex">
                  Shop the bar
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setOrdered(null);
                    setCartOpen(true);
                  }}
                  className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-paper text-ink transition hover:-translate-y-0.5 hover:border-gold"
                  aria-label={`Open basket, ${count} ${count === 1 ? "item" : "items"}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 7h12l-1 13H7L6 7Z" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M9 7V6a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <span key={bump} className={cn("absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-plum px-1 text-[10px] font-semibold text-white", bump > 0 && "bump")}>
                    {count}
                  </span>
                </button>
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-full border border-line bg-paper lg:hidden"
                  aria-label="Open menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3 5h12M3 9h12M3 13h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main id="main">
          <section className="relative pt-32 sm:pt-36">
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="hero-grid absolute inset-0" />
              <div className="absolute -left-20 top-28 h-72 w-72 rounded-full bg-gold/20 blur-3xl float-slow" />
              <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-plum/15 blur-3xl float-slower" />
            </div>
            <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-6">
              <div className="lg:col-span-6 xl:col-span-7">
                <p className="hero-rise text-xs uppercase tracking-[0.22em] text-honey">Milk chocolate · 40 g · Two 20 g servings</p>
                <h1 className="hero-rise delay-1 mt-4 max-w-xl font-display text-[3.15rem] font-semibold leading-[0.92] tracking-[-0.035em] text-ink sm:text-6xl xl:text-[5.15rem]">
                  Turn the
                  <br />
                  bar <em className="italic text-plum">over.</em>
                </h1>
                <svg className="hero-rise delay-2 mt-4 h-3 w-36 text-honey" viewBox="0 0 140 12" fill="none" aria-hidden="true">
                  <path d="M2 8c28-7 62-7 136-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <p className="hero-rise delay-2 mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-[1.2rem]">
                  Sugar is the first ingredient — 57.0 g in every 100 g. Nourish Kids puts the rest of the pack panel here, at a size you can actually read. A treat. Not a health food.
                </p>
                <div className="hero-rise delay-3 mt-7 flex flex-col gap-3 sm:flex-row">
                  <a href="#shop" className="btn-shine inline-flex items-center justify-center gap-2 rounded-full bg-plum px-6 py-3.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(75,30,134,0.25)] transition hover:-translate-y-0.5 hover:bg-plum-deep">
                    Shop the 40 g bar <Arrow />
                  </a>
                  <a href="#label" className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-6 py-3.5 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-gold">
                    Read the full label
                  </a>
                </div>
                <p className="hero-rise delay-4 mt-5 max-w-xl rounded-2xl border border-cocoa/15 bg-blush/80 px-4 py-3 text-sm leading-relaxed text-cocoa">
                  <strong className="font-semibold">Allergens, as printed:</strong> contains milk and soy. May contain tree nuts, wheat and barley.
                </p>
                <dl className="hero-rise delay-5 mt-6 grid max-w-xl grid-cols-3 gap-3 border-t border-line pt-5">
                  {[
                    ["531", "kcal / 100 g"],
                    ["106.2", "kcal / serving"],
                    ["23%", "milk solids"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <dt className="font-display text-2xl tabular-nums tracking-tight text-ink sm:text-3xl">{value}</dt>
                      <dd className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">{label}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="lg:col-span-6 xl:col-span-5">
                <div className="relative mx-auto w-full max-w-[420px]">
                  <div className="relative aspect-[3/4] min-h-[540px] w-full sm:min-h-0">
                      <div
                        className={cn(
                          "absolute inset-0 overflow-hidden rounded-[1.7rem] bg-plum-ink shadow-[0_30px_70px_rgba(36,16,66,0.28)] ring-1 ring-gold/40 transition duration-700",
                          flipped ? "pointer-events-none scale-[0.97] opacity-0" : "opacity-100",
                        )}
                        inert={flipped ? true : undefined}
                      >
                        <Photo
                          src="/images/portrait.jpg"
                          alt="A square of milk chocolate with a slow glossy drip on a deep purple ground"
                          className="absolute inset-0 h-full w-full object-cover"
                          priority
                        />
                        <div className="absolute left-4 top-4 rounded-full border border-gold-bright/40 bg-plum-ink/55 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold-bright backdrop-blur-md">
                          40 g bar
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-ink via-plum-ink/75 to-transparent p-5 pt-24 text-cream sm:p-6">
                          <p className="font-display text-4xl leading-none">Nourish</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gold-bright">Kids · Milk chocolate</p>
                          <div className="mt-4 flex items-end justify-between gap-3">
                            <p>
                              <span className="block font-display text-3xl tabular-nums">106.2</span>
                              <span className="text-sm text-cream/80">kcal in a 20 g serving</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => setFlipped(true)}
                              className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-sm font-medium text-plum transition hover:-translate-y-0.5"
                              aria-expanded={flipped}
                            >
                              <span className="wobble inline-flex" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M13 8a5 5 0 0 1-8.5 3.5L3 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                  <path d="M3 13V10h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              Turn over
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "absolute inset-0 overflow-auto rounded-[1.7rem] bg-[#54248c] text-white ring-1 ring-gold/40 transition duration-700",
                          flipped ? "opacity-100" : "pointer-events-none scale-[0.97] opacity-0",
                        )}
                        inert={!flipped ? true : undefined}
                      >
                        <div className="flex h-full flex-col p-5 sm:p-6">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gold-bright">Back of the bar</p>
                          <h2 className="mt-2 font-display text-3xl leading-none">The serving, not the column.</h2>
                          <p className="mt-2 text-sm text-white/80">20 g is one fifth of the printed 100 g panel.</p>
                          <div className="mt-4 grid flex-1 grid-cols-2 content-start gap-2.5">
                            {[
                              ["106.2", "kcal"],
                              ["11.4 g", "sugars"],
                              ["9.5 g", "added sugars"],
                              ["5.8 g", "fat"],
                            ].map(([value, label]) => (
                              <div key={label} className="rounded-2xl bg-white/10 p-3">
                                <p className="font-display text-2xl tabular-nums">{value}</p>
                                <p className="text-xs uppercase tracking-[0.12em] text-white/75">{label}</p>
                              </div>
                            ))}
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-white/75">
                            Per 100 g, as printed: 531 kcal · 57.0 g sugars · 47.4 g added sugars.
                          </p>
                          <div className="mt-4 flex gap-2">
                            <button type="button" onClick={() => setFlipped(false)} className="rounded-full border border-white/25 px-4 py-2.5 text-sm">
                              See the face
                            </button>
                            <a href="#label" className="rounded-full bg-cream px-4 py-2.5 text-sm font-medium text-plum">
                              Full panel
                            </a>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="foil-edge" aria-hidden="true" />

          <div className="marquee overflow-hidden border-b border-line bg-paper py-3.5">
            <div className="marquee-track flex w-max">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
                  {MARQUEE.map((item) => (
                    <span key={`${copy}-${item}`} className="flex items-center text-[11px] uppercase tracking-[0.16em] text-ink/75 sm:text-xs">
                      {item}
                      <i className="mx-5 inline-block h-1.5 w-1.5 rotate-45 bg-gold" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <section id="proof" className="scroll-mt-32 px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="proof-title">
            <div className="mx-auto max-w-[1180px]">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.2em] text-honey">01 — Proof, from the panel</p>
                <h2 id="proof-title" className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                  No mascot. No vitamin claim. The panel is the pitch.
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[1.6rem] border border-line bg-line sm:grid-cols-4">
                  {[
                    ["40 g", "The bar, from two printed servings"],
                    ["2", "Servings per package"],
                    ["23%*", "Milk solids, as declared"],
                    ["< 0.1 g", "Trans fat per 100 g"],
                  ].map(([value, label]) => (
                    <div key={label} className="bg-paper px-5 py-7 sm:px-6">
                      <dt className="font-display text-[1.7rem] leading-none tracking-tight text-plum sm:text-5xl">{value}</dt>
                      <dd className="mt-2 text-sm leading-relaxed text-muted">{label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
                  Per-serving and per-step figures on this page are the pack’s per 100 g values, scaled and rounded. They are marked calculated. Nothing here is a daily-value percentage — a child’s day is not a 2,000 kcal adult chart.
                </p>
              </Reveal>
            </div>
          </section>

          <section id="guide" className="scroll-mt-32 bg-paper px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="guide-title">
            <div className="mx-auto max-w-[1180px]">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.2em] text-honey">02 — How to read it</p>
                <h2 id="guide-title" className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                  Four things we will not hide.
                </h2>
              </Reveal>
              <div className="mt-12 grid gap-4 md:grid-cols-2">
                {FEATURES.map((feature, index) => (
                  <Reveal key={feature.n} delay={index * 70}>
                    <article className="group h-full rounded-[1.5rem] border border-line bg-cream p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_18px_40px_rgba(36,16,66,0.06)] sm:p-8">
                      <p className="font-display text-sm italic text-honey">{feature.n}</p>
                      <h3 className="mt-3 font-display text-2xl font-semibold leading-tight">{feature.title}</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-muted">{feature.body}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="bar" className="scroll-mt-32 px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="bar-title">
            <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-12">
              <Reveal className="lg:col-span-6">
                <div className="relative">
                  <div className="overflow-hidden rounded-[1.8rem] shadow-[0_24px_60px_rgba(36,16,66,0.12)]">
                    <Photo
                      src="/images/bar-hero.jpg"
                      alt="Milk chocolate squares broken open on deep purple silk"
                      className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-[1.03] sm:aspect-[5/4]"
                    />
                  </div>
                  <div className="glass absolute -bottom-5 left-4 right-4 rounded-2xl p-4 sm:left-6 sm:right-auto sm:max-w-xs">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-honey">On the tongue</p>
                    <p className="mt-1 font-display text-xl leading-snug">Milk chocolate, vanilla flavour, 23% milk solids.</p>
                  </div>
                </div>
              </Reveal>
              <div className="lg:col-span-6 lg:pl-6">
                <Reveal>
                  <p className="text-xs uppercase tracking-[0.2em] text-honey">03 — The bar</p>
                  <h2 id="bar-title" className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                    Half the bar is one serving.
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-muted">
                    Move the portion. The panel’s per 100 g numbers scale with it. Each step is 5 g — a kitchen measure, not a line we claim is scored into the chocolate.
                  </p>
                </Reveal>
                <Reveal delay={80}>
                  <div className="mt-8 rounded-[1.6rem] border border-line bg-paper p-5 sm:p-6">
                    <div className="flex items-end justify-between gap-3">
                      <label htmlFor={portionId} className="text-sm font-medium">
                        Portion guide
                      </label>
                      <output htmlFor={portionId} className="font-display text-lg tabular-nums text-plum">
                        {portionGrams} g
                      </output>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2.5" role="group" aria-label="Illustrated 5 gram portions">
                      {Array.from({ length: 8 }, (_, index) => {
                        const on = index < steps;
                        return (
                          <button
                            key={index}
                            type="button"
                            aria-pressed={on}
                            aria-label={`${index + 1} of 8 steps, ${on ? "included" : "not included"}`}
                            onClick={() => setSteps(index + 1)}
                            className="square-btn rounded-xl p-1"
                          >
                            <span className={cn("block aspect-square rounded-[0.7rem]", on ? "square-on" : "square-off")} />
                          </button>
                        );
                      })}
                    </div>
                    <input
                      id={portionId}
                      className="mt-5"
                      type="range"
                      min={1}
                      max={8}
                      step={1}
                      value={steps}
                      onChange={(event) => setSteps(Number(event.target.value))}
                      aria-valuetext={`${steps} steps, ${portionGrams} grams`}
                    />
                    <div className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.14em] text-muted">
                      <span>5 g</span>
                      <span className="text-plum">20 g serving</span>
                      <span>40 g bar</span>
                    </div>
                    <p className="sr-only" aria-live="polite">
                      {steps} steps, {portionGrams} grams. Energy {formatNutrient(nutrient("energy"), portionGrams)}. Total sugars {formatNutrient(nutrient("sugars"), portionGrams)}. Added sugars {formatNutrient(nutrient("added"), portionGrams)}.
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
                      {[
                        [formatValue(nutrient("energy"), portionGrams), "kcal"],
                        [formatValue(nutrient("sugars"), portionGrams), "g sugars"],
                        [formatValue(nutrient("added"), portionGrams), "g added"],
                        [formatValue(nutrient("fat"), portionGrams), "g fat"],
                      ].map(([value, label]) => (
                        <div key={label} className="rounded-2xl bg-cream px-3 py-3">
                          <p key={`${label}-${steps}`} className="tick font-display text-2xl tabular-nums text-ink">{value}</p>
                          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      {steps === 4
                        ? "This is one labeled serving — half the bar."
                        : steps === 8
                          ? "This is the whole 40 g bar: two labeled servings."
                          : `A labeled serving is 4 steps (20 g). You are viewing ${steps} ${steps === 1 ? "step" : "steps"}.`}
                      {" "}Protein {formatNutrient(nutrient("protein"), portionGrams)} · Sodium {formatNutrient(nutrient("sodium"), portionGrams)}.
                    </p>
                    <button
                      type="button"
                      onClick={() => add("pocket")}
                      className="btn-shine mt-5 inline-flex items-center gap-2 rounded-full bg-plum px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5"
                    >
                      Add the 40 g bar <Arrow />
                    </button>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <section id="label" className="scroll-mt-32 bg-plum-ink px-4 py-20 text-cream sm:px-6 sm:py-28" aria-labelledby="label-title">
            <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5 lg:sticky lg:top-32">
                <Reveal>
                  <p className="text-xs uppercase tracking-[0.2em] text-gold-bright">04 — The panel</p>
                  <h2 id="label-title" className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                    The label, at the size it deserves.
                  </h2>
                  <p className="mt-5 font-display text-3xl italic leading-tight text-gold-bright sm:text-4xl">
                    More than half of this chocolate, by weight, is sugar.
                  </p>
                  <p className="mt-4 text-lg leading-relaxed text-cream/80">
                    57.0 g of every 100 g. Of that, 47.4 g are added sugars. The card is the pack panel — transcribed, then scaled if you ask it to.
                  </p>
                </Reveal>
                <Reveal delay={80}>
                  <div role="radiogroup" aria-label="Nutrition basis" className="mt-6 inline-flex flex-wrap rounded-full bg-white/10 p-1">
                    {[
                      [100, "Per 100 g"],
                      [20, "Per 20 g"],
                      [5, "Per 5 g"],
                    ].map(([grams, label]) => (
                      <button
                        key={label}
                        type="button"
                        role="radio"
                        aria-checked={basis === grams}
                        onClick={() => setBasis(grams as 100 | 20 | 5)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm transition",
                          basis === grams ? "bg-cream text-plum" : "text-cream/75 hover:text-cream",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </Reveal>
                <Reveal delay={120}>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-cream/60">As printed · 100 g</p>
                      <p className="mt-2 font-display text-4xl tabular-nums">531</p>
                      <p className="text-sm text-cream/70">kcal</p>
                      <p className="mt-3 text-sm text-gold-bright">57.0 g sugars</p>
                      <p className="text-sm text-cream/70">47.4 g added</p>
                    </article>
                    <article className="rounded-2xl border border-gold/50 bg-white/10 p-4">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-gold-bright">Serving · 20 g</p>
                      <p className="mt-2 font-display text-4xl tabular-nums">106.2</p>
                      <p className="text-sm text-cream/70">kcal · calculated</p>
                      <p className="mt-3 text-sm text-gold-bright">11.4 g sugars</p>
                      <p className="text-sm text-cream/70">9.5 g added</p>
                    </article>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setLabelOpen(true)} className="rounded-full bg-cream px-4 py-2.5 text-sm font-medium text-plum">
                      Open the panel
                    </button>
                    <button type="button" onClick={copyLabel} className="rounded-full border border-white/20 px-4 py-2.5 text-sm text-cream">
                      {copied ? "Copied" : "Copy the numbers"}
                    </button>
                    <button type="button" onClick={() => window.print()} className="rounded-full border border-white/20 px-4 py-2.5 text-sm text-cream">
                      Print the label
                    </button>
                  </div>
                </Reveal>
              </div>
              <div className="lg:col-span-7">
                <Reveal>
                  <div className="mx-auto max-w-[460px]">
                    <PackLabel grams={basis} />
                  </div>
                </Reveal>
                <Reveal delay={90}>
                  <div className="mt-8 rounded-[1.5rem] bg-cream p-5 text-ink sm:p-7">
                    <h3 className="font-display text-2xl font-semibold">What 100 g is made of</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      Taken from the printed panel. Saturated fat (19.6 g) sits inside total fat, not on top of it. Added sugars (47.4 g) sit inside total sugars.
                    </p>
                    <div className="relative mt-5 h-5 overflow-hidden rounded-full" aria-hidden="true">
                      <div className="flex h-full">
                        {COMPOSITION.map((part) => (
                          <div key={part.key} style={{ width: `${part.grams}%`, background: part.color }} />
                        ))}
                      </div>
                      <div className="absolute inset-y-0 w-px bg-plum-ink" style={{ left: "47.4%" }} />
                    </div>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-honey">Tick at 47.4 g — added sugars</p>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {COMPOSITION.map((part) => (
                        <li key={part.key} className="flex items-center gap-2 text-sm">
                          <span className="h-3 w-3 rounded-sm" style={{ background: part.color }} />
                          <span>{part.label}</span>
                          <span className="ml-auto tabular-nums text-muted">{part.grams.toFixed(1)} g</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm leading-relaxed text-muted">
                      “Not itemised” is the remainder after carbohydrate, fat and protein — moisture and minerals the panel does not list. It is not a hidden nutrient.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <section id="ingredients" className="scroll-mt-32 px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="ingredients-title">
            <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <div className="overflow-hidden rounded-[1.8rem]">
                  <Photo
                    src="/images/ingredients.jpg"
                    alt="Cocoa nibs, cocoa butter, milk, vanilla pods and sugar crystals on linen"
                    className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
                  />
                </div>
                <div className="mt-4 overflow-hidden rounded-[1.4rem]">
                  <Photo
                    src="/images/cocoa.jpg"
                    alt="A split cocoa pod beside milk chocolate squares and a vanilla bean"
                    className="aspect-[16/9] w-full object-cover"
                  />
                </div>
              </Reveal>
              <div className="lg:col-span-7">
                <Reveal>
                  <p className="text-xs uppercase tracking-[0.2em] text-honey">05 — Ingredients</p>
                  <h2 id="ingredients-title" className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                    Every word on the ingredients block.
                  </h2>
                  <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
                    Transcribed from the pack, then explained only where a number or a name needs a plain-language key.
                  </p>
                </Reveal>
                <ol className="mt-8 divide-y divide-line border-y border-line">
                  {INGREDIENT_NOTES.map((item, index) => (
                    <Reveal key={item.name} delay={index * 40}>
                      <li className="grid gap-2 py-4 sm:grid-cols-[140px_1fr] sm:gap-6">
                        <p className="font-display text-lg text-plum">{item.name}</p>
                        <p className="break-words text-[15px] leading-relaxed text-muted">{item.note}</p>
                      </li>
                    </Reveal>
                  ))}
                </ol>
                <Reveal>
                  <div className="mt-6 rounded-[1.5rem] bg-cocoa px-6 py-7 text-cream sm:px-8">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold-bright">Allergen information</p>
                    <p className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Contains milk and soy.</p>
                    <p className="mt-2 font-display text-2xl leading-tight text-cream/90">May contain tree nuts, wheat and barley.</p>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/80">
                      Not gluten-free. Not nut-free. Not vegan. Not infant food. For young children, offer a small piece and stay with them — chocolate can be a choking hazard.
                    </p>
                  </div>
                </Reveal>
                <Reveal>
                  <div className="mt-6">
                    <h3 className="font-display text-xl">What the photograph does not show</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {NOT_ON_PACK.map((item) => (
                        <li key={item} className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm text-muted">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <div className="relative h-44 sm:h-64" aria-hidden="true">
            <Photo src="/images/macro.jpg" alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-cream via-transparent to-cream" />
          </div>

          <section id="benefits" className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="benefits-title">
            <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-12 lg:items-center">
              <Reveal className="lg:col-span-5">
                <div className="overflow-hidden rounded-[1.8rem]">
                  <Photo
                    src="/images/share.jpg"
                    alt="An adult hand offering a square of milk chocolate to a child's hand"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
              </Reveal>
              <div className="lg:col-span-7">
                <Reveal>
                  <p className="text-xs uppercase tracking-[0.2em] text-honey">06 — Why it is still chocolate</p>
                  <h2 id="benefits-title" className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                    A household reason, not a health reason.
                  </h2>
                </Reveal>
                <div className="mt-8 space-y-6">
                  {BENEFITS.map((item, index) => (
                    <Reveal key={item.n} delay={index * 70}>
                      <article className="grid grid-cols-[auto_1fr] gap-4 border-t border-line pt-6">
                        <span className="font-display text-2xl italic text-honey">{item.n}</span>
                        <div>
                          <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
                          <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.body}</p>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
            <Reveal>
              <blockquote className="mx-auto mt-16 max-w-4xl px-2 text-center">
                <p className="font-display text-3xl font-medium italic leading-tight text-plum sm:text-5xl">
                  “The name is Nourish. The food is chocolate.”
                </p>
                <footer className="mt-4 text-sm uppercase tracking-[0.18em] text-muted">The only claim the name is asked to carry</footer>
              </blockquote>
            </Reveal>
          </section>

          <section id="stories" className="scroll-mt-32 bg-plum-soft/60 px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="stories-title">
            <div className="mx-auto max-w-[1180px]">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.2em] text-honey">07 — Stories</p>
                <h2 id="stories-title" className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                  Notes from the table.
                </h2>
                <p className="mt-4 max-w-xl text-muted">Parents, talking about a label they can use — not a chocolate that pretends to be medicine.</p>
              </Reveal>
              <div className="mt-10 grid gap-4 lg:grid-cols-3">
                {TESTIMONIALS.map((item, index) => (
                  <Reveal key={item.name} delay={index * 80}>
                    <figure className="flex h-full flex-col rounded-[1.5rem] border border-white/70 bg-paper p-6 shadow-[0_16px_40px_rgba(36,16,66,0.05)] transition duration-300 hover:-translate-y-1">
                      <span className="font-display text-5xl leading-none text-plum/25" aria-hidden="true">“</span>
                      <blockquote className="mt-2 flex-1 text-lg leading-relaxed text-ink">{item.quote}</blockquote>
                      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-plum text-sm text-cream">{item.name.slice(0, 1)}</span>
                        <span>
                          <span className="block text-sm font-medium">{item.name}</span>
                          <span className="block text-xs text-muted">{item.place}</span>
                        </span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="shop" className="scroll-mt-32 px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="shop-title">
            <div className="mx-auto max-w-[1180px]">
              <Reveal className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-honey">08 — Shop</p>
                  <h2 id="shop-title" className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                    The same bar. Three ways to keep it.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-cocoa">Contains milk and soy. May contain tree nuts, wheat and barley.</p>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  Prices are illustrative, in rupees. This preview does not take payment or ship anything. Every pack is the bar on this label.
                </p>
              </Reveal>
              <div className="mt-10 grid gap-5 lg:grid-cols-3">
                {PRODUCTS.map((product, index) => (
                  <Reveal key={product.id} delay={index * 80}>
                    <ProductCard
                      product={product}
                      qty={cart.find((line) => line.id === product.id)?.qty ?? 0}
                      onAdd={() => add(product.id)}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="faq" className="scroll-mt-32 bg-paper px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="faq-title">
            <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-12">
              <Reveal className="lg:col-span-4">
                <p className="text-xs uppercase tracking-[0.2em] text-honey">09 — Questions</p>
                <h2 id="faq-title" className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                  Asked before the foil comes off.
                </h2>
                <p className="mt-4 text-muted">If the bar in your hand prints a different panel, trust the bar. This page follows the pack photograph.</p>
              </Reveal>
              <div className="lg:col-span-8">
                {FAQS.map((item, index) => {
                  const open = openFaq === index;
                  const panelId = `faq-panel-${index}`;
                  const buttonId = `faq-button-${index}`;
                  return (
                    <div key={item.q} className="border-b border-line">
                      <h3>
                        <button
                          id={buttonId}
                          type="button"
                          className="flex w-full items-center justify-between gap-4 py-4 text-left"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => setOpenFaq(open ? null : index)}
                        >
                          <span className="font-display text-xl sm:text-2xl">{item.q}</span>
                          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-plum transition", open && "bg-plum text-cream")} aria-hidden="true">
                            {open ? "–" : "+"}
                          </span>
                        </button>
                      </h3>
                      <div id={panelId} role="region" aria-labelledby={buttonId} className={cn("grid transition-[grid-template-rows] duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                        <div className="overflow-hidden">
                          <p className="max-w-2xl pb-5 text-[15px] leading-relaxed text-muted">{item.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="cta-title">
            <Photo src="/images/pour.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-plum-ink/78" />
            <div className="relative mx-auto grid max-w-[1180px] items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-xs uppercase tracking-[0.2em] text-gold-bright">10 — The table</p>
                <h2 id="cta-title" className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-cream sm:text-6xl">
                  Put the label on the table.
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-cream/80">
                  A 40 g bar. Two servings. Sugar listed first, allergens in the open, licence number as printed. If it still belongs in the treat tin, you already know the numbers.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => add("pocket")} className="btn-shine inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-medium text-plum transition hover:-translate-y-0.5">
                    Add the Pocket Bar · ₹89 <Arrow />
                  </button>
                  <a href="#label" className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3.5 text-sm text-cream">
                    Back to the panel
                  </a>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-[1.6rem] ring-1 ring-white/15">
                  <Photo src="/images/stack.jpg" alt="Purple-wrapped chocolate bars stacked on a wooden table" className="aspect-[4/3] w-full object-cover" />
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-line bg-cream px-4 pb-28 pt-14 sm:px-6 md:pb-14">
          <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Logo />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                Nourish Kids is milk chocolate with the panel turned outward. Not infant formula. Not a meal. Not a nutrition supplement.
              </p>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.16em] text-honey">Explore</p>
              <ul className="mt-3 space-y-2 text-sm">
                {NAV.map((item) => (
                  <li key={item.id}>
                    <a href={item.href} className="text-ink/80 hover:text-plum">{item.label}</a>
                  </li>
                ))}
                <li><a href="#faq" className="text-ink/80 hover:text-plum">Questions</a></li>
              </ul>
            </div>
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.16em] text-honey">On the pack</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">FSSAI Lic. No. {LICENCE}</p>
              <p className="text-sm text-muted">Barcode {BARCODE_HUMAN}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink">{INGREDIENT_LINES[2]}</p>
            </div>
            <div className="lg:col-span-3">
              <Barcode className="rounded-xl" />
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-[1180px] border-t border-line pt-6 text-xs leading-relaxed text-muted">
            <p>
              Ingredients, allergens, the per 100 g panel, serving size, licence number and barcode are transcribed from the pack photograph. Calculated portions are marked. Asterisks on 23%* and 2* have no visible footnote. Shop actions are a preview: no payment is taken and no order is placed.
            </p>
            <p className="mt-3">© 2026 Nourish Kids. Built to be read.</p>
          </div>
        </footer>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/92 p-3 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Pocket Bar · 40 g</p>
              <p className="font-display text-2xl leading-none">₹89</p>
            </div>
            <button type="button" onClick={() => add("pocket")} className="rounded-full bg-plum px-5 py-3 text-sm font-medium text-white">
              Add to basket
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="no-print fixed inset-0 z-50 bg-cream" ref={menuRef} role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between px-4 py-4">
            <Logo />
            <button type="button" onClick={() => setMenuOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-line" aria-label="Close menu">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <nav className="px-6 pt-8" aria-label="Mobile">
            {NAV.map((item, index) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-baseline gap-4 border-b border-line py-4"
              >
                <span className="font-display italic text-honey">0{index + 1}</span>
                <span className="font-display text-4xl">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      )}

      {cartOpen && (
        <div className="no-print fixed inset-0 z-50">
          <button type="button" className="absolute inset-0 bg-plum-ink/50 backdrop-blur-sm" aria-label="Close basket" onClick={() => setCartOpen(false)} />
          <div ref={cartRef} role="dialog" aria-modal="true" aria-labelledby="cart-title" className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 id="cart-title" className="font-display text-2xl">{ordered ? "Preview held" : "Your basket"}</h2>
              <button type="button" onClick={() => setCartOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-line" aria-label="Close basket">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 py-5">
              {ordered ? (
                <div>
                  <p className="font-display text-3xl leading-tight">The label stays with the treat.</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    No payment was taken and nothing was stored beyond this browser. A 20 g serving is about 106.2 kcal and 11.4 g sugars.
                  </p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {ordered.map((line) => {
                      const product = PRODUCTS.find((item) => item.id === line.id);
                      if(!product) return null;
                      return (
                        <li key={line.id} className="flex justify-between gap-3 border-b border-line py-2">
                          <span>{product.name} × {line.qty}</span>
                          <span className="tabular-nums">{rupee.format(product.price * line.qty)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : cart.length === 0 ? (
                <div className="pt-8 text-center">
                  <p className="font-display text-3xl">The tin is empty.</p>
                  <p className="mt-2 text-sm text-muted">The Pocket Bar is the one this label describes.</p>
                  <a href="#shop" onClick={() => setCartOpen(false)} className="mt-5 inline-flex rounded-full bg-plum px-5 py-3 text-sm text-white">
                    Browse the shop
                  </a>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cart.map((line) => {
                    const product = PRODUCTS.find((item) => item.id === line.id);
                    if (!product) return null;
                    return (
                      <li key={line.id} className="flex gap-3 border-b border-line pb-4">
                        <Photo src={product.image} alt="" className="h-20 w-16 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted">{product.pieces}</p>
                          <p className="mt-1 text-sm tabular-nums">{rupee.format(product.price)}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-line" aria-label={`Decrease ${product.name}`} onClick={() => setQty(line.id, line.qty - 1)}>–</button>
                            <span className="w-6 text-center tabular-nums">{line.qty}</span>
                            <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-line" aria-label={`Increase ${product.name}`} onClick={() => setQty(line.id, line.qty + 1)}>+</button>
                            <button type="button" className="ml-auto text-xs uppercase tracking-[0.12em] text-muted hover:text-ink" onClick={() => setQty(line.id, 0)}>
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {!ordered && cart.length > 0 && (
              <div className="border-t border-line px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted">Subtotal</span>
                  <span className="font-display text-3xl tabular-nums">{rupee.format(subtotal)}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">Preview checkout. No card details, no delivery, no charge.</p>
                <button type="button" onClick={confirmPreview} className="btn-shine mt-4 w-full rounded-full bg-plum py-3.5 text-sm font-medium text-white">
                  Confirm preview
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {labelOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button type="button" className="absolute inset-0 bg-plum-ink/70 backdrop-blur-sm" aria-label="Close label" onClick={() => setLabelOpen(false)} />
          <div ref={labelRef} role="dialog" aria-modal="true" aria-labelledby="modal-label-title" className="relative max-h-[92svh] w-full max-w-lg overflow-auto rounded-t-[1.5rem] bg-plum-ink p-3 sm:rounded-[1.5rem] sm:p-4">
            <div className="mb-3 flex items-center justify-between px-2 text-cream">
              <h2 id="modal-label-title" className="font-display text-2xl">Pack panel</h2>
              <button type="button" onClick={() => setLabelOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20" aria-label="Close label">
                ×
              </button>
            </div>
            <PackLabel grams={100} />
            <p className="px-2 py-4 text-center text-xs leading-relaxed text-cream/70">
              Shown per 100 g, as printed. A serving is 20 g. {SERVING_LINE}
            </p>
          </div>
        </div>
      )}

      {toast && (
        <div className="no-print pointer-events-none fixed inset-x-0 bottom-24 z-[55] flex justify-center px-4 md:bottom-6" aria-live="polite">
          <div className="toast-in pointer-events-auto glass flex items-center gap-3 rounded-full px-4 py-2.5 text-sm">
            <span>{PRODUCTS.find((item) => item.id === toast)?.name ?? "Bar"} added</span>
            <button
              type="button"
              className="font-medium text-plum"
              onClick={() => {
                setToast(null);
                setOrdered(null);
                setCartOpen(true);
              }}
            >
              View
            </button>
          </div>
        </div>
      )}

      {progress > 0.18 && !overlay && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="no-print fixed bottom-6 right-6 z-30 hidden h-11 w-11 place-items-center rounded-full border border-line bg-paper text-plum shadow-lg md:grid"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}

function ProductCard({ product, qty, onAdd }: { product: Product; qty: number; onAdd: () => void }) {
  return (
    <article className={cn("flex h-full flex-col rounded-[1.7rem] p-3 transition duration-300 hover:-translate-y-1", product.featured ? "bg-plum text-cream shadow-[0_24px_50px_rgba(75,30,134,0.22)] ring-1 ring-gold/40" : "border border-line bg-paper")}>
      <div className="relative overflow-hidden rounded-[1.2rem]">
        <Photo src={product.image} alt={product.alt} className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105" />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-cream px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-plum">
            Start here
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <h3 className="font-display text-2xl">{product.name}</h3>
        <p className={cn("mt-1 text-sm", product.featured ? "text-cream/75" : "text-muted")}>{product.pieces}</p>
        <p className={cn("mt-3 flex-1 text-sm leading-relaxed", product.featured ? "text-cream/85" : "text-muted")}>{product.note}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="font-display text-3xl tabular-nums">{rupee.format(product.price)}</p>
          {product.compare && (
            <p className={cn("text-sm line-through", product.featured ? "text-cream/50" : "text-muted")}>{rupee.format(product.compare)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={cn(
            "btn-shine mt-4 w-full rounded-full py-3 text-sm font-medium transition hover:-translate-y-0.5",
            product.featured ? "bg-cream text-plum" : "bg-plum text-white",
          )}
        >
          Add to basket
        </button>
        {qty > 0 && <p className={cn("mt-2 text-center text-xs", product.featured ? "text-gold-bright" : "text-plum")}>{qty} in basket</p>}
      </div>
    </article>
  );
}
