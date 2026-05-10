# 🎓 **Lesson 12: Chat Feature (Real-time)**

## 🎯 **Learning Objectives**

After completing this lesson, students will:

- Understand the concepts of **Real-time Communication**, WebSockets, and Client-Server interaction.
- Know how to **integrate Socket.IO** into Next.js (App Router) and the backend (Golang or Express).
- Build a **professional chat UI with ShadcnUI**.
- Display messages **instantly (Optimistic UI)** when sent.
- Update **typing indicators** and **read receipts**.

## 📝 **Detailed Content**

### 1. What is Real-time Chat?

> **Real-time Communication** is a way to transmit data between client and server almost instantaneously. Unlike HTTP requests (pull), real-time uses WebSockets (push) to **maintain a continuous connection** and update data continuously without page reloads.

👉 **Real-world scenarios:** Facebook Messenger, Zalo, Telegram – when one person sends a message, others receive it **immediately**.

### 2. Concept of WebSockets

> **WebSocket** is a network protocol that allows for a two-way connection between a client and a server, ideal for applications like chat, games, and notifications.

📌 Characteristics:

- Persistent connection (no need to resend requests).
- **Real-time** data transmission.
- Integrates well with Node.js, Express, or Golang backends.

### 3. Choosing a Library: Socket.IO

> **Socket.IO** is a popular library that supports WebSockets, provides fallbacks for older browsers, and simplifies real-time code.

📦 Client-side installation:

```bash
npm install socket.io-client
```

📦 Server-side (if using Express):

```bash
npm install socket.io
```

### 4. Designing the Chat UI with ShadcnUI

👉 Leverage components from ShadcnUI:

- `Input`, `Textarea`: for typing messages.
- `ScrollArea`: for scrolling through messages.
- `Avatar`, `Card`, `Badge`: for displaying senders and statuses.

Basic UI example:

```tsx
<Card className="h-[500px] w-full flex flex-col">
  <ScrollArea className="flex-1 p-4">...</ScrollArea>
  <div className="p-2 border-t flex gap-2">
    <Input className="flex-1" placeholder="Type a message..." />
    <Button>Send</Button>
  </div>
</Card>
```

### 5. Connecting with WebSockets

> Use `socket.io-client` within a **Client Component**.

```tsx
"use client";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:3001"); // backend server

export function useChatSocket() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on("message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, []);

  function sendMessage(msg: string) {
    socket.emit("message", msg);
    setMessages((prev) => [...prev, msg]); // Optimistic update
  }

  return { messages, sendMessage };
}
```

### 6. What is Optimistic UI?

> Displaying data immediately **before the server responds**, to create a "fast" and smooth feel.

📌 In chat: display the message as soon as it's sent, without waiting for server confirmation.

### 7. Typing Indicator

> When a user types, send a `"typing"` event via the socket; other clients receive it and display a notification.

```tsx
// When user types:
socket.emit("typing", true);

// Receiving from others:
socket.on("typing", (isTyping) => {
  setTypingStatus(isTyping ? "Typing..." : "");
});
```

### 8. Read Receipts

> Send a notification when a user **opens or views** the chat.

- Send a `"seen"` event when scrolling to the bottom or opening the tab.
- Update status to "Read at 14:32".

## 🏆 **Practice Exercise**

### Task

> Build a simple chat application including:
>
> - A UI with a chat box (message list + input form).
> - Real-time message sending and receiving.
> - Display "Typing..." when another user types.
> - Display the timestamp and sender information.

### Suggested Structure

- `/components/chat-ui.tsx`: Chat box UI.
- `/lib/socket.ts`: Socket initialization.
- `useChatSocket.ts`: Hook for sending/receiving logic.

### ✅ Detailed Solution

```tsx
"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const socket = io("http://localhost:3001");

export default function ChatRoom() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    socket.on("message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 1000);
    });
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("message", input);
    setMessages((prev) => [...prev, input]);
    setInput("");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="h-[300px] overflow-y-auto border p-2">
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
        {typing && (
          <div className="text-sm text-gray-400">Someone is typing...</div>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            socket.emit("typing");
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
```

## 🔑 **Key Points to Remember**

| ⚠️ Common Pitfalls                             | ✅ Solutions                                         |
| ---------------------------------------------- | ---------------------------------------------------- |
| Don't call `socket.emit` in a Server Component | Use `"use client"` to enable the browser environment |
| Forgetting to cleanup `socket.on()` on unmount | Use `socket.off()` if reusing hooks                  |
| Sending `typing` events too frequently         | Use debounce/throttle for optimization               |
| Not receiving new messages                     | Check if the server socket is emitting correctly     |

## 📝 **Homework**

### Task

> Extend the chat application:
>
> - Add a `Username` when sending messages.
> - Display the sent time (`HH:mm:ss`).
> - Save the last 10 messages using `localStorage` and reload them when opening the page.

📌 Hint:

- Use `useEffect` to load from `localStorage`.
- When sending a new message, update `localStorage`.
