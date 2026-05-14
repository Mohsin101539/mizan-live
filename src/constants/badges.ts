import { Flame, Moon, Book, Heart, Trophy, Target, Star, Medal } from 'lucide-react';

export const BADGES = [
  { id: '1', name: 'First Salat', desc: 'Logged your first prayer', icon: Moon, color: 'text-brand-gold' },
  { id: '2', name: 'Water Scholar', desc: 'Completed daily water goal', icon: Heart, color: 'text-blue-500' },
  { id: '3', name: 'Career Starter', desc: 'First task completed', icon: Target, color: 'text-brand-forest' },
  { id: '4', name: 'Knowledge Seeker', desc: 'Read a daily quote', icon: Book, color: 'text-indigo-500' },
  { id: '5', name: 'Streak 3', desc: '3 Day active streak', icon: Flame, color: 'text-orange-500' },
  { id: '6', name: 'Half Hero', desc: 'Reached 500 Mizan points', icon: Star, color: 'text-brand-gold' },
  { id: '7', name: 'Consistent', desc: 'Logged 7 days in a row', icon: Trophy, color: 'text-yellow-600' },
  { id: '8', name: 'Balanced', desc: 'Deen, Career, Health all 100%', icon: Medal, color: 'text-purple-500' },
];
