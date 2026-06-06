const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>✕</button>
        {children}
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "420px",
};

const closeBtn = {
  float: "right",
  border: "none",
  background: "transparent",
  fontSize: "18px",
  cursor: "pointer",
};

export default Modal;
