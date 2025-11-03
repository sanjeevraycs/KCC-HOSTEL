// This file previously contained mock data for testing
// All data is now fetched from Supabase database
// Keeping this file for backwards compatibility but all functions return empty arrays

import { Student, Room, Floor } from '@/types';

// No longer generating mock students - all data comes from Supabase
export const generateMockStudents = (): Student[] => {
  return [];
};

export const mockStudents: Student[] = [];

// No longer generating mock rooms - all data comes from Supabase
export const generateMockRooms = (): Room[] => {
  return [];
};

export const mockRooms: Room[] = [];

// No longer generating mock floors - all data comes from Supabase
export const generateMockFloors = (): Floor[] => {
  return [];
};

export const mockFloors: Floor[] = [];