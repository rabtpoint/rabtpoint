export const SITE = 'https://rabtpoint.com';

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Download', href: '/download' },
  { label: 'Career', href: '/career' },
  { label: 'Login', href: '/login' },
  { label: 'Admin', href: '/admin' }
];

export const publicPagesMeta = {
  '/': {
    eyebrow: 'Home',
    title: 'RabtPoint - Social Location App',
    description:
      'RabtPoint is a social location app for finding people by country, state and district, sharing posts, chatting with users, and exploring verified locations on maps.',
    cta: 'Login / Open App',
    ctaHref: '/login',
    intro:
      'RabtPoint ek social location network hai jahaan aap apne ilaaqe ke logon se connect hote ho. Posts share karo, direct chat karo, OSM map aur 3D globe par verified users ki permanent location dekho, aur country, state ya district ke hisaab se naye log dhoondho — sab kuch ek hi simple app me.',
    sections: [
      {
        h: 'Location-based posts',
        p: 'Apne shahar aur ilaaqe ki posts ek hi feed me dekho. Har post ke saath pata chalta hai ki kaun aur kahaan se share kar raha hai, jisse aap apne aas-paas ki community se aasani se jud jate ho.'
      },
      {
        h: 'Real-time direct chat',
        p: 'Kisi bhi user se seedhe chat box me baat karo. Messages turant deliver hote hain taaki aap dosto, padosiyon ya naye logon se bina rukawat connect kar sako.'
      },
      {
        h: 'OSM map aur 3D globe',
        p: 'Do map modes diye gaye hain — OpenStreetMap (2D) aur ek interactive 3D globe. Map par har verified user ki wahi permanent location dikhti hai jo unhone account banate waqt set ki thi. Kisi bhi marker par click karke us user ki profile khol sakte ho.'
      },
      {
        h: 'Smart people search',
        p: 'Naam, country, state ya district daal kar log dhoondho. Chahe aapko apne hi district ke log chahiye ya kisi doosre desh ke, search results turant saamne aate hain.'
      },
      {
        h: 'Secure, verified accounts',
        p: 'Har account email OTP verification ke baad banta hai. Profile photo, bio aur location ke saath aapki identity bharosemand rehti hai aur community safe rehti hai.'
      }
    ],
    faqs: [
      {
        q: 'RabtPoint kya hai?',
        a: 'RabtPoint ek social location network hai jahaan aap posts share kar sakte ho, users se chat kar sakte ho, aur map par logon ki location dekh kar unse connect ho sakte ho.'
      },
      {
        q: 'Kya RabtPoint free hai?',
        a: 'Haan, RabtPoint ka web app free me use kar sakte ho. Sirf ek account banao aur turant shuru ho jao.'
      },
      {
        q: 'Meri location kaise set hoti hai?',
        a: 'Account banate waqt aap apna country, state aur district set karte ho, aur permission dene par latitude aur longitude apne aap save ho jaate hain. Yahi location map par dikhti hai.'
      }
    ]
  },
  '/download': {
    eyebrow: 'Download',
    title: 'Download RabtPoint App',
    description:
      'Download or install RabtPoint as a web app on your phone. Use posts, chat, search and map features from any modern mobile or desktop browser.',
    cta: 'Use Web App',
    ctaHref: '/login',
    intro:
      'RabtPoint pura responsive web app ke roop me banaya gaya hai, isliye aapko abhi kisi app store ka intezaar nahi karna padta. Bas browser me kholo, account banao aur posts, chat, map aur search ka istemaal karo — mobile aur desktop dono par.',
    sections: [
      {
        h: 'Web app turant istemaal karo',
        p: 'Kisi bhi modern browser (Chrome, Safari, Edge, Firefox) me rabtpoint.com kholo aur login karo. Koi download ya install zaroori nahi — saari features web par hi chalti hain.'
      },
      {
        h: 'Phone par install jaisa experience',
        p: 'Mobile browser me "Add to Home Screen" / "Install app" option choose karke RabtPoint ko ek icon ki tarah home screen par laga sakte ho. Phir wo ek normal app ki tarah full screen me khulta hai.'
      },
      {
        h: 'Android aur iOS apps',
        p: 'Native Android aur iOS apps par kaam chal raha hai. Jaise hi wo store par live honge, unke official download links isi page par publish kar diye jayenge.'
      },
      {
        h: 'System requirements',
        p: 'RabtPoint ke liye sirf internet connection aur ek updated browser chahiye. Map aur 3D globe behtar dikhne ke liye thoda hardware acceleration support helpful hota hai.'
      }
    ],
    faqs: [
      {
        q: 'Kya RabtPoint app Play Store par hai?',
        a: 'Abhi RabtPoint web app ke roop me available hai. Android aur iOS apps tayyar hone par unke links isi download page par diye jayenge.'
      },
      {
        q: 'Kya web app mobile par achhe se chalta hai?',
        a: 'Haan, RabtPoint pura responsive hai aur mobile, tablet aur desktop par smoothly chalta hai.'
      }
    ]
  },
  '/career': {
    eyebrow: 'Career',
    title: 'RabtPoint Careers',
    description:
      'Explore RabtPoint career opportunities in engineering, design, product, community and operations for a location-based social networking platform.',
    cta: 'Join RabtPoint',
    ctaHref: 'mailto:careers@rabtpoint.com',
    intro:
      'RabtPoint ek chhoti, focused team se shuru hua hai jo log, location aur real conversations ko jodna chahti hai. Hum aise builders dhoondte hain jo product ki quality, privacy aur community ki parwah karte hain.',
    sections: [
      {
        h: 'Engineering',
        p: 'MERN stack (MongoDB, Express, React, Node.js), maps (OpenStreetMap, 3D globe) aur real-time systems par kaam. Aap clean, modular code likhna pasand karte ho to yahaan aapke liye kaafi kuch hai.'
      },
      {
        h: 'Design aur product',
        p: 'Simple, fast aur sundar experiences design karna — mobile aur desktop dono ke liye. UX, accessibility aur dark/light themes par dhyan dene wale logon ka swagat hai.'
      },
      {
        h: 'Community aur operations',
        p: 'Users ko support dena, community ko safe rakhna aur platform ko har region ke liye behtar banana. Achhi communication aur problem-solving skills wale log yahaan zaroori hain.'
      },
      {
        h: 'Kaise apply kare',
        p: 'Apna intro aur kaam (portfolio, GitHub ya resume) careers@rabtpoint.com par bhejo. Bata do aap kis role me interested ho aur RabtPoint me kya banana chahte ho.'
      }
    ],
    faqs: [
      {
        q: 'Kya remote roles available hain?',
        a: 'Haan, zyadatar roles ke liye hum remote-friendly hain. Apne application me apni location aur availability zaroor mention karo.'
      },
      {
        q: 'Career page par roles kab update honge?',
        a: 'Naye open roles isi page par publish kiye jayenge. Aap kabhi bhi careers@rabtpoint.com par direct bhi apply kar sakte ho.'
      }
    ]
  },
  '/admin': {
    eyebrow: 'Admin',
    title: 'RabtPoint Admin Access',
    description:
      'RabtPoint admin access is reserved for authorized team members who manage users, content, reports and platform safety.',
    cta: 'Go to Login',
    ctaHref: '/login',
    intro:
      'Ye admin section sirf RabtPoint ke authorized team members ke liye hai. Yahaan se platform ke users, posts aur reports ko manage kiya jata hai taaki community safe aur healthy rahe.',
    sections: [
      {
        h: 'Admin kya manage karta hai',
        p: 'Admins users, posts aur reported content par nazar rakhte hain, aur policy ke khilaaf jaane wale content par action lete hain. Ye sab ek secure dashboard ke through hota hai.'
      },
      {
        h: 'Kaun access kar sakta hai',
        p: 'Sirf authorized accounts ko hi admin access milta hai. Aam users ke liye ye area available nahi hota aur access strictly limited rakha jata hai.'
      },
      {
        h: 'Security',
        p: 'Admin login secure authentication ke saath hota hai. Galat ya unauthorized access ke khilaaf platform protected hai, aur sensitive operations ke logs rakhe jaate hain.'
      }
    ],
    faqs: [
      {
        q: 'Main admin kaise banu?',
        a: 'Admin access sirf RabtPoint team dwara authorized accounts ko diya jata hai. Aam users ko ye access nahi milta.'
      },
      {
        q: 'Admin login kahaan hota hai?',
        a: 'Authorized members standard login page se sign in karte hain, jiske baad unhe admin dashboard ka access milta hai.'
      }
    ]
  }
};

export const loginMeta = {
  title: 'Login to RabtPoint',
  description:
    'Login to RabtPoint or create a new account with email OTP verification to use posts, chat, map and people search features.',
  intro:
    'RabtPoint me sign in karo ya naya account banao. Signup ke time email OTP verify hota hai, phir aap apna country, state, district aur location set karke posts, chat, map aur search ka istemaal kar sakte ho.'
};

export const canonicalFor = (path) => (path === '/' ? `${SITE}/` : `${SITE}${path}`);
