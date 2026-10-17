// Oli's podcasts: one source for the home page section and the menu
export type Podcast = {
  id: string;
  title: string;          // name shown in the menu and on the cards
  host: string;           // host line in the menu
  desc: string;           // description on desktop (home page)
  mobileSub: string;      // short line on the mobile card
  cover: string;
  href: string;           // internal page or Spotify
  external?: boolean;
};

export const PODCASTS: Podcast[] = [
  {
    id: 'safe-pregnancy',
    title: 'היריון בטוח',
    host: "בהנחיית פרופ' אייל שיינר",
    desc: "בהנחיית פרופ' אייל שיינר, מומחה במיילדות וגניקולוגיה, מנהל מחלקת נשים ויולדות ב' בביה\"ח סורוקה.",
    mobileSub: "בהנחיית פרופ' אייל שיינר",
    cover: '/assets/podcast-cover.png',
    href: '/podcast',
  },
  {
    id: 'free-to-birth',
    title: 'חופשיה ללדת',
    host: 'בהנחיית זיוה כחלון',
    desc: 'בהנחיית זיוה כחלון, מיילדת מוסמכת. כל הכלים, הידע והביטחון ללדת בדרך הטבע.',
    mobileSub: 'לידה טבעית עם זיוה כחלון',
    cover: 'https://i.scdn.co/image/ab6765630000ba8a6d08ad7681f239e7c18f701d',
    href: 'https://open.spotify.com/show/5UMP2LgDAo7n9ih5fvSYEz',
    external: true, // if an internal page is built, change to '/podcast/free-to-birth' and remove external
  },
];
