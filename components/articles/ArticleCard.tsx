import Link from 'next/link';
import { articlePublicPath } from '@/lib/article-paths';
import { FramedPhoto } from './FramedPhoto';
import { Article, CATEGORIES, CATEGORY_TINT, articleNumber, authorNames } from './articles';
import './Articles.css';

// With an image: photo card with the title below it. Without an image: a tinted card with the title inside.
export function ArticleCard({ article }: { article: Article }) {
  const href = articlePublicPath(article.slug);
  const cat = CATEGORIES[article.category];
  const author = authorNames(article.author);

  if (article.image) {
    return (
      <Link href={href} className="oa-card-photo">
        <div className="oa-card-photo__img">
          <FramedPhoto src={article.image} alt={article.title} x={article.imageX} y={article.imageY} scale={article.imageScale} logo={article.image === "/assets/logo-brown.png"} />
        </div>
        <span className="oa-cat">{cat}</span>
        <h3 className="oa-card-photo__title">{article.title}</h3>
        {author ? <span className="oa-card__author">{author}</span> : null}
      </Link>
    );
  }

  return (
    <Link href={href} className="oa-card-text" style={{ background: CATEGORY_TINT[article.category] }}>
      <span className="oa-cat">{cat}</span>
      <h3 className="oa-card-text__title">{article.title}</h3>
      {author ? <span className="oa-card__author">{author}</span> : null}
      <span className="oa-card-text__foot">
        <span>לקריאה ←</span>
        <span className="oa-card-text__num">{articleNumber(article)}</span>
      </span>
    </Link>
  );
}
