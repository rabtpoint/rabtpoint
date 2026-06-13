export const trendingStories = ['Trending in London', 'Delhi creators', 'Dubai food walk', 'Mumbai meetups', 'Global friends'];
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
