"use client";

import { useEffect, useRef, useState } from "react";
import { TeamSribeLogo } from "./_components/teamscribe-logo";
import { Socket } from "socket.io-client";
import { JoinRoomForm } from "./_components/join-room-form";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Message, MessageProps } from "./_components/message";
import { UserAvatar } from "./_components/user-avatar";

export default function Home() {
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState<Socket>();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "newMessage",
      ({ name, message }: { name: string; message: string }) => {
        setMessages((prev) => [
          ...prev,
          { type: "user", name, content: message },
        ]);
      }
    );

    socket.on(
      "userJoined",
      ({
        name,
        instanceId,
        users,
      }: {
        name: string;
        instanceId: string;
        users: string[];
      }) => {
        setUsers(users);
        setMessages((prev) => [
          ...prev,
          { type: "system", name, action: "joined", instanceId },
        ]);
      }
    );

    socket.on("userLeft", ({ name }: { name: string }) => {
      setUsers((prev) => prev.filter((user) => user !== name));
      setMessages((prev) => [
        ...prev,
        { type: "system", name, action: "left" },
      ]);
    });

    return () => {
      socket.disconnect();
      setSocket(undefined);
    };
  }, [socket]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop === clientHeight;
      setShouldAutoScroll(isScrolledToBottom);
    }
  };

  if (!socket) {
    return (
      <div className="flex gap-8 flex-col w-full h-full items-center justify-center">
        <TeamSribeLogo />
        <JoinRoomForm
          setSocket={(socket: Socket) => setSocket(socket)}
          setRoom={(room: string) => setRoom(room)}
          className="max-w-64"
        />
      </div>
    );
  }

  function handleSubmit() {
    if (input) {
      console.log("sending message", input);
      socket?.emit("chatMessage", { message: input });
      setInput("");
    }
  }

  return (
    <div className="flex gap-5 pb-10 flex-col w-full h-full items-center justify-center">
      <TeamSribeLogo className="mt-5" />
      <div className="flex flex-col w-[85%] lg:w-[50%] gap-2 font-bold border border-black/40 rounded-md px-4 py-2 items-center justify-center">
        Users in this room ({users.length}) (Room ID: {room})
        <div className="flex flex-wrap gap-1 w-full">
          {users.map((user, i) => (
            <UserAvatar key={i} name={user} className="h-8" />
          ))}
        </div>
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-col p-4 gap-4 border border-black/40 rounded-md flex-1 w-[85%] lg:w-[50%] overflow-scroll"
      >
        {messages.map((message, i) => (
          <Message className="break-all mb-5" key={i} {...message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="w-[85%] lg:w-[50%] flex gap-2">
        <Input
          placeholder="Type your message..."
          className="border-black/40"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />

        <button
          disabled={!input}
          className="flex items-center justify-center bg-blue-500 min-w-8 min-h-8 aspect-square rounded-md disabled:opacity-50"
          onClick={handleSubmit}
        >
          <Send size={20} color={"white"} />
        </button>
      </div>
    </div>
  );
}
