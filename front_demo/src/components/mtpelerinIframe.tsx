import React from 'react';

const MtPelerinIframe: React.FC = () => {
  return (
    <iframe 
      allow="usb; ethereum; clipboard-write"
      src="https://widget.mtpelerin.com/?lang=en&mode=dark&tabs=buy&type=web&bsc=EUR&bdc=agEUR&bsa=100&dnet=optimism_mainnet&pm=card"
      style={{ width: '100%', height: '500px', border: 'none' }}
      title="My Embedded Iframe"
    ></iframe>
  );
};

export default MtPelerinIframe;
