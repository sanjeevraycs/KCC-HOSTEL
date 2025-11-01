import { Student, Room, Floor } from '@/types';

// Generate mock students
export const generateMockStudents = (): Student[] => {
  const students: Student[] = [];
  let studentId = 1;

  for (let floor = 1; floor <= 8; floor++) {
    for (let room = 1; room <= 10; room++) {
      const roomNumber = `${floor}0${room}`;
      const capacity = room % 3 === 0 ? 3 : 2; // Mix of double and triple rooms

      for (let bed = 1; bed <= capacity; bed++) {
        students.push({
          id: `STU${studentId.toString().padStart(3, '0')}`,
          name: `Student ${studentId}`,
          rollNumber: `2024${studentId.toString().padStart(4, '0')}`,
          roomNumber,
          floorNumber: floor,
          bedNumber: bed,
        });
        studentId++;
      }
    }
  }

  return students;
};

export const mockStudents = generateMockStudents();

// Generate mock rooms
export const generateMockRooms = (): Room[] => {
  const rooms: Room[] = [];

  for (let floor = 1; floor <= 8; floor++) {
    for (let room = 1; room <= 10; room++) {
      const roomNumber = `${floor}0${room}`;
      const capacity = room % 3 === 0 ? 3 : 2;
      const bedType = capacity === 3 ? 'triple' : 'double';
      
      const roomStudents = mockStudents.filter(
        s => s.roomNumber === roomNumber && s.floorNumber === floor
      );

      rooms.push({
        roomNumber,
        floorNumber: floor,
        bedType,
        capacity,
        students: roomStudents,
      });
    }
  }

  return rooms;
};

export const mockRooms = generateMockRooms();

// Generate mock floors
export const generateMockFloors = (): Floor[] => {
  return Array.from({ length: 8 }, (_, i) => {
    const floorNumber = i + 1;
    const floorRooms = mockRooms.filter(r => r.floorNumber === floorNumber);
    const totalStudents = floorRooms.reduce((sum, room) => sum + room.students.length, 0);

    return {
      floorNumber,
      totalRooms: floorRooms.length,
      totalStudents,
      completedRooms: 0,
    };
  });
};

export const mockFloors = generateMockFloors();
