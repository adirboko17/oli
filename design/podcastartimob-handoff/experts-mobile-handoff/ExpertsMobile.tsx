import Link from 'next/link';
import './ExpertsMobile.css';

type Props = {
  articlesCount: number;          // number of articles (e.g. ARTICLES.length from articles.ts)
  podcastHref?: string;
  articlesHref?: string;
  podcastImage?: string;
  articlesImage?: string;
};

// "המומחים מדברים" on mobile: two cards side by side, a dark podcast card and a light articles card.
// Shown only below 768px. On desktop, keep the existing section as is.
export default function ExpertsMobile({
  articlesCount,
  podcastHref = '/podcast',
  articlesHref = '/articles',
  podcastImage = '/assets/podcast-cover.png',
  articlesImage = '/assets/research-2.png',
}: Props) {
  return (
    <div className="oex-grid" dir="rtl">
      <Link href={podcastHref} className="oex-card oex-card--dark">
        <div className="oex-media">
          <img src={podcastImage} alt="היריון בטוח, בהנחיית פרופ' אייל שיינר" />
          <span className="oex-play" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
        </div>
        <div className="oex-text">
          <span className="oex-eyebrow">פודקאסט</span>
          <h3 className="oex-title">"היריון בטוח"</h3>
          <p className="oex-sub">בהנחיית פרופ' אייל שיינר</p>
        </div>
        <span className="oex-cta">להאזנה<span>←</span></span>
      </Link>

      <Link href={articlesHref} className="oex-card oex-card--light">
        <div className="oex-media">
          <img src={articlesImage} alt="ידע מבוסס מחקר" />
        </div>
        <div className="oex-text">
          <span className="oex-eyebrow">מאמרים</span>
          <h3 className="oex-title">ידע מבוסס מחקר</h3>
          <p className="oex-sub">{articlesCount} מאמרים מקצועיים</p>
        </div>
        <span className="oex-cta">לכל המאמרים<span>←</span></span>
      </Link>
    </div>
  );
}
