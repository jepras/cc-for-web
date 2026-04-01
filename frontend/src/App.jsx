import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

function App() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    fetch(`${API}/`)
      .then(r => r.json())
      .then(d => setStatus(`API online — ${d.time}`))
      .catch(() => setStatus('API offline'))
    loadMessages()
  }, [])

  function loadMessages() {
    fetch(`${API}/messages`)
      .then(r => r.json())
      .then(setMessages)
      .catch(() => {})
  }

  function sendMessage(e) {
    e.preventDefault()
    if (!text.trim()) return
    fetch(`${API}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(r => r.json())
      .then(msg => {
        setMessages(prev => [...prev, msg])
        setText('')
      })
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h1>FastAPI + React</h1>
      <p style={{ color: '#888', fontSize: 13 }}>{status}</p>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '8px 12px', fontSize: 15, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#646cff', color: '#fff', cursor: 'pointer', fontSize: 15 }}>
          Send
        </button>
      </form>

      {messages.length === 0 ? (
        <p style={{ color: '#aaa' }}>No messages yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {messages.map(m => (
            <li key={m.id} style={{ background: '#f4f4f4', borderRadius: 6, padding: '10px 14px', marginBottom: 8 }}>
              <span>{m.text}</span>
              <span style={{ float: 'right', fontSize: 11, color: '#aaa' }}>{new Date(m.time).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
