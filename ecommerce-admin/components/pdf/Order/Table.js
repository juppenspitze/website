import currencyForm from '@/lib/handlers';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  orderNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 'auto',
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    borderBottomStyle: 'solid',
  },
  tableCol: {
    width: '15%',
  },
  tableColProductName: {
    width: '40%',
    fontSize: 10,
    marginLeft: 10,
  },
  tableCell: {
    margin: 'auto',
    fontSize: 10,
  },
});

export default function Table({ products, shipmentFee, vatTotal }) {
  const overallFee = products.reduce((acc, product) => acc + (product.price_data.unit_amount * product.quantity), 0) + (shipmentFee || 0);
  return (<>
    <View>
      <Text style={styles.orderNumber}>Ordered goods information:</Text>
    </View>
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={styles.tableColProductName}>
          <Text>Product Name</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.tableCell}>Amount</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.tableCell}>Single Price</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.tableCell}>VAT</Text>
        </View>
        <View style={styles.tableCol}>
          <Text style={styles.tableCell}>Overall Price</Text>
        </View>
      </View>
      {products.map((product, i) => (
        <View style={styles.tableRow} key={i}>
          <View style={styles.tableColProductName}>
            <Text style={{marginTop: 7}}>{product.price_data.product_data.name}</Text>
            <Text style={{marginBottom: 7, fontSize: 8, color: 'gray'}}>{product.price_data.product_data.metadata._id}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{product.quantity}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{currencyForm(product.price_data.unit_amount / 100)}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{product.price_data.product_data.metadata?.vatPercentage+'%' || 'N/A'}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{currencyForm((product.price_data.unit_amount * product.quantity) / 100)}</Text>
          </View>
        </View>
      ))}
    </View>
    <View style={{fontSize: 10, marginBottom: 5}}>
      <Text style={{marginLeft: 'auto', fontSize: 8}}>
        VAT total:
        <Text style={{marginLeft: 'auto'}}>{currencyForm(vatTotal || 0)}</Text>
      </Text>
    </View>
    <View style={{fontSize: 10, marginBottom: 10}}>
      <Text style={{marginLeft: 'auto', fontSize: 8}}>
        Shipment fee:
        <Text style={{marginLeft: 'auto'}}>{currencyForm(shipmentFee / 100 || 0)}</Text>
      </Text>
    </View>
    <View style={{fontSize: 12}}>
      <Text style={{marginLeft: 'auto', fontSize: 10}}>
        Overall fee:
        <Text style={{marginLeft: 'auto'}}>{currencyForm(overallFee / 100 || 0)}</Text>
      </Text>
    </View>
  </>);
};