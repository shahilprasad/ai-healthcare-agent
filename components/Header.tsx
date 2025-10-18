
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-surface shadow-md h-16 flex items-center px-4 md:px-8 sticky top-0 z-10">
       <div className="flex items-center space-x-3">
         <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636L4.222 4.222m15.556 15.556l-1.414-1.414M4.222 19.778l1.414-1.414M19.778 4.222l-1.414 1.414"></path><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.5"></circle></svg>
        <h1 className="text-2xl font-bold text-on-surface">AI Healthcare Agent</h1>
       </div>
    </header>
  );
};

export default Header;
