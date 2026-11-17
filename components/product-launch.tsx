import Link from "next/link";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLElement> & { href: string; comingSoon?: boolean };

/** Upcoming products have no anchor, URL or keyboard navigation target. */
export function ProductLink({ comingSoon, href, className = "", children, ...props }: Props) {
  if (comingSoon) {
    return <div {...props} className={`product-coming-soon ${className}`} aria-disabled="true">{children}</div>;
  }
  return <Link {...props} href={href} className={className}>{children}</Link>;
}

export function ComingSoonMark() {
  return (
    <span className="coming-soon-mark" dir="rtl">
      <span className="coming-soon-mark__eyebrow" lang="en">COMING SOON</span>
      <span className="coming-soon-mark__title">בקרוב</span>
      <span className="coming-soon-mark__line" />
    </span>
  );
}
