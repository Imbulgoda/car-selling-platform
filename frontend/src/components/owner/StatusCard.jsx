import React from 'react';

const StatusCard = ({ label, val, icon }) => {
  
  const getColors = () => {
    const text = label.toLowerCase();
    if (text.includes('pending')) {
      return { border: 'border-[#BF5E14]', bg: 'bg-[#BF5E14]/10', icon: 'text-[#BF5E14]' };
    }
    if (text.includes('approved')) {
      return { border: 'border-[#008236]', bg: 'bg-[#008236]/10', icon: 'text-[#008236]' };
    }
    if (text.includes('rejected')) {
      return { border: 'border-[#E53E3E]', bg: 'bg-[#E53E3E]/10', icon: 'text-[#E53E3E]' };
    }
    // Default (Total Requests )
    return { border: 'border-[#0D3778]', bg: 'bg-[#0D3778]/10', icon: 'text-[#0D3778]' };
  };

  const styles = getColors();

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-md border-l-8 ${styles.border} flex items-center gap-5 transition-all hover:scale-[1.01] font-['Nunito']`}>
      
      {/* Icon Section */}
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${styles.bg} ${styles.icon}`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      
      {/* Text Section */}
      <div>
        <p className="text-xs font-bold text-[#0D3778] uppercase tracking-widest mb-1 font-['Nunito']">
          {label}
        </p>
        <h3 className="text-3xl font-black text-[#0D3778] leading-none">
          {val}
        </h3>
      </div>
    </div>
  );
};

export default StatusCard;