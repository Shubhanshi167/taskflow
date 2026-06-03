import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

const ICONS  = { success:"✓", error:"✕", warning:"⚠", info:"ℹ" };
const COLORS = {
  success: { bg:"rgba(16,185,129,0.12)",  border:"rgba(16,185,129,0.3)",  icon:"#10b981", bar:"#10b981" },
  error:   { bg:"rgba(244,63,94,0.12)",   border:"rgba(244,63,94,0.3)",   icon:"#f43f5e", bar:"#f43f5e" },
  warning: { bg:"rgba(245,158,11,0.12)",  border:"rgba(245,158,11,0.3)",  icon:"#f59e0b", bar:"#f59e0b" },
  info:    { bg:"rgba(59,130,246,0.12)",  border:"rgba(59,130,246,0.3)",  icon:"#3b82f6", bar:"#3b82f6" },
};

function Toast({ id, message, type="info", onDismiss }) {
  const c = COLORS[type];
  return (
    <div className="animate-fade-up" onClick={() => onDismiss(id)} style={{
      display:"flex", alignItems:"flex-start", gap:"12px",
      padding:"14px 16px",
      background:c.bg, border:`1px solid ${c.border}`,
      borderRadius:"var(--radius-lg)",
      backdropFilter:"blur(20px)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
      minWidth:"300px", maxWidth:"420px",
      position:"relative", overflow:"hidden",
      cursor:"pointer",
    }}>
      <div style={{
        width:"22px", height:"22px", borderRadius:"50%",
        background:`${c.icon}20`, border:`1px solid ${c.icon}40`,
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0, fontSize:"11px", fontWeight:800, color:c.icon,
      }}>{ICONS[type]}</div>
      <p style={{fontSize:"13px",fontFamily:"var(--font-body)",color:"var(--text-primary)",lineHeight:"1.5",flex:1}}>{message}</p>
      <button style={{background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",fontSize:"16px",lineHeight:1}}>×</button>
      <div style={{position:"absolute",bottom:0,left:0,height:"2px",width:"100%",background:c.bar,opacity:0.5}} />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);
  const dismiss = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);
  const toast = useCallback((message, type="info", duration=4000) => {
    const id = ++counter.current;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{position:"fixed",bottom:"24px",right:"24px",zIndex:9999,display:"flex",flexDirection:"column",gap:"10px"}}>
        {toasts.map(t => <Toast key={t.id} {...t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);