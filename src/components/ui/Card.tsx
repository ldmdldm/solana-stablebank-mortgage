import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', animated = false }) => {
  return (
    <div className={`card ${animated ? 'animated-border' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;