
export default function AnnouncementStrip({ text }) {
  const cleanText = String(text || '').trim();
  const announcements = cleanText
    ? [cleanText]
    : [
      "Livraison gratuite des 3000 DZD d'achat",
      "Nouvelles collections disponibles",
      "Paiement a la livraison disponible partout en Algerie",
    ];

  // Duplicate for seamless loop
  const tickerItems = [...announcements, ...announcements, ...announcements, ...announcements];

  return (
    <div
      className="announcement-strip w-full overflow-hidden flex items-center select-none relative z-20"
      style={{
        background: '#F9D7DA',
        borderBottom: '1px solid #EBB4BB',
      }}
      aria-label="Annonces"
    >
      <div className="animate-marquee flex items-center" aria-hidden="true">
        {tickerItems.map((text, index) => (
          <div key={index} className="flex items-center flex-none">
            <span
              className="font-serif italic text-[#1C2340] whitespace-nowrap"
              style={{ padding: '0 28px', fontSize: '13px', letterSpacing: '0.04em', lineHeight: 1.35 }}
            >
              {text}
            </span>
            <span
              className="text-[#EBB4BB] font-light select-none"
              style={{ fontSize: '12px' }}
              aria-hidden="true"
            >
              |
            </span>
          </div>
        ))}
      </div>
      {/* Visually hidden for screen readers */}
      <p className="sr-only">{announcements[0]}</p>
    </div>
  );
}
