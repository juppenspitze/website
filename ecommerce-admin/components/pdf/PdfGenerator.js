import React from 'react';
import { pdf } from '@react-pdf/renderer';
import OrderInvoice from './Order/OrderInvoice'; 
import { getInvoiceNo, handleApiCall } from '@/lib/handlers';
import axios from 'axios';

export default async function generatePdf(order) {
  console.log("generatePdf", order);

  const {uniqueValue, invoiceNo, _id} = await getInvoiceNo();

  const blob = await pdf(<OrderInvoice order={order} invoiceNo={uniqueValue} />).toBlob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob); 
    reader.onloadend = async function() {
      const base64data = reader.result;  
      await handleApiCall(axios.put('/api/invoices', {invoiceNo: invoiceNo+1, _id}), 'updating invoice number', false); 
      resolve(base64data);
    }
    reader.onerror = reject;
  });
};