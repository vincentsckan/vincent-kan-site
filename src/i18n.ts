// i18n translations
// Central place for all UI text in both languages

export type Lang = 'en' | 'zh';

export const languages = {
  en: 'English',
  zh: '繁體中文',
};

export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Articles',
    'nav.projects': 'Projects',
    'nav.discloser': 'DISCLOSER',
    'nav.forum': 'Forum',
    'nav.about': 'About',
    'nav.language': '🌐 Language',
    
    'home.greeting': 'Davis Kan',
    'home.subtitle': 'Tech Enthusiast • UFO/UAP Researcher • AI Player • Hong Konger',
    'home.cta': 'Explore Articles',
    'home.latest': 'Latest UAP News',
    'home.featured': 'Featured',
    'home.breaking': 'BREAKING',
    'home.more': 'View all →',
    'home.allArticles': 'All Articles',
    
    'blog.title': 'Blog',
    'blog.subtitle': 'UFO/UAP articles, news, and research',
    'blog.page': 'Page',
    'blog.readMore': 'Read more →',
    
    'about.title': 'About',
    'about.bio': 'Tech enthusiast, UFO/UAP researcher, and AI hobbyist based in Hong Kong.',
    'about.interests': 'Interests',
    'about.skills': 'Skills',
    'about.contact': 'Get in touch',
    
    'footer.copyright': '© 2026 Davis Kan. All rights reserved.',
    'footer.privacy': 'Privacy-first analytics • No cookies',
    'footer.pages': 'Pages',
    'footer.topics': 'Topics',
    'footer.uapNews': 'UAP News',
    'footer.cases': 'UFO Cases',
    'footer.research': 'Research',
    'footer.about': 'About Me',
    
    'lang.switch': 'Switch to 中文',
    'lang.current': 'English',
    
    'meta.title': 'Davis Kan — UFO/UAP Research & News',
    'meta.desc': 'Tech enthusiast • UFO/UAP researcher • AI player • Hong Konger',
    'meta.keywords': 'UFO,UAP,Unidentified Flying Object,alien,extraterrestrial,Hong Kong UFO,disclosure',
    
    // Blog content note
    'blog.note': '📝 Blog content is primarily in Chinese (Traditional). English summaries available on request.',
  },
  zh: {
    'nav.home': '首頁',
    'nav.blog': '文章',
    'nav.projects': '項目',
    'nav.discloser': 'DISCLOSER',
    'nav.forum': '論壇',
    'nav.about': '關於',
    'nav.language': '🌐 語言',
    
    'home.greeting': 'Davis Kan',
    'home.subtitle': '科技愛好者 • UFO/UAP 研究者 • AI 玩家 • 香港人',
    'home.cta': '瀏覽文章',
    'home.latest': '最新 UAP 新聞',
    'home.featured': '精選',
    'home.breaking': '🔴 快報',
    'home.more': '查看全部 →',
    'home.allArticles': '全部文章',
    
    'blog.title': '文章',
    'blog.subtitle': 'UFO/UAP 文章、新聞與研究',
    'blog.page': '第',
    'blog.readMore': '閱讀更多 →',
    
    'about.title': '關於',
    'about.bio': '科技愛好者、UFO/UAP 研究者、AI 玩家，現居香港。',
    'about.interests': '興趣',
    'about.skills': '技能',
    'about.contact': '聯絡我',
    
    'footer.copyright': '© 2026 Davis Kan。保留所有權利。',
    'footer.privacy': '私隱優先統計 • 無 Cookies',
    'footer.pages': '頁面',
    'footer.topics': '主題',
    'footer.uapNews': 'UAP 新聞',
    'footer.cases': 'UFO 案例',
    'footer.research': '研究',
    'footer.about': '關於我',
    
    'lang.switch': 'Switch to English',
    'lang.current': '繁體中文',
    
    'meta.title': 'Davis Kan — UFO/UAP 研究與新聞',
    'meta.desc': '科技愛好者 • UFO/UAP 研究者 • AI 玩家 • 香港人',
    'meta.keywords': 'UFO,UAP,不明飛行物體,外星人,香港UFO,飛碟,外星文明,全球UAP披露,宇宙奧秘',
    
    'blog.note': '',
  },
};

export type TranslationKey = keyof typeof ui.en;

export function getLangFromUrl(url: URL): Lang {
  // With base: '/', just check if path starts with /zh
  const pathname = url.pathname;
  if (pathname.startsWith('/zh')) return 'zh';
  return 'en';
}

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return (ui[lang] as Record<string, string>)[key] || (ui.en as Record<string, string>)[key] || key;
  };
}

export function getLocalizedPath(pathname: string, fromLang: Lang, toLang: Lang): string {
  let path = pathname;
  // Remove current lang prefix (with or without leading slash)
  if (fromLang === 'zh') {
    path = path.replace(/^\/zh/, '') || '/';
  }
  // Ensure leading slash
  if (!path.startsWith('/')) path = '/' + path;
  // For default lang (en), no prefix
  if (toLang === 'en') return path;
  return `/${toLang}${path}`;
}
