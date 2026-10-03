const BRANDS = [
  "Milagros", "Neauvia", "Mie Umi", "ScooBeauty", "Deyn", "Illumia Face", "Masace", "BMJ Physiotherapy",
  "SuperFood", "Kimaya", "EGA Wellness", "Cotton Spring", "Lenicc", "Fuchsia", "Pinnacle Automotive",
  "Oligio", "Dental 1728", "Kotty", "Oye-Oye", "Pangena", "BetterLife", "Parentcraft", "Angel Eye",
  "Ascend Eye Clinic", "One Wellness", "Eu Yan Sang", "Keris Merah", "Parkway", "Stemcell First", "Aero",
];

/**
 * The one marquee on the site: client names as type. It answers "who has
 * he worked with?" in a glance, without pretending to be a logo wall.
 * Pure CSS animation; stops under reduced motion.
 */
export function BrandMarquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {BRANDS.map((b) => (
        <li key={b} className="flex items-center">
          <span className="display whitespace-nowrap px-6 text-[clamp(1.6rem,3.4vw,2.8rem)] text-on-cobalt">{b}</span>
          <span className="h-3 w-3 rotate-45 bg-orange" aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Brands I have designed for" className="relative -rotate-2 scale-[1.04] bg-cobalt py-5">
      <div className="flex overflow-hidden">
        <div className="marquee-track flex">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
