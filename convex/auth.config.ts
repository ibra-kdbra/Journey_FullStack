// Convex validates the Kinde ID token sent by the client against this issuer.
// Set KINDE_ISSUER_URL and KINDE_CLIENT_ID in the Convex deployment's
// environment variables (dashboard -> Settings -> Environment Variables).
export default {
  providers: [
    {
      domain: process.env.KINDE_ISSUER_URL,
      applicationID: process.env.KINDE_CLIENT_ID,
    },
  ],
};
