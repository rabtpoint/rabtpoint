export const LEGAL_VERSION = '2026-06-13';

const sharedSections = (title) => [
  {
    h: 'Introduction',
    p: `${title} RabtPoint (rabtpoint.com) ke liye apply hoti hai. RabtPoint ek social location network hai jahan users posts share karte hain, chat karte hain, aur map par verified locations explore karte hain.`
  },
  {
    h: 'Who we are',
    p: 'RabtPoint ek location-based social platform hai. Contact: support@rabtpoint.com. Legal notices aur privacy requests isi email par bheje ja sakte hain.'
  },
  {
    h: 'Eligibility',
    p: 'Aapko RabtPoint use karne ke liye kam se kam 13 saal (ya aapke desh ke minimum digital consent age) ka hona chahiye. Agar aap minor hain to parental/guardian consent required ho sakta hai. Aap accurate information provide karne ke liye responsible hain.'
  },
  {
    h: 'Account security',
    p: 'Aap apne email, password aur OTP verification ke liye responsible hain. Kisi ko apna OTP ya password share na karein. Suspicious login par hum email alert bhej sakte hain. Aap active sessions dekh kar logout kar sakte hain.'
  }
];

export const legalPagesMeta = {
  '/terms': {
    eyebrow: 'Legal',
    title: 'Terms and Conditions',
    description: 'RabtPoint Terms and Conditions — rules for using our social location network, accounts, content, safety, and liability.',
    cta: 'Create account',
    ctaHref: '/login',
    intro: 'Ye Terms and Conditions RabtPoint use karne ke rules batati hain. Account banane se pehle inhe carefully padhein aur accept karein.',
    sections: [
      ...sharedSections('Ye Terms and Conditions'),
      {
        h: 'Acceptance',
        p: 'RabtPoint access ya use karke aap in Terms, Privacy Policy aur Cookie Policy se agree karte hain. Agar agree nahi hain to service use na karein.'
      },
      {
        h: 'Your account',
        p: 'Har user ek verified email OTP ke through account banata hai. Aap first name, last name, country, state, district, city aur GPS-based location provide karte hain. Fake location, impersonation, ya misleading profile allowed nahi hai.'
      },
      {
        h: 'Location services',
        p: 'Signup par location permission required hai taaki aapka verified map location set ho sake. Aap privacy settings se control kar sakte hain ki exact location, district-only, ya hidden location dikhaye. Location data community discovery aur map features ke liye use hoti hai.'
      },
      {
        h: 'Acceptable use',
        p: 'Aap agree karte hain ke aap: harassment, hate speech, threats, spam, illegal content, sexual exploitation, violence promotion, ya kisi ko harm karne wala content post nahi karenge; kisi ki privacy violate nahi karenge; bots/scripts se platform abuse nahi karenge; doosre users ke data scrape nahi karenge.'
      },
      {
        h: 'User content',
        p: 'Posts, messages, photos aur profile content aapka responsibility hai. Aap RabtPoint ko content host, display aur moderate karne ka limited license dete hain taaki service chal sake. Hum reported content review kar sakte hain aur policy violations par action le sakte hain.'
      },
      {
        h: 'Blocking and reporting',
        p: 'Users doosre users ko block ya report kar sakte hain. Hum reports review karke account restrictions, content removal, ya permanent ban kar sakte hain.'
      },
      {
        h: 'Intellectual property',
        p: 'RabtPoint brand, UI, code aur design RabtPoint ke owners ki property hai. Bina permission ke copy, reverse engineer, ya commercial reuse allowed nahi hai.'
      },
      {
        h: 'Third-party services',
        p: 'Hum email delivery (Resend), image hosting (Cloudinary), maps (OpenStreetMap), aur hosting providers use karte hain. Un services ki apni policies apply ho sakti hain.'
      },
      {
        h: 'Service availability',
        p: 'Hum uninterrupted service guarantee nahi karte. Maintenance, updates, bugs, network issues, ya force majeure ki wajah se downtime ho sakta hai.'
      },
      {
        h: 'Disclaimer',
        p: 'RabtPoint "as is" provide hota hai. Hum users ke beech interactions, offline meetings, ya user-generated content ki accuracy ke liye fully responsible nahi hain. Real-world meetups par apni safety khud ensure karein.'
      },
      {
        h: 'Limitation of liability',
        p: 'Law ke maximum allowed extent tak RabtPoint indirect, incidental, special, consequential, ya punitive damages ke liye liable nahi hoga.'
      },
      {
        h: 'Termination',
        p: 'Hum policy violations, abuse, legal requirements, ya security reasons par account suspend ya delete kar sakte hain. Aap Settings se apna account delete kar sakte hain.'
      },
      {
        h: 'Changes',
        p: 'Hum Terms update kar sakte hain. Major changes par naya version publish hoga. Continued use updated Terms ki acceptance maani jayegi.'
      },
      {
        h: 'Governing law',
        p: 'Ye Terms applicable local laws ke according interpret honge jahan RabtPoint operate karta hai, unless mandatory consumer protections otherwise require karein.'
      }
    ],
    faqs: [
      {
        q: 'Kya main RabtPoint bina location ke use kar sakta hoon?',
        a: 'Signup ke liye location permission required hai. Login ke baad aap privacy settings se location visibility control kar sakte hain.'
      },
      {
        q: 'Agar main Terms break karun to kya hoga?',
        a: 'Hum warning, temporary lock, content removal, ya permanent ban kar sakte hain depending on violation severity.'
      }
    ]
  },
  '/privacy': {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    description: 'RabtPoint Privacy Policy — what data we collect, how we use location, email, sessions, and your rights.',
    cta: 'Create account',
    ctaHref: '/login',
    intro: 'Ye Privacy Policy batati hai ke RabtPoint aapka data kaise collect, use, store aur protect karta hai.',
    sections: [
      ...sharedSections('Ye Privacy Policy'),
      {
        h: 'Data we collect',
        p: 'Account data: first name, last name, email, password (hashed), username, bio, profile photo. Location data: country, state, district, city, latitude, longitude (GPS permission se). Security data: login sessions, IP address, browser/device info, OTP records, failed login attempts. Usage data: posts, messages, reports, blocks. Consent records: Terms, Privacy, Cookies acceptance date and version.'
      },
      {
        h: 'How we use data',
        p: 'Data use hota hai: account create/login ke liye; OTP email verification; map aur search features; nearby/community discovery; chat aur posts; fraud/abuse prevention; login alerts; admin moderation; legal compliance.'
      },
      {
        h: 'Location privacy',
        p: 'GPS coordinates signup par set hote hain. Aap choose kar sakte hain: exact location, district-only (coordinates hidden), ya hidden location. Doosre users sirf wahi dekhte hain jo aap allow karte hain.'
      },
      {
        h: 'Legal basis',
        p: 'Hum data process karte hain: contract performance (service provide karna), legitimate interests (security, abuse prevention), consent (notifications, optional permissions), aur legal obligations ke liye.'
      },
      {
        h: 'Data sharing',
        p: 'Hum aapka personal data sell nahi karte. Service providers jaise email, cloud storage, aur hosting limited access ke saath use hote hain. Law enforcement requests valid legal process par respond ho sakte hain.'
      },
      {
        h: 'Data retention',
        p: 'Account data tab tak rakha jata hai jab tak account active hai. Deleted accounts ke data reasonable time ke baad remove ho jata hai, except jahan law retention require kare.'
      },
      {
        h: 'Security measures',
        p: 'Password hashing, JWT sessions, refresh tokens, OTP rate limits, account lockouts, login alerts, authenticated uploads, block/report tools, aur audit logs use kiye jate hain.'
      },
      {
        h: 'Your rights',
        p: 'Aap access, export, correction, deletion, privacy controls, session logout, block/report, aur email change (OTP verified) request kar sakte hain. Contact: support@rabtpoint.com.'
      },
      {
        h: 'Children',
        p: 'RabtPoint intentionally children se unnecessary personal data collect nahi karta. Agar aapko lagta hai minor ne bina consent account banaya hai to hume contact karein.'
      },
      {
        h: 'International users',
        p: 'RabtPoint worldwide users ko support karta hai. Data aapke selected region/hosting provider ke according process ho sakta hai.'
      },
      {
        h: 'Updates',
        p: 'Privacy Policy update ho sakti hai. Naya version website par publish hogi aur consent version record ki jayegi jab required ho.'
      }
    ],
    faqs: [
      {
        q: 'Kya mera exact ghar ka address public hota hai?',
        a: 'Nahi. Hum full home address collect nahi karte. Sirf administrative location fields aur GPS coordinates store hote hain, aur aap privacy se control kar sakte hain.'
      },
      {
        q: 'Kya main apna data download kar sakta hoon?',
        a: 'Haan. Settings se account export JSON download kar sakte hain.'
      }
    ]
  },
  '/cookies': {
    eyebrow: 'Legal',
    title: 'Cookie Policy',
    description: 'RabtPoint Cookie Policy — localStorage, session tokens, theme preferences, and browser storage.',
    cta: 'Create account',
    ctaHref: '/login',
    intro: 'Ye Cookie Policy explain karti hai ke RabtPoint browser storage aur similar technologies kaise use karta hai.',
    sections: [
      ...sharedSections('Ye Cookie Policy'),
      {
        h: 'What are cookies?',
        p: 'Cookies aur local storage chhote data files hain jo browser me save hoti hain taaki website aapko recognize kare, session maintain kare, aur preferences yaad rakhe.'
      },
      {
        h: 'What we store',
        p: 'Authentication token (rabtpoint_token), refresh token (rabtpoint_refresh_token), user session summary (rabtpoint_user), theme preference (rabtpoint_theme). Ye essential storage login aur app functionality ke liye hai.'
      },
      {
        h: 'Strictly necessary',
        p: 'Session tokens security aur logged-in experience ke liye required hain. Inke bina aap authenticated features use nahi kar paoge.'
      },
      {
        h: 'Functional storage',
        p: 'Theme preference (dark/light) functional storage hai jo UI experience improve karti hai.'
      },
      {
        h: 'Analytics',
        p: 'Currently RabtPoint third-party advertising cookies use nahi karta. Future analytics add hone par is policy ko update kiya jayega.'
      },
      {
        h: 'Managing cookies',
        p: 'Aap browser settings se cookies/local storage clear kar sakte hain. Clear karne par logout ho jaoge aur preferences reset ho sakti hain.'
      },
      {
        h: 'Consent',
        p: 'Signup par aap Cookie Policy accept karte hain. Essential cookies/service storage ke bina platform operate nahi kar sakta.'
      },
      {
        h: 'Updates',
        p: 'Cookie Policy update ho sakti hai jab naye storage technologies add hon.'
      }
    ],
    faqs: [
      {
        q: 'Kya RabtPoint tracking ads ke liye cookies use karta hai?',
        a: 'Abhi nahi. Sirf essential auth/session aur theme storage use hoti hai.'
      }
    ]
  }
};
