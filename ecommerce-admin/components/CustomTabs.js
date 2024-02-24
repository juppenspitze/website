import React, { useState } from 'react';

export function CustomTab({ children }) {
  return <>{children}</>;
}

export function CustomTabs({ setSelectedLocale,children }) {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index,title) => {
    setActiveTab(index);
    if (!setSelectedLocale) return; 
    setSelectedLocale(title);
  };

  return (
    <div>
      <div className='flex gap-1 items-center mb-3 border-b-1 border-solid border-slate-600'>
        {React.Children.map(children, (child, index) => (<>
          <button 
            className={`px-3 py-1 mb-[-1px] border-b-2 border-solid ${index === activeTab ? 'text-primary font-semibold border-primary' : 'border-transparent'}`}
            key={index} 
            onClick={() => handleTabClick(index,child.props?.localeCode)}
          >
            {child.props.title}
          </button>
        </>))}
      </div>
      <div>
        {React.Children.map(children, (child, index) => (
          <div 
            className={`${index === activeTab ? 'block' : 'hidden'}`} 
            key={index}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}