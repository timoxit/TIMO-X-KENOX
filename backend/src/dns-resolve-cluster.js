const dns = require('dns');

async function run() {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  const host = 'cluster0.8nrlclu.mongodb.net';
  const srv = `_mongodb._tcp.${host}`;
  
  console.log(`Resolving SRV with Google DNS: ${srv}`);
  dns.resolveSrv(srv, (err, records) => {
    if (err) {
      console.error('FAILED to resolve SRV record:', err.message);
      return;
    }
    console.log('SUCCESS! Found SRV records:');
    records.forEach(r => console.log(`  - ${r.name}:${r.port}`));
  });

  console.log(`Resolving TXT with Google DNS: ${host}`);
  dns.resolveTxt(host, (err, records) => {
    if (err) {
      console.error('FAILED to resolve TXT record:', err.message);
      return;
    }
    console.log('SUCCESS! Found TXT records:');
    records.forEach(r => console.log(`  - ${r.join(' ')}`));
  });
}

run();


