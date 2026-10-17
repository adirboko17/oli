import Link from 'next/link';
import { Article, CATEGORIES, CATEGORY_PRODUCT, relatedArticles } from './articles';
import { ArticleCard } from './ArticleCard';
import './Articles.css';

// Connect this to the site's existing products/cart (name, short description, price, image, product link, add to cart)
export type CalloutProduct = { id: string; name: string; sub: string; priceLabel: string; image: string; href: string };

type Props = {
  article: Article;
  getProduct: (id: string) => CalloutProduct | undefined;
  AddToCart: React.ComponentType<{ productId: string; className?: string }>; // the existing cart button
};

// Single article page: breadcrumbs, centered header, main image, body, product callout, "more in this category"
export default function ArticleView({ article: a, getProduct, AddToCart }: Props) {
  const cat = CATEGORIES[a.category];
  const catHref = `/articles?category=${a.category}`;
  const product = getProduct(a.productId || CATEGORY_PRODUCT[a.category]);
  const related = relatedArticles(a, 8); // desktop shows 3 (CSS), mobile is a carousel of up to 8

  return (
    <main className="oa-page" dir="rtl">
      <article className="oa-container oa-article" data-cms="article" data-cms-id={a.id}>
        <nav className="oa-crumbs oa-article__crumbs">
          <Link href="/">דף הבית</Link><span>/</span>
          <Link href="/articles">מאמרים</Link><span>/</span>
          <Link href={catHref} className="oa-crumbs__current">{cat}</Link>
        </nav>

        <header className="oa-article__head">
          <Link href={catHref} className="oa-eyebrow">{cat}</Link>
          <h1 className="oa-article__title">{a.title}</h1>
          {a.lead && <p className="oa-article__lead">{a.lead}</p>}
          {a.author && (
            <div className="oa-article__meta">
              <span className="oa-article__author">{a.author}</span>
              {a.updated && <span>עודכן: {a.updated}</span>}
            </div>
          )}
        </header>

        {a.image && (
          <div className="oa-article__hero"><img src={a.image} alt={a.title} className={a.image === "/assets/logo-brown.png" ? "is-logo" : undefined} /></div>
        )}

        <div className="oa-prose">
          {a.body?.length ? a.body.map((b, i) => {
            if (b.type === 'heading') return <h2 key={i}>{b.text}</h2>;
            if (b.type === 'paragraph') return <p key={i}>{b.text}</p>;
            return (
              <ul key={i}>
                {b.items.map((it, j) => <li key={j}><strong>{it.term}</strong> {it.text}</li>)}
              </ul>
            );
          }) : <div className="oa-prose__missing">כאן ייכנס גוף המאמר מהאתר הקיים</div>}
        </div>

        {product && (
          <aside className="oa-callout">
            <Link href={product.href} className="oa-callout__img" style={{ backgroundImage: `url("${product.image}")` }} aria-label={product.name} />
            <div className="oa-callout__body">
              <span className="oa-eyebrow oa-eyebrow--sm">מהמאמר אל הטיפוח</span>
              <span className="oa-callout__name">{product.name}</span>
              <span className="oa-callout__note">{a.productNote || product.sub}</span>
              <div className="oa-callout__row">
                <span className="oa-callout__price">{product.priceLabel}</span>
                <AddToCart productId={product.id} className="oa-btn oa-btn--sm" />
              </div>
            </div>
          </aside>
        )}
      </article>

      {related.length > 0 && (
        <section className="oa-related">
          <div className="oa-container oa-related__inner">
            <div className="oa-related__head">
              <h2 className="oa-related__title">עוד ב{cat}</h2>
              <Link href="/articles" className="oa-related__all">לכל המאמרים ←</Link>
            </div>
            <div className="oa-related__grid">
              {related.map(r => <ArticleCard key={r.slug} article={r} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
