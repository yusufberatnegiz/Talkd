export const TOPICS = {
  mh:     { key: 'mh',     label: 'Mental Health',     hint: 'anxiety, low moods, the weight of it all',  hue: '#9AB39C', n: 24 },
  rel:    { key: 'rel',    label: 'Relationships',      hint: 'partners, family, friends, crushes',        hue: '#E89A8A', n: 31 },
  career: { key: 'career', label: 'Career & Decisions', hint: "jobs, school, choices you're stuck on",     hue: '#B5A8D9', n: 14 },
  night:  { key: 'night',  label: 'Late-Night',         hint: "when you can't sleep and it's a lot",       hue: '#E8B57A', n: 9  },
  advice: { key: 'advice', label: 'General Advice',     hint: 'just need a second opinion',                hue: '#D6C895', n: 18 },
  any:    { key: 'any',    label: 'Anything',           hint: 'pick a stranger, figure it out together',   hue: '#F5EFE5', n: 11 },
} as const;

export type TopicKey = keyof typeof TOPICS;
export type Topic = (typeof TOPICS)[TopicKey];

export function getTopic(key: string): Topic {
  return (TOPICS as Record<string, Topic>)[key] ?? TOPICS.any;
}
