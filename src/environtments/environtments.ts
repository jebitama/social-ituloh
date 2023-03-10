import { config } from 'dotenv';

config();

const env = process.env;
export const environments = {
  port: Number(env.PORT || 3000),
  proxyEnabled: env.PROXY_ENABLED === 'true',
  dbType: env.DB_TYPE,
  dbPort: Number(env.DB_PORT || 5432),
  dbHost: env.DB_HOST,
  dbUser: env.DB_USERNAME,
  dbPass: env.DB_PASSWORD,
  dbName: env.DB_DATABASE,
  accessTokenSecret: env.ACCESS_TOKEN_SECRET,
  accessTokenExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN || '1d',
  googleAuthClientId: env.GOOGLE_AUTH_CLIENT_ID,
  googleAuthSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
  githubAuthClientId: env.GITHUB_AUTH_CLIENT_ID,
  githubAuthSecret: env.GITHUB_AUTH_CLIENT_SECRET,
};
