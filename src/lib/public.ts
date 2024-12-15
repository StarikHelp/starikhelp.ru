import * as static_public from '$env/static/public';

const ENV = Object.assign(import.meta.env, static_public);
/*
["BASE_URL","MODE","DEV","PROD","SSR","PUBLIC_APP_NAME","PUBLIC_DEMO_MODE","PUBLIC_SUPABASE_URL","PUBLIC_SUPABASE_ANON_KEY"]
*/

export default ENV;
