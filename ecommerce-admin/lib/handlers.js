
import axios from 'axios';
import { toast } from 'sonner';

export default function currencyForm(amount, currency) {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  });

  return currencyFormatter.format(amount);
};

export function getImageAspectRatio(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const aspectRatio = this.naturalWidth / this.naturalHeight;
      resolve(aspectRatio);
    };
    img.onerror = function () {
      reject(new Error("Failed to load image"));
    };
    img.src = src;
  });
};

export function base64ToBlob(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  };
  return new Blob([bytes], {type: 'application/pdf'});
};


export async function handleApiCall(apiCall, action, isShowSuccess=true) {
  try {
    let res;
    if (typeof apiCall === 'function') res = await apiCall();
    else res = await apiCall;
    
    if (!isShowSuccess) return res;
    toast.success('Success: '+action);
    return res;
  } catch (error) {
    toast.error(`Something went wrong while performing ${action}: ${error.message}`);
    throw error;
  }
};

export async function getInvoiceNo() {
  let res = await axios.get('/api/invoices');
  let data = res.data;
  console.log("getInvoiceNo", data);

  if (data.length === 0) {
    data = await handleApiCall(axios.post('/api/invoices', {invoiceNo: 1}), 'creating invoice', false);
    data = data.data;
  };

  let invoiceNo;
  if (data[0]?.invoiceNo) invoiceNo = parseInt(data[0].invoiceNo);
  else invoiceNo = parseInt(data.invoiceNo);

  let creationDate;
  if (data[0]?.invoiceNo) creationDate = new Date(data[0].createdAt);
  else if (data.invoiceNo) creationDate = new Date(data.createdAt);

  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  const year = String(date.getFullYear()).slice(-2);

  const uniqueValue = `N${String(invoiceNo).padStart(3, '0')}-${day}${month}${year}`;
  if (!uniqueValue) return;
  return {uniqueValue, invoiceNo, _id: data[0]?._id || data?._id};
};