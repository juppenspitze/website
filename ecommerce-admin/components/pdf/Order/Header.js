import React from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatDateMini } from '@/lib/date';

const url = 'https://ill-andi-ecommerce.s3.amazonaws.com/1704963094983.png';

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'column',
    marginBottom: 36,
    fontSize: 10,
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  logo: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 25,
    width: 250,
  },
  leftColumn: {
    flexDirection: 'column',
    marginRight: 'auto',
  },
  rightColumn: {
    gap: 5,
    flexDirection: 'column',
    marginLeft: 'auto',
  },
});

export default function Header ({ order, invoiceNo }) {
  return (
    <View style={styles.headerContainer}>
      <Image style={styles.logo} src={url} />
      <View style={styles.innerContainer}>
        <View style={{flexDirection: 'column'}}>
          <View style={styles.leftColumn}>
            <Text>{order.name}</Text>
            <Text style={{marginBottom: 5}}>{order.email}</Text>
            <Text>Address:</Text>
            <Text>{order.streetAddress},</Text>
            <Text>{order.city}, {order.postalCode}</Text>
          </View>
          {order.billStreetAddress ? (
            <View style={styles.leftColumn}>
              <Text style={{marginTop: 5}}>Billing address:</Text>
              <Text>{order.billStreetAddress},</Text>
              <Text>{order.billCity}, {order.billPostalCode}</Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.rightColumn}>
          <Text style={{marginLeft: 'auto'}}>Order Date: {formatDateMini(order.createdAt)}</Text>
          <Text style={{marginLeft: 'auto'}}>Invoice Number: {invoiceNo}</Text>
          <Text style={{marginLeft: 'auto'}}>Invoice creation Date: {formatDateMini(new Date())}</Text>
          <Text style={{marginLeft: 'auto'}}>Order Number: {order.orderNo}</Text>
          {order.paymentBrand && order.paymentLast4 ? (
            <View>
              <Text style={{marginLeft: 'auto'}}>Payment method:</Text>
              <View style={{flexDirection: 'row', marginLeft: 'auto'}}>
                <Image src={`/images/${order.paymentBrand}.png`} style={{width: 20, height: 20, marginRight: 5}} />
                <Text style={{marginRight: 5, marginTop: 5}}>**** **** ****</Text>
                <Text style={{marginTop: 5}}>{order.paymentLast4}</Text>
              </View>
            </View> 
          ) : null}
        </View>
      </View>
    </View>
  );
};
