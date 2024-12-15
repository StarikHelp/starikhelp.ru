import * as static_private from '$env/static/private';

const ENV = Object.assign(import.meta.env, static_private);
/*
 ["BASE_URL","MODE","DEV","PROD","SSR","PRIVATE_SUPABASE_SERVICE_KEY","PRIVATE_SUPABASE_PG_URI","PRIVATE_JWT_SECRET","ASR_DURATION_LIMIT","npm_config_user_agent","ASR_DEVICE","NODE_VERSION","HOSTNAME","YARN_VERSION","npm_node_execpath","SHLVL","npm_config_noproxy","ASR_URI","HOME","npm_package_json","npm_config_userconfig","npm_config_local_prefix","npm_config_engine_strict","COLOR","npm_config_metrics_registry","npm_config_prefix","ASR_MODEL","npm_config_cache","npm_config_node_gyp","PATH","NODE","npm_package_name","npm_lifecycle_script","npm_package_version","npm_lifecycle_event","ASR_FORMAT","npm_config_globalconfig","npm_config_init_module","PWD","npm_execpath","ASR_LANGUAGE","ASR_TASK","npm_config_global_prefix","npm_command","NODE_ENV","INIT_CWD","EDITOR"]
*/

export default ENV;
