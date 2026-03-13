import { createRoot } from 'react-dom/client';

export function NotificationWindow() {
  const params = new URLSearchParams(window.location.search);
  const title = params.get('title') || 'Thông báo';
  const message = params.get('message') || '';
  const type = params.get('type') || 'info';

  let bgColor = '#FFFF00';
  if (type === 'error') bgColor = '#FF4444';
  if (type === 'success') bgColor = '#00FF66';

  return (
    <div 
      onClick={() => window.close()}
      style={{
        backgroundColor: bgColor,
        minHeight: '100vh',
        padding: '24px',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        color: '#000',
        boxSizing: 'border-box',
        border: '8px solid #000',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '3px solid #000',
        paddingBottom: '12px',
        marginBottom: '16px'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '22px', 
          textTransform: 'uppercase', 
          fontWeight: 900,
          letterSpacing: '1px'
        }}>
          {title}
        </h2>
      </div>
      <p style={{ 
        margin: 0, 
        fontSize: '16px', 
        fontWeight: 600, 
        lineHeight: '1.5' 
      }}>
        {message}
      </p>
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '16px',
        fontSize: '12px',
        fontWeight: 800,
        opacity: 0.5
      }}>
        CLICK ĐỂ ĐÓNG
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<NotificationWindow />);
