import Link from 'next/link';
import { Article, CATEGORIES, CATEGORY_TINT, articleNumber } from './articles';
import './Articles.css';

// With an image: photo card with the title below it. Without an image: a tinted card with the title inside.
export function ArticleCard({ article }: { article: Article }) {
  const href = `/articles/${article.slug}`;
  const cat = CATEGORIES[article.category];

  if (article.image) {
    return (
      <Link href={href} className="oa-card-photo">
        <div className="oa-card-photo__img">
          <img src={article.image} alt={article.title} loading="lazy" />
        </div>
        <span className="oa-cat">{cat}</span>
        <h3 className="oa-card-photo__title">{article.title}</h3>
      </Link>
    );
  }

  return (
    <Link href={href} className="oa-card-text" style={{ background: CATEGORY_TINT[article.category] }}>
      <span className="oa-cat">{cat}</span>
      <h3 className="oa-card-text__title">{article.title}</h3>
      <span className="oa-card-text__foot">
        <span>לקריאה ←</span>
        <span className="oa-card-text__num">{articleNumber(article)}</span>
      </span>
    </Link>
  );
}
