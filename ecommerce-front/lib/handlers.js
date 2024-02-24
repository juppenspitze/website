import { Readable } from 'stream';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function returnSafePdfStream(buffer, order) {
  if (!buffer) return;
  const pdfDoc = await PDFDocument.load(buffer);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pages = pdfDoc.getPages();
  const nameAndEmail = `${order?.name} ${order?.email}`;
  for (const page of pages) {
    page.drawText(nameAndEmail, {
      x: 20,
      y: 20,
      size: 12,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  };
  const fullAdress = `${order?.streetAddress}, ${order?.city}`;
  for (const page of pages) {
    const { height } = page.getSize();
    page.drawText(fullAdress, {
      x: 20,
      y: height - 20,
      size: 12,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  
  const pdfBytes = await pdfDoc.save();

  const stream = new Readable();
  stream.push(pdfBytes);
  stream.push(null);

  return stream;
};

export function currencyForm(amount) {
  return currencyFormatter.format(amount);
};
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
});