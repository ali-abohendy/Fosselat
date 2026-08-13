import './QuranVerse.css';

export default function QuranVerse() {
  return (
    <section className="quran-verse">
      <div className="container">
        <p className="quran-verse-arabic">
          كِتَابٌ فُصِّلَتْ آيَاتُهُ قُرْآنًا عَرَبِيًّا لِّقَوْمٍ يَعْلَمُونَ
        </p>
        <div className="quran-verse-divider"></div>
        <p className="quran-verse-translation">
          A Book whose verses are detailed – a Qur'an in Arabic for a people who know.
        </p>
        <p className="quran-verse-reference">
          (<span>Surah Fussilat: 3</span>)
        </p>
      </div>
    </section>
  );
}
