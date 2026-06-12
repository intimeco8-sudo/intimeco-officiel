import { ArrowRight, Gem, HeartHandshake, MapPinned, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import storyImage from '../assets/notre-histoire-boutique.png';

const PILLARS = [
  {
    title: 'Artisanat local',
    body: 'Chaque piece est choisie avec attention pour refleter le gout, la pudeur et l elegance de la femme algerienne.',
    icon: MapPinned,
  },
  {
    title: 'Qualite premium',
    body: 'Dentelle, satin et matieres douces sont privilegies pour un confort delicat, beau a porter au quotidien.',
    icon: Gem,
  },
  {
    title: 'Livraison nationale',
    body: 'Paiement a la livraison disponible partout en Algerie. Discret et rapide.',
    icon: Truck,
  },
];

const VALUES = [
  { label: 'Selection feminine', value: 'Pieces choisies pour leur coupe, leur douceur et leur tenue.' },
  { label: 'Conseil humain', value: 'Une approche attentive pour trouver la taille, la couleur et le style justes.' },
  { label: 'Discretion', value: 'Une commande simple, respectueuse et pensee pour votre tranquillite.' },
];

const TIMELINE = [
  { year: '01', title: 'Une idee nee a Draa El Mizan', body: 'Creer une boutique a Draa El Mizan, situee a Tizi Ouzou, ou la lingerie fine reste accessible, elegante et proche des femmes d ici.' },
  { year: '02', title: 'Une selection plus exigeante', body: 'Chaque arrivee est observee, comparee et retenue pour sa matiere, sa coupe et sa finition.' },
  { year: '03', title: 'Une boutique plus proche', body: 'La boutique en ligne prolonge l experience: voir, choisir, commander, puis recevoir partout en Algerie.' },
];

export default function BrandStory() {
  return (
    <main className="brand-story-page">
      <section className="brand-story-hero px-4">
        <div className="max-w-screen-xl mx-auto brand-story-hero__grid">
          <div className="brand-story-hero__copy" data-reveal="left">
            <p className="font-script text-[#EBB4BB]" style={{ fontSize: '28px' }}>
              Notre histoire
            </p>
            <h1 className="font-serif text-[#1C2340] leading-tight mt-2">
              Une lingerie choisie avec douceur, exigence et presence
            </h1>
            <p className="font-sans text-[#5A6080] leading-relaxed mt-5" style={{ fontSize: '16px', maxWidth: '620px' }}>
              Intime &amp; Co est nee a Draa El Mizan, situee a Tizi Ouzou, d une envie simple: proposer des pieces feminines, confortables et raffinees,
              avec une experience aussi soignee que la selection.
            </p>
            <div className="brand-story-actions">
              <a href="/#catalog" className="brand-story-primary">
                Voir les pieces
                <ArrowRight size={16} strokeWidth={1.8} />
              </a>
              <a href="/boutique-contact" className="brand-story-secondary">
                Nous contacter
              </a>
            </div>
          </div>

          <div className="brand-story-visual" data-reveal="right">
            <img src={storyImage} alt="Facade de la boutique Intime & Co" />
            <div className="brand-story-visual__note">
              <Sparkles size={18} strokeWidth={1.8} />
              <span>Selection delicate depuis Draa El Mizan, Tizi Ouzou</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="max-w-screen-xl mx-auto brand-story-values">
          {VALUES.map((item, index) => (
            <div className={`brand-story-value stagger-${index + 1}`} key={item.label} data-reveal="soft">
              <HeartHandshake size={20} strokeWidth={1.8} />
              <h2 className="font-serif text-[#1C2340]">{item.label}</h2>
              <p className="font-sans text-[#5A6080]">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-12 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <div className="brand-story-section-title" data-reveal="soft">
            <p className="font-script text-[#EBB4BB]">Ce qui nous guide</p>
            <h2 className="font-serif text-[#1C2340]">Le detail avant tout</h2>
          </div>

          <div className="brand-story-pillars">
            {PILLARS.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <article className={`brand-story-pillar stagger-${index + 1}`} key={pillar.title} data-reveal="soft">
                  <div className="brand-story-pillar__icon">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <span className="font-serif" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="font-serif text-[#1C2340]">{pillar.title}</h3>
                  <p className="font-sans text-[#5A6080]">{pillar.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="max-w-screen-xl mx-auto brand-story-timeline">
          <div className="brand-story-section-title brand-story-section-title--left" data-reveal="left">
            <p className="font-script text-[#EBB4BB]">Notre chemin</p>
            <h2 className="font-serif text-[#1C2340]">Une boutique qui grandit avec ses clientes</h2>
          </div>

          <div className="brand-story-steps">
            {TIMELINE.map((item, index) => (
              <article className={`brand-story-step stagger-${index + 1}`} key={item.title} data-reveal="right">
                <strong className="font-serif">{item.year}</strong>
                <div>
                  <h3 className="font-serif text-[#1C2340]">{item.title}</h3>
                  <p className="font-sans text-[#5A6080]">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="max-w-screen-xl mx-auto brand-story-cta" data-reveal="soft">
          <ShieldCheck size={24} strokeWidth={1.8} />
          <h2 className="font-serif text-[#1C2340]">Des pieces choisies pour vous accompagner avec confiance</h2>
          <a href="/#nouveautes" className="brand-story-primary">
            Decouvrir les nouveautes
            <ArrowRight size={16} strokeWidth={1.8} />
          </a>
        </div>
      </section>
    </main>
  );
}
