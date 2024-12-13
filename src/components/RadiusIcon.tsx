import React from 'react';

const RadiusIcon = () => {
  return (
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 bg-accent/10 rounded-full animate-pulse" />
      <div className="absolute inset-2 bg-accent/20 rounded-full animate-pulse delay-75" />
      <div className="absolute inset-4 bg-accent/30 rounded-full animate-pulse delay-150" />
    </div>
  );
};

export default RadiusIcon;