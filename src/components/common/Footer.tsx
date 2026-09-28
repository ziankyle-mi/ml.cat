import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-line py-8 px-4 text-center">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-2">
        <p className="text-xs text-mist font-normal">
          All rights reserved to the owners.
        </p>
      </div>
    </footer>
  );
};
