import React from 'react';
import { Page, Document, StyleSheet } from '@react-pdf/renderer';
import Footer from './Footer';
import Header from './Header';
import Table from './Table';
import Thanks from './Thanks';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 75,
  },
  header: {
    width: '100%',
    marginBottom: 36,
    fontSize: 14,
  },
});

export default function OrderInvoice ({ order, invoiceNo }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header style={styles.header} order={order} invoiceNo={invoiceNo} />

        <Table products={order.line_items} vatTotal={order?.vatFee} orderNo={order.orderNo} shipmentFee={order.shipmentFee} />
        <Thanks />

        <Footer fixed />
      </Page>
    </Document>
  );
};
