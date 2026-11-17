import Link from 'next/link';
import { articleHref } from '@/lib/article-paths';
import { FramedPhoto } from './FramedPhoto';
import { ARTICLES, CATEGORIES, CATEGORY_TINT, articleNumber, type Article } from './articles';
import './Articles.css';

type Shot = { image?: string; imageX?: number; imageY?: number; imageScale?: number };

// "Latest articles" marquee: the first 10 articles, duplicated for a seamless loop. Pauses on hover.
export function LatestMarquee({ count = 10, media = {}, articles = ARTICLES }: { count?: number; media?: Record<string, Shot>; articles?: Article[] }) {
  const latest = articles.slice(0, count).map((article) => {
    const shot = media[article.slug];
    return shot?.image ? { ...article, image: shot.image, imageX: shot.imageX, imageY: shot.imageY, imageScale: shot.imageScale } : article;
  });
  const items = [...latest, ...latest];
  return (
    <div className="oa-marquee">
      <span className="oa-eyebrow oa-marquee__label">מאמרים אחרונים</span>
      <div className="oa-marquee__viewport">
        <div className="oa-marquee__track">
          {items.map((a, i) => (
            <Link key={i} href={articleHref(a.slug)} className="oa-pill" dir="rtl" aria-hidden={i >= latest.length || undefined} tabIndex={i >= latest.length ? -1 : undefined}>
              <MarqueeThumb article={a} />
              <span className="oa-pill__text">
                <span className="oa-pill__cat">{CATEGORIES[a.category]}</span>
                <span className="oa-pill__title">{a.title}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarqueeThumb({ article }: { article: Article }) {
  if (!article.image) {
    return <span className="oa-pill__thumb oa-pill__thumb--num" style={{ background: CATEGORY_TINT[article.category] }}>{articleNumber(article)}</span>;
  }
  if (article.image === "/assets/logo-brown.png") {
    return <span className="oa-pill__thumb is-logo" style={{ backgroundImage: `url("${article.image}")` }} />;
  }
  return (
    <span className="oa-pill__thumb">
      <FramedPhoto src={article.image} alt="" x={article.imageX} y={article.imageY} scale={article.imageScale} />
    </span>
  );
}
