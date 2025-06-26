"use client";
import Image from "next/image";

interface UserMarkerProps {
  avatarUrl?: string;
  isCurrentUser?: boolean;
  onClick?: () => void;
}

export default function UserMarker({ avatarUrl, isCurrentUser, onClick }: UserMarkerProps) {
  const size = isCurrentUser ? 56 : 48;
  const getStyle = (isCurrentUser?: boolean): React.CSSProperties => ({
    borderRadius: '50%',
    border: isCurrentUser ? '4px solid #FFD600' : '3px solid #fff',
    boxShadow: '0 0 8px #0003',
    objectFit: 'cover',
    cursor: 'pointer',
    zIndex: isCurrentUser ? 2 : 1
  });
  return (
    <Image
      src={avatarUrl || '/default-avatar.png'}
      onClick={onClick}
      width={size}
      height={size}
      style={getStyle(isCurrentUser)}
      alt="User"
    />
  );
} 