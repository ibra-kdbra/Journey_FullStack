require('dotenv').config();
const axios = require('axios');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.PROJECT_ID;

const headers = {
  Authorization: `Bearer ${VERCEL_TOKEN}`,
};

// Documented Vercel deployment states: BUILDING, ERROR, INITIALIZING, QUEUED, READY, CANCELED.
const DELETABLE_STATES = ['ERROR', 'CANCELED'];

async function deleteFailedDeployments() {
  let next = null;
  let totalDeleted = 0;

  do {
    const res = await axios.get('https://api.vercel.com/v6/deployments', {
      headers,
      params: {
        projectId: PROJECT_ID,
        limit: 100,
        ...(next ? { until: next } : {})
      }
    });

    const deployments = res.data.deployments;
    for (const d of deployments) {
      if (DELETABLE_STATES.includes(d.state)) {
        console.log(`Deleting ${d.name} (${d.uid}) - ${d.state}`);
        await axios.delete(`https://api.vercel.com/v13/deployments/${d.uid}`, { headers });
        totalDeleted++;
      }
    }

    next = res.data.pagination?.next ?? null;
  } while (next);

  console.log(`✅ Deleted ${totalDeleted} error/canceled deployments.`);
}

deleteFailedDeployments().catch(console.error);
