import { Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  thanks: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 'auto',
  },
});

export default function Thanks() {
  return (
    <Text style={styles.thanks}>Thank you for choosing us!</Text>
  );
};