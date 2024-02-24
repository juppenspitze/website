export function prettyDate(dateStr) {
  return (new Date(dateStr)).toLocaleString('sv-SE');
};

export function formatDateMini(date) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(date).toLocaleDateString('de-DE', options);
};

export function timeConverter(mongoTime){
  var a = new Date(Date.parse(mongoTime));
  // var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = a.getMonth();
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  if (month < 10) { month = '0'+month };
  if (date < 10) { date = '0'+date };
  if (hour < 10) { hour = '0'+hour };
  if (min < 10) { min = '0'+min };
  var time = year + '.' + month + '.' + date + ' ' + hour + ':' + min;
  return time;
}