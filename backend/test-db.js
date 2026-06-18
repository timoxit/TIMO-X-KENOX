const mongoose = require('mongoose');
const uri = 'mongodb+srv://TIMOXITER:TimoSafePass2026@timo.jyvvuwz.mongodb.net/timoxiter?retryWrites=true&w=majority';

console.log('DNS servers:', dns.getServers());
console.log('Connecting to MongoDB...');
mongoose.connect(uri)
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection failed with error:');
    console.error(err);
    process.exit(1);
  });
