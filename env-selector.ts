import { config } from 'dotenv';

export default (function envSelector() {
  const enviromentPaths = {
    development: '.env.development',
    production: '.env',
  };
  config({ path: enviromentPaths[process.env.NODE_ENV] });
})();
