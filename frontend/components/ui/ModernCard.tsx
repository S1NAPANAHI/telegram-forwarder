import React, { ReactNode } from 'react';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'feature' | 'stats' | 'action';
  hover?: boolean;
  glow?: boolean;
}

const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  glow = false 
}) => {
  const baseClasses = `
    relative overflow-hidden rounded-2xl backdrop-blur-md
    border border-white/20 shadow-xl
    transition-all duration-500 ease-in-out
    ${hover ? 'hover:scale-105 hover:shadow-2xl' : ''}
    ${glow ? 'hover:shadow-blue-500/25' : ''}
  `;

  const variantClasses = {
    default: 'bg-gradient-to-br from-gray-900/50 to-gray-800/30',
    feature: 'bg-gradient-to-br from-blue-900/40 to-purple-900/30',
    stats: 'bg-gradient-to-br from-emerald-900/40 to-blue-900/30',
    action: 'bg-gradient-to-br from-orange-900/40 to-red-900/30'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Animated background accents */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-transparent to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default ModernCard;