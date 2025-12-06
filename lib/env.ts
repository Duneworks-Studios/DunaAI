// Utility to ensure environment variables are loaded
function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (value === undefined) {
    console.warn(`⚠️  Environment variable ${name} is not set`);
  } else {
    console.log(`✅ Loaded ${name} (${value?.substring(0, 3)}...)`);
  }
  return value || '';
}

// AI Providers
export const PREFERRED_AI_PROVIDER = getEnvVar('PREFERRED_AI_PROVIDER', 'groq');

// Groq Configuration
export const GROQ_API_KEY = getEnvVar('GROQ_API_KEY');
export const GROQ_MODEL = getEnvVar('GROQ_MODEL', 'llama-3.1-8b-instant');
export const GROQ_META_ADVANCED_MODEL = getEnvVar('GROQ_META_ADVANCED_MODEL', GROQ_MODEL);
export const GROQ_LUNA_MODEL = getEnvVar('GROQ_LUNA_MODEL', GROQ_MODEL);
export const GROQ_VISION_MODEL = getEnvVar('GROQ_VISION_MODEL', 'llava-v1.5-7b-4096-preview');

// Log loaded configuration
console.log('\n📋 AI Configuration:');
console.log(`- Provider: ${PREFERRED_AI_PROVIDER}`);
console.log(`- Groq Model: ${GROQ_MODEL}`);
console.log(`- Vision Model: ${GROQ_VISION_MODEL}\n`);
