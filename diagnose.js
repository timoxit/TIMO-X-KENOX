const dns = require('dns').promises;
const net = require('net');

const MONGODB_HOST = 'timo.jyvvuwz.mongodb.net';
const SRV_RECORD = `_mongodb._tcp.${MONGODB_HOST}`;

async function diagnose() {
  console.log('=== STARTING MONGODB CONNECTIVITY DIAGNOSIS ===\n');

  // 1. Check DNS Servers
  try {
    const servers = require('dns').getServers();
    console.log(`[DNS] System DNS Servers: ${servers.join(', ')}`);
  } catch (err) {
    console.error(`[DNS] Failed to get system DNS servers: ${err.message}`);
  }

  // 2. Resolve SRV record
  let srvRecords = [];
  try {
    console.log(`[DNS] Resolving SRV record: ${SRV_RECORD}...`);
    srvRecords = await dns.resolveSrv(SRV_RECORD);
    console.log(`[DNS] SUCCESS! Found ${srvRecords.length} MongoDB nodes:`);
    srvRecords.forEach(r => console.log(`  - Host: ${r.name}, Port: ${r.port}`));
  } catch (err) {
    console.error(`[DNS] FAILED to resolve SRV record: ${err.message}`);
    console.log('[DNS] Attempting fallback to resolve standard A record...');
    try {
      const aRecords = await dns.resolve4(MONGODB_HOST);
      console.log(`[DNS] Standard A record resolved to: ${aRecords.join(', ')}`);
    } catch (aErr) {
      console.error(`[DNS] FAILED to resolve standard A record: ${aErr.message}`);
    }
    console.log('\n=== DIAGNOSIS COMPLETE: DNS FAILURE ===');
    return;
  }

  // 3. Resolve Node Hostnames to IP Addresses
  const resolvedNodes = [];
  console.log('\n[DNS] Resolving node hostnames to IP addresses...');
  for (const record of srvRecords) {
    try {
      const ips = await dns.resolve4(record.name);
      console.log(`  - ${record.name} -> ${ips.join(', ')}`);
      resolvedNodes.push({ name: record.name, ip: ips[0], port: record.port });
    } catch (err) {
      console.error(`  - FAILED to resolve ${record.name}: ${err.message}`);
    }
  }

  if (resolvedNodes.length === 0) {
    console.error('\n[DNS] FAILED: Could not resolve any MongoDB node hostnames to IP addresses.');
    console.log('\n=== DIAGNOSIS COMPLETE: RESOLVE FAILURE ===');
    return;
  }

  // 4. Test TCP connection to Port 27017 for each node
  console.log('\n[TCP] Testing TCP connections to port 27017 of resolved nodes...');
  for (const node of resolvedNodes) {
    await new Promise((resolve) => {
      console.log(`[TCP] Connecting to ${node.ip}:${node.port} (Timeout: 5000ms)...`);
      const socket = new net.Socket();
      let finished = false;

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          console.error(`[TCP] FAILED: Connection to ${node.name} (${node.ip}:${node.port}) timed out.`);
          socket.destroy();
          resolve();
        }
      }, 5000);

      socket.connect(node.port, node.ip, () => {
        finished = true;
        clearTimeout(timer);
        console.log(`[TCP] SUCCESS! Successfully connected to ${node.name} (${node.ip}:${node.port})`);
        socket.end();
        resolve();
      });

      socket.on('error', (err) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          console.error(`[TCP] FAILED: Connection to ${node.name} (${node.ip}:${node.port}) failed with error: ${err.message}`);
          socket.destroy();
          resolve();
        }
      });
    });
  }

  console.log('\n=== DIAGNOSIS COMPLETE ===');
}

diagnose().catch(err => {
  console.error('Diagnostic wrapper error:', err);
});
