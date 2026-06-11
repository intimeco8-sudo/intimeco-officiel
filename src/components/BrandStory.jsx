
const PILLARS = [
  {
    title: 'Artisanat local',
    body: 'Chaque piece est selectionnee avec soin pour refleter le gout et l\'elegance de la femme algerienne.',
  },
  {
    title: 'Qualite premium',
    body: 'Des matieres nobles — dentelle, satin, soie — pour un confort et un galbe incomparables.',
  },
  {
    title: 'Livraison nationale',
    body: 'Paiement a la livraison disponible partout en Algerie. Discret et rapide.',
  },
];

export default function BrandStory() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-screen-xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10" data-reveal="soft">
          <p
            className="font-script text-[#EBB4BB] mb-1"
            style={{ fontSize: '22px' }}
          >
            Notre histoire
          </p>
          <h2
            className="font-serif text-[#1C2340]"
            style={{ fontSize: '22px', letterSpacing: '0.08em', fontWeight: 600 }}
          >
            L&apos;art de la lingerie feminine
          </h2>
          <p
            className="font-sans text-[#9CA3AF] mt-3 mx-auto leading-relaxed"
            style={{ fontSize: '15px', maxWidth: '520px' }}
          >
            Fondee a Blida, Intime &amp; Co est nee de la passion d&apos;une femme algerienne pour la lingerie fine.
            Notre mission : offrir des pieces d&apos;exception qui celebrent la feminite dans toute sa beaute.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center p-6 rounded-lg bg-[#FDE8EC] surface-lift stagger-${i + 1}`}
              data-reveal="soft"
            >
              {/* Decorative number */}
              <span
                className="font-serif text-[#EBB4BB] mb-3"
                style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1 }}
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3
                className="font-serif text-[#1C2340] mb-2"
                style={{ fontSize: '18px', fontWeight: 600 }}
              >
                {p.title}
              </h3>
              <p
                className="font-sans text-[#5A6080] leading-relaxed"
                style={{ fontSize: '14px' }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
