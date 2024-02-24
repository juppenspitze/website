import { Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'grey',
    fontSize: 8,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 35,
    right: 40,
    color: 'grey',
  },
});

export default function Footer () {
  return (<>
    <View style={styles.footer} fixed >
      <View>
        <Text style={{color: 'black'}}>Juppenspitze Verlag Elisabeth Fritz KG, Hutterweg 2, 6020 Innsbruck</Text>
        <Text>www.juppenspitze.at     |    info@juppenspitze.at     |     +43 5514 3296</Text>
        <Text>Bankverbindung: IBAN AT12 0000 1111 2222 3333</Text>
      </View>
    </View>
    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (`${pageNumber} / ${totalPages}`)} />
  </>);
};