"use client";

import { io, Socket } from "socket.io-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type JoinRoomProps = {
  setSocket: (socket: Socket) => void;
  setRoom: (room: string) => void;
  className?: string;
};

const joinRoomSchema = z.object({
  name: z.string().min(1).max(16),
  room: z.string().min(1).max(10),
});

export const JoinRoomForm = ({
  setSocket,
  setRoom,
  className,
}: JoinRoomProps) => {
  const form = useForm<z.infer<typeof joinRoomSchema>>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      name: "",
      room: "",
    },
  });

  function onSubmit(values: z.infer<typeof joinRoomSchema>) {
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL as string, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      setSocket(socket);
      setRoom(values.room);
      socket.emit("joinRoom", { name: values.name, room: values.room });
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-2 w-full", className)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="room"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Room ID" {...field} />
              </FormControl>
              <FormDescription>
                The room you want to connect to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex w-full items-center justify-center">
          <Button
            className="bg-blue-500 hover:bg-blue-600 font-bold mt-5"
            type="submit"
          >
            Join
          </Button>{" "}
        </div>
      </form>
    </Form>
  );
};
