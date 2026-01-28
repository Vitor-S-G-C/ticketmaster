import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import io from 'socket.io-client';
import './style.css';

const socket = io('http://192.168.2.6:3001');

function App() {
  const [userType, setUserType] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [msg, setMsg] = useState('');
  const [tickets, setTickets] = useState([]);
  const [adminMessages, setAdminMessages] = useState({});
  const [ratingData, setRatingData] = useState({});

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  useEffect(() => {
    socket.on('ticketAssigned', setTicketId);
    socket.on('newTicket', t => {
      setTickets(prev => [...prev, t]);
      // Tocar som quando novo ticket chega (apenas para admin)
      if (userType === 'admin') {
        playNotificationSound();
      }
    });
    socket.on('updateTicket', t => setTickets(prev => prev.map(p => p.id === t.id ? t : p)));
  }, [userType]);

  const sendMessage = () => {
    if (msg.trim()) {
      socket.emit('sendMessage', { ticketId, message: msg, sender: 'user' });
      setMsg('');
    }
  };

  const sendAdminMessage = (ticketId) => {
    const message = adminMessages[ticketId];
    if (message && message.trim()) {
      socket.emit('sendMessage', { ticketId, message, sender: 'admin' });
      setAdminMessages({ ...adminMessages, [ticketId]: '' });
    }
  };

  const rateTicket = (ticketId) => {
    const data = ratingData[ticketId];
    if (data && data.rating) {
      socket.emit('rateTicket', { 
        ticketId, 
        rating: data.rating, 
        note: data.note || 'Atendimento finalizado' 
      });
      setRatingData({ ...ratingData, [ticketId]: {} });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Tela de Seleção de Perfil
  if (!userType) {
    return (
      <div className="container">
        <div className="profile-selector">
          <h1>🎫 Sistema de Tickets LAN</h1>
          <p>Bem-vindo! Selecione seu perfil para continuar:</p>
          <div className="profile-buttons">
            <button className="profile-btn" onClick={() => setUserType('user')}>
              👤 Usuário
            </button>
            <button className="profile-btn" onClick={() => setUserType('admin')}>
              👨‍💼 Administrador
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interface do Usuário
  if (userType === 'user') {
    return (
      <div className="container">
        <div className="header">
          <h1>🎫 Atendimento ao Usuário</h1>
          <button className="btn-logout" onClick={() => setUserType(null)}>Sair</button>
        </div>
        
        <div className="user-section">
          {!ticketId ? (
            <>
              <h2>Precisa de ajuda?</h2>
              <p style={{color: '#666', margin: '20px 0'}}>
                Clique no botão abaixo para solicitar um atendimento. 
                Você será atendido em breve!
              </p>
              <button className="btn-primary" onClick={() => socket.emit('requestTicket')}>
                📞 Solicitar Atendimento
              </button>
            </>
          ) : (
            <div className="ticket-info">
              <h2>🎟️ Seu Ticket: #{ticketId}</h2>
              <p className="status-active">● Atendimento ativo</p>
              
              <div className="chat-container">
                {tickets.find(t => t.id === ticketId)?.messages?.map((message, idx) => (
                  <div key={idx} className={`message ${message.sender === 'admin' ? 'message-admin' : 'message-user'}`}>
                    <div className="message-sender">
                      {message.sender === 'admin' ? '👨‍💼 Admin' : '👤 Você'}
                    </div>
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">{message.timestamp}</div>
                  </div>
                )) || <p style={{color: '#999'}}>Aguardando mensagens...</p>}
              </div>

              <div className="input-group">
                <input
                  type="text"
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                />
                <button className="btn-primary" onClick={sendMessage}>
                  Enviar 📤
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interface do Administrador
  return (
    <div className="container">
      <div className="header">
        <h1>👨‍💼 Painel Administrativo</h1>
        <button className="btn-logout" onClick={() => setUserType(null)}>Sair</button>
      </div>
      
      <div className="admin-section">
        <h2>📋 Tickets Ativos ({tickets.length})</h2>
        
        {tickets.length === 0 ? (
          <p style={{textAlign: 'center', color: '#999', padding: '40px'}}>
            Nenhum ticket no momento. Aguardando solicitações...
          </p>
        ) : (
          <div className="tickets-grid">
            {tickets.map(t => (
              <div key={t.id} className="ticket-card">
                <h3>🎟️ Ticket #{t.id}</h3>
                <p className={t.rating ? 'status-rated' : 'status-active'}>
                  {t.rating ? `✅ Avaliado (${t.rating}⭐)` : '● Em atendimento'}
                </p>
                
                <div className="ticket-messages">
                  {t.messages?.length > 0 ? (
                    t.messages.map((msg, idx) => (
                      <div key={idx} className={`ticket-message ${msg.sender === 'admin' ? 'message-admin' : 'message-user'}`}>
                        <div className="message-sender-small">
                          {msg.sender === 'admin' ? '👨‍💼' : '👤'} {msg.sender === 'admin' ? 'Admin' : 'Usuário'}
                        </div>
                        <div>{msg.text}</div>
                        <div className="message-time">{msg.timestamp}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{color: '#999', textAlign: 'center'}}>
                      Sem mensagens ainda
                    </p>
                  )}
                </div>

                {!t.rating && (
                  <div className="input-group" style={{marginTop: '15px'}}>
                    <input
                      type="text"
                      value={adminMessages[t.id] || ''}
                      onChange={e => setAdminMessages({...adminMessages, [t.id]: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && sendAdminMessage(t.id)}
                      placeholder="Responder ao usuário..."
                    />
                    <button className="btn-primary" onClick={() => sendAdminMessage(t.id)}>
                      Enviar 📤
                    </button>
                  </div>
                )}

                {!t.rating && (
                  <div className="rating-section">
                    <h4 style={{marginBottom: '10px'}}>Avaliar Atendimento:</h4>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={`star ${(ratingData[t.id]?.rating || 0) >= star ? 'star-filled' : ''}`}
                          onClick={() => setRatingData({
                            ...ratingData,
                            [t.id]: { ...ratingData[t.id], rating: star }
                          })}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <textarea
                      className="rating-textarea"
                      placeholder="Comentário sobre o atendimento (opcional)..."
                      value={ratingData[t.id]?.note || ''}
                      onChange={(e) => setRatingData({
                        ...ratingData,
                        [t.id]: { ...ratingData[t.id], note: e.target.value }
                      })}
                    />
                    <button
                      className="btn-rate"
                      onClick={() => rateTicket(t.id)}
                      disabled={!ratingData[t.id]?.rating}
                    >
                      ✅ Finalizar Atendimento
                    </button>
                  </div>
                )}

                {t.rating && (
                  <div style={{marginTop: '10px', padding: '10px', background: '#e8f5e9', borderRadius: '8px'}}>
                    <div style={{color: '#2e7d32', fontWeight: 'bold', marginBottom: '5px'}}>
                      ✅ Atendimento Finalizado
                    </div>
                    <div style={{color: '#ffa726'}}>
                      {'⭐'.repeat(t.rating)} ({t.rating}/5)
                    </div>
                    {t.note && (
                      <div style={{marginTop: '5px', color: '#666', fontSize: '0.9em'}}>
                        <strong>Comentário:</strong> {t.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
