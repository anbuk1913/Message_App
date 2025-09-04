import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';
const socket = io(SOCKET_SERVER_URL);

export default function Chat() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('room-1');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((m) => [...m, { ...data, from: 'other' }]);
    });

    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinRoom = () => {
    if (!username) return alert('Enter username first');
    socket.emit('join_room', roomId);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const payload = {
      roomId,
      message,
      sender: username,
      timestamp: Date.now()
    };
    setMessages((m) => [...m, { ...payload, from: 'me' }]);
    socket.emit('send_message', payload);
    setMessage('');
  };

  return (
    <div style={{ maxWidth: 720, margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2>Two-User Chat (Vite + Socket.IO)</h2>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />
        <input
          placeholder="Room id"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />
        <button onClick={joinRoom} style={{ padding: '8px 12px' }}>
          Join Room
        </button>
      </div>

      <div style={{ border: '1px solid #ddd', height: 360, padding: 12, overflowY: 'auto', background: '#f9f9f9' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8, textAlign: m.from === 'me' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: 12,
              background: m.from === 'me' ? '#0b93f6' : '#ddd',
              color: m.from === 'me' ? '#fff' : '#000',
              maxWidth: '80%'
            }}>
              <div style={{ fontSize: 12, opacity: 0.9 }}>{m.sender}</div>
              <div>{m.message}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', marginTop: 12 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} style={{ padding: '8px 12px' }}>Send</button>
      </div>
    </div>
  );
}
