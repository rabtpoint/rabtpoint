export const fallbackUsers = [
  {
    id: 'demo-london',
    name: 'Aiden Wilson',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    bio: 'Exploring London today.',
    location: { country: 'United Kingdom', state: 'England', district: 'London', latitude: 51.5072, longitude: -0.1276 }
  },
  {
    id: 'demo-delhi',
    name: 'Lucas Martin',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'Local guide and coffee lover.',
    location: { country: 'India', state: 'Delhi', district: 'New Delhi', latitude: 28.6139, longitude: 77.209 }
  }
];

export const fallbackReels = [
  {
    _id: 'reel-uk-1',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/delivery.mp4',
    caption: 'London nights never sleep.',
    country: 'United Kingdom',
    views: 4200,
    likes: 318,
    shares: 92,
    liked: false,
    author: fallbackUsers[0]
  },
  {
    _id: 'reel-in-1',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/delivery.mp4',
    caption: 'Delhi street energy.',
    country: 'India',
    views: 2800,
    likes: 210,
    shares: 55,
    liked: false,
    author: fallbackUsers[1]
  }
];

export const fallbackTrenders = [
  {
    ...fallbackUsers[0],
    totalViews: 4200,
    totalLikes: 318,
    reelCount: 1,
    viralReel: {
      _id: fallbackReels[0]._id,
      videoUrl: fallbackReels[0].videoUrl,
      caption: fallbackReels[0].caption,
      views: fallbackReels[0].views,
      likes: fallbackReels[0].likes,
      shares: fallbackReels[0].shares
    }
  },
  {
    ...fallbackUsers[1],
    totalViews: 2800,
    totalLikes: 210,
    reelCount: 1,
    viralReel: {
      _id: fallbackReels[1]._id,
      videoUrl: fallbackReels[1].videoUrl,
      caption: fallbackReels[1].caption,
      views: fallbackReels[1].views,
      likes: fallbackReels[1].likes,
      shares: fallbackReels[1].shares
    }
  },
  {
    id: 'demo-sophia',
    name: 'Sophia Chen',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    bio: 'Night city walks.',
    location: { country: 'United Kingdom', state: 'England', district: 'London', latitude: 51.5072, longitude: -0.1276 },
    totalViews: 1900,
    totalLikes: 140,
    reelCount: 2,
    viralReel: null
  },
  {
    id: 'demo-daniel',
    name: 'Daniel Brooks',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    bio: 'Food and travel.',
    location: { country: 'United Kingdom', state: 'England', district: 'Manchester', latitude: 53.4808, longitude: -2.2426 },
    totalViews: 1600,
    totalLikes: 120,
    reelCount: 1,
    viralReel: null
  },
  {
    id: 'demo-olivia',
    name: 'Olivia Ross',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    bio: 'Creative reels daily.',
    location: { country: 'United Kingdom', state: 'Scotland', district: 'Edinburgh', latitude: 55.9533, longitude: -3.1883 },
    totalViews: 1300,
    totalLikes: 98,
    reelCount: 1,
    viralReel: null
  }
];

export const fallbackPosts = [
  {
    _id: 'post-1',
    text: 'Exploring the city lights... London never sleeps!',
    place: 'London',
    likes: 128,
    timeAgo: '2h ago',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
    author: fallbackUsers[0]
  },
  {
    _id: 'post-2',
    text: 'Find new friends in your city on RabtPoint.',
    place: 'New Delhi',
    likes: 86,
    timeAgo: '5h ago',
    author: fallbackUsers[1]
  }
];
