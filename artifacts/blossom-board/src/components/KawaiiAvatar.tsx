function AliceFace() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Pink background */}
      <circle cx="20" cy="20" r="20" fill="#F48FB1" />
      {/* Hair — back layer */}
      <ellipse cx="20" cy="29" rx="13" ry="12" fill="#3D1828" />
      {/* Hair — top cap */}
      <ellipse cx="20" cy="12" rx="12" ry="8.5" fill="#3D1828" />
      {/* Hair — side pieces */}
      <rect x="5.5" y="19" width="6.5" height="13" rx="3" fill="#3D1828" />
      <rect x="28" y="19" width="6.5" height="13" rx="3" fill="#3D1828" />
      {/* Face */}
      <ellipse cx="20" cy="22.5" rx="10.5" ry="11" fill="#FFDAB9" />
      {/* Eyebrows */}
      <path d="M13.5 17.5 Q15.5 16.2 17.5 17.2" stroke="#3D1828" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M22.5 17.2 Q24.5 16.2 26.5 17.5" stroke="#3D1828" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      {/* Eyes — whites */}
      <ellipse cx="15.5" cy="20.5" rx="2.6" ry="3" fill="white" />
      <ellipse cx="24.5" cy="20.5" rx="2.6" ry="3" fill="white" />
      {/* Irises */}
      <ellipse cx="15.5" cy="21" rx="1.9" ry="2.2" fill="#2D1020" />
      <ellipse cx="24.5" cy="21" rx="1.9" ry="2.2" fill="#2D1020" />
      {/* Eye shine */}
      <circle cx="16.2" cy="20" r="0.75" fill="white" />
      <circle cx="25.2" cy="20" r="0.75" fill="white" />
      {/* Blush */}
      <ellipse cx="11.5" cy="24" rx="3" ry="1.8" fill="#FF80AB" opacity="0.4" />
      <ellipse cx="28.5" cy="24" rx="3" ry="1.8" fill="#FF80AB" opacity="0.4" />
      {/* Nose */}
      <circle cx="20" cy="24.5" r="0.85" fill="#E8A090" />
      {/* Smile */}
      <path d="M16.5 27 Q20 30 23.5 27" stroke="#C2185B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Hair bow */}
      <polygon points="13,8 16.5,11.5 13,15" fill="#FF4081" />
      <polygon points="20,8 16.5,11.5 20,15" fill="#FF4081" />
      <circle cx="16.5" cy="11.5" r="2" fill="#E91E8C" />
    </svg>
  );
}

function BobFace() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Purple background */}
      <circle cx="20" cy="20" r="20" fill="#CE93D8" />
      {/* Short hair — top only */}
      <ellipse cx="20" cy="12" rx="12" ry="8" fill="#1A0A28" />
      {/* Slight side hair fade */}
      <rect x="6" y="15" width="5" height="8" rx="2.5" fill="#1A0A28" />
      <rect x="29" y="15" width="5" height="8" rx="2.5" fill="#1A0A28" />
      {/* Face — medium-brown skin */}
      <ellipse cx="20" cy="23" rx="11" ry="11.5" fill="#C68642" />
      {/* Eyebrows */}
      <path d="M13.5 18 Q15.5 17 17.5 17.8" stroke="#1A0A28" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M22.5 17.8 Q24.5 17 26.5 18" stroke="#1A0A28" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Eyes — whites */}
      <ellipse cx="15.5" cy="21" rx="2.6" ry="2.8" fill="white" />
      <ellipse cx="24.5" cy="21" rx="2.6" ry="2.8" fill="white" />
      {/* Irises */}
      <ellipse cx="15.5" cy="21.5" rx="1.9" ry="2.1" fill="#1A0A28" />
      <ellipse cx="24.5" cy="21.5" rx="1.9" ry="2.1" fill="#1A0A28" />
      {/* Eye shine */}
      <circle cx="16.2" cy="20.5" r="0.75" fill="white" />
      <circle cx="25.2" cy="20.5" r="0.75" fill="white" />
      {/* Glasses frames */}
      <rect x="11.5" y="18.5" width="8" height="5.5" rx="2.5" fill="none" stroke="#7B1FA2" strokeWidth="1.2" />
      <rect x="20.5" y="18.5" width="8" height="5.5" rx="2.5" fill="none" stroke="#7B1FA2" strokeWidth="1.2" />
      {/* Glasses bridge */}
      <line x1="19.5" y1="21" x2="20.5" y2="21" stroke="#7B1FA2" strokeWidth="1.2" />
      {/* Blush */}
      <ellipse cx="11.5" cy="25.5" rx="3" ry="1.8" fill="#CE93D8" opacity="0.5" />
      <ellipse cx="28.5" cy="25.5" rx="3" ry="1.8" fill="#CE93D8" opacity="0.5" />
      {/* Nose */}
      <circle cx="20" cy="25.5" r="0.9" fill="#B5733A" />
      {/* Smile */}
      <path d="M16.5 28 Q20 31 23.5 28" stroke="#6A3010" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Collar hint */}
      <path d="M12 38 Q20 33 28 38" fill="#7B1FA2" />
    </svg>
  );
}

function MayaFace() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Blue background */}
      <circle cx="20" cy="20" r="20" fill="#64B5F6" />
      {/* Long dark hair — back */}
      <ellipse cx="20" cy="30" rx="14" ry="11" fill="#0D1B2A" />
      {/* Hair top */}
      <ellipse cx="20" cy="11" rx="12.5" ry="8.5" fill="#0D1B2A" />
      {/* Side hair panels */}
      <rect x="5" y="18" width="6.5" height="16" rx="3" fill="#0D1B2A" />
      <rect x="28.5" y="18" width="6.5" height="16" rx="3" fill="#0D1B2A" />
      {/* Blue streak highlight in hair */}
      <ellipse cx="10" cy="22" rx="2" ry="7" fill="#1565C0" opacity="0.7" />
      {/* Face — warm light skin */}
      <ellipse cx="20" cy="22.5" rx="10.5" ry="11" fill="#FFE8C8" />
      {/* Eyebrows */}
      <path d="M13.5 17 Q15.5 15.8 17.5 16.8" stroke="#0D1B2A" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M22.5 16.8 Q24.5 15.8 26.5 17" stroke="#0D1B2A" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      {/* Eyes — whites */}
      <ellipse cx="15.5" cy="20.5" rx="2.7" ry="3" fill="white" />
      <ellipse cx="24.5" cy="20.5" rx="2.7" ry="3" fill="white" />
      {/* Irises — dark navy */}
      <ellipse cx="15.5" cy="21" rx="2" ry="2.3" fill="#1A237E" />
      <ellipse cx="24.5" cy="21" rx="2" ry="2.3" fill="#1A237E" />
      {/* Star sparkle pupils */}
      <text x="15.5" y="23" textAnchor="middle" fontSize="3.2" fill="white">★</text>
      <text x="24.5" y="23" textAnchor="middle" fontSize="3.2" fill="white">★</text>
      {/* Blush */}
      <ellipse cx="11.5" cy="24.5" rx="3" ry="1.8" fill="#F48FB1" opacity="0.45" />
      <ellipse cx="28.5" cy="24.5" rx="3" ry="1.8" fill="#F48FB1" opacity="0.45" />
      {/* Nose */}
      <circle cx="20" cy="24.5" r="0.8" fill="#E8A090" />
      {/* Smile */}
      <path d="M16.5 27 Q20 30 23.5 27" stroke="#1565C0" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Star hair clip */}
      <text x="28" y="12" fontSize="6" fill="#FFD700">★</text>
    </svg>
  );
}

function SamFace() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Green background */}
      <circle cx="20" cy="20" r="20" fill="#81C784" />
      {/* Curly hair — back/base */}
      <ellipse cx="20" cy="28" rx="14" ry="13" fill="#5D3A1A" />
      {/* Curly hair top — made of overlapping circles for curl effect */}
      <circle cx="11" cy="13" r="5.5" fill="#5D3A1A" />
      <circle cx="16" cy="10" r="5.5" fill="#5D3A1A" />
      <circle cx="22" cy="9.5" r="5.5" fill="#5D3A1A" />
      <circle cx="28" cy="12" r="5.5" fill="#5D3A1A" />
      {/* Smaller highlight curls for texture */}
      <circle cx="9" cy="16" r="4" fill="#6D4A2A" />
      <circle cx="31" cy="16" r="4" fill="#6D4A2A" />
      {/* Face — warm tan skin */}
      <ellipse cx="20" cy="23" rx="10.5" ry="10.5" fill="#E8B882" />
      {/* Eyebrows */}
      <path d="M13.5 18.5 Q15.5 17.5 17.5 18.2" stroke="#5D3A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M22.5 18.2 Q24.5 17.5 26.5 18.5" stroke="#5D3A1A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Eyes — whites */}
      <ellipse cx="15.5" cy="21.5" rx="2.6" ry="2.9" fill="white" />
      <ellipse cx="24.5" cy="21.5" rx="2.6" ry="2.9" fill="white" />
      {/* Irises — warm brown */}
      <ellipse cx="15.5" cy="22" rx="1.9" ry="2.1" fill="#3E2005" />
      <ellipse cx="24.5" cy="22" rx="1.9" ry="2.1" fill="#3E2005" />
      {/* Eye shine */}
      <circle cx="16.2" cy="21" r="0.75" fill="white" />
      <circle cx="25.2" cy="21" r="0.75" fill="white" />
      {/* Blush */}
      <ellipse cx="11.5" cy="25" rx="3" ry="1.8" fill="#EF9A9A" opacity="0.5" />
      <ellipse cx="28.5" cy="25" rx="3" ry="1.8" fill="#EF9A9A" opacity="0.5" />
      {/* Nose */}
      <circle cx="20" cy="25" r="0.9" fill="#C8956A" />
      {/* Wide warm smile */}
      <path d="M16 27.5 Q20 31.5 24 27.5" stroke="#6D4A2A" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* Green leaf/flower clip */}
      <ellipse cx="30" cy="11" rx="3" ry="5" fill="#388E3C" transform="rotate(30 30 11)" />
      <circle cx="30" cy="11" r="1.5" fill="#A5D6A7" />
    </svg>
  );
}

const FACES: Record<string, () => JSX.Element> = {
  AL: AliceFace,
  BJ: BobFace,
  MK: MayaFace,
  SR: SamFace,
};

const FALLBACK_COLORS: Record<string, string> = {
  AL: '#E91E8C',
  BJ: '#9C27B0',
  MK: '#2196F3',
  SR: '#4CAF50',
};

interface KawaiiAvatarProps {
  initials: string;
  name?: string;
  size?: number;
  showOnlineDot?: boolean;
  border?: boolean;
}

export default function KawaiiAvatar({ initials, name, size = 32, showOnlineDot = false, border = true }: KawaiiAvatarProps) {
  const Face = FACES[initials];
  return (
    <div
      title={name || initials}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: border ? '2px solid white' : 'none',
        boxShadow: border ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
        flexShrink: 0,
        cursor: 'default',
        position: 'relative',
      }}
    >
      {Face ? (
        <Face />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: FALLBACK_COLORS[initials] || '#E91E8C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.28, fontWeight: 800, color: 'white',
        }}>
          {initials}
        </div>
      )}
      {showOnlineDot && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: Math.max(7, size * 0.22), height: Math.max(7, size * 0.22),
          background: '#4CAF50', borderRadius: '50%',
          border: '2px solid white',
        }} />
      )}
    </div>
  );
}
