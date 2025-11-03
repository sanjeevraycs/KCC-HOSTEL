// src/components/ChatBot.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageSquare, X } from "lucide-react";
import { useAllStudents } from "../hooks/useStudents";

const DEFAULT_BEDS_PER_ROOM = 3;

type Student = {
  name: string;
  rollNumber: string;
  roomNumber: string;
  floorNumber: string;
  bedNumber: string;
  email?: string | null;
  phone?: string | null;
};

type Msg = { id: string; sender: "user" | "bot"; text: string };

export default function ChatBot() {
  const { data: studentsRaw } = useAllStudents() as { data?: Student[] } | undefined;
  const students: Student[] = Array.isArray(studentsRaw) ? studentsRaw : [];

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: String(Date.now()),
      sender: "bot",
      text:
        "Hi 👋 Ask me about students.\nExamples:\n• how many students?\n• room 101\n• floor 3\n• find Rahul\n• empty beds",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);

  const studentsByRoom = useMemo(() => {
    const map = new Map<string, Student[]>();
    students.forEach((s) => {
      if (!map.has(s.roomNumber)) map.set(s.roomNumber, []);
      map.get(s.roomNumber)!.push(s);
    });
    return map;
  }, [students]);

  const studentsByFloor = useMemo(() => {
    const map = new Map<string, Student[]>();
    students.forEach((s) => {
      if (!map.has(s.floorNumber)) map.set(s.floorNumber, []);
      map.get(s.floorNumber)!.push(s);
    });
    return map;
  }, [students]);

  const uniqueRooms = [...studentsByRoom.keys()];
  const uniqueFloors = [...studentsByFloor.keys()];

  const roomCapacity = useMemo(() => {
    const cap = new Map<string, number>();
    students.forEach((s) => {
      const r = s.roomNumber;
      const b = Number(s.bedNumber);
      const prev = cap.get(r) || 0;
      if (b > prev) cap.set(r, b);
    });
    uniqueRooms.forEach((r) => {
      if (!cap.has(r)) cap.set(r, DEFAULT_BEDS_PER_ROOM);
    });
    return cap;
  }, [students, uniqueRooms]);

  function addMessage(sender: "user" | "bot", text: string) {
    setMessages((m) => [...m, { id: String(Date.now()), sender, text }]);
  }

  function formatStudent(s: Student) {
    return `👤 ${s.name}
🎓 ${s.rollNumber}
🏠 Room ${s.roomNumber} | Floor ${s.floorNumber}
🛏 Bed ${s.bedNumber}`;
  }

  function handleQuery(q: string) {
    const text = q.toLowerCase().trim();

    if (text.includes("student")) {
      return `Total students: ${students.length}`;
    }
    const roomMatch = text.match(/room\s*(\d+)/);
    if (roomMatch) {
      const room = roomMatch[1];
      const list = studentsByRoom.get(room);
      if (!list?.length) return `No students in room ${room}`;
      return `Room ${room}:\n${list.map((s) => `${s.name} (Bed ${s.bedNumber})`).join("\n")}`;
    }
    const floorMatch = text.match(/floor\s*(\d+)/);
    if (floorMatch) {
      const fl = floorMatch[1];
      const list = studentsByFloor.get(fl);
      if (!list?.length) return `No students on floor ${fl}`;
      return `Floor ${fl}:\n${list.map((s) => s.name).join("\n")}`;
    }
    const rollMatch = text.match(/\b\d{4,}\b/);
    if (rollMatch) {
      const r = rollMatch[0];
      const s = students.find((x) => x.rollNumber === r);
      return s ? formatStudent(s) : `Roll ${r} not found`;
    }
    if (text.includes("empty") || text.includes("vacant")) {
      let total = 0, occ = 0;
      roomCapacity.forEach((cap, room) => {
        total += cap;
        occ += studentsByRoom.get(room)?.length || 0;
      });
      return `Empty beds: ${total - occ}`;
    }

    return "Sorry, I didn't understand. Try:\n• room 101\n• floor 2\n• empty beds\n• find Rahul";
  }

  async function sendMessage() {
    const q = input.trim();
    if (!q) return;
    addMessage("user", q);
    setInput("");
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 200));
    addMessage("bot", handleQuery(q));
    setIsProcessing(false);
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-20 right-5 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
        >
          <MessageSquare size={22} />
        </button>
      )}

      {/* Popup Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 bg-white border shadow-xl rounded-lg flex flex-col animation-slide-up">
          {/* Header */}
          <div className="p-2 bg-blue-600 text-white flex justify-between items-center">
            <span className="font-semibold">Smart Bot</span>
            <button onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>

          {/* Chat Area */}
          <Card className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] p-2 rounded-lg text-sm whitespace-pre-line ${
                  m.sender === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-gray-200"
                }`}
              >
                {m.text}
              </div>
            ))}
          </Card>

          {/* Input */}
          <div className="p-2 flex gap-2 border-t bg-white">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={isProcessing}>Send</Button>
          </div>
        </div>
      )}
    </>
  );
}
