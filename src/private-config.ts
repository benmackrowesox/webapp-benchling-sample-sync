
export const benchlingConfig = {
  apiUrl: process.env.NEXT_PRIVATE_BENCHLING_API_URL || "https://api.benchling.com",
  apiKey: process.env.NEXT_PRIVATE_BENCHLING_API_KEY || "demo-benchling-key",
};



export const firebaseAdminConfig: any = {
  type: process.env.NEXT_PRIVATE_FIREBASE_ADMIN_TYPE || "service_account",
  project_id: process.env.NEXT_PRIVATE_FIREBASE_PROJECT_ID || "esoxbio-test",
  private_key_id: process.env.NEXT_PRIVATE_FIREBASE_PRIVATE_KEY_ID || "1ac153a0526e5fde68d06302236f4a70bc0d57b2",
  private_key: process.env.NEXT_PRIVATE_FIREBASE_PRIVATE_KEY
    ? process.env.NEXT_PRIVATE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGwvwZrljo9Qhb\nWo4LXvwN24J1hUbqpBrPx7ZW178JAjEzfK6FZ9SNng/fYxba277nx+NzfzoWV5Tp\n+x1FpWc+1W7iFrTKBmpi9dk4m1b3rD6jwxcU3iKe3WuFo01Qiw9v28wOiLY9Cd/x\nl0bS8VYZeLZFKhz0mVtlgvA2hMbnZQ54gSbfV1CEPdNzt7YAiCIV/0Wa828AJqox\ngUXoRnB/F86S8eSDEWRyHe76GQVnic+h8j9Tp4fXeNSHCaDabCghRvnuehrdDvhn\nkBa16a6OqJCtBuN1Lfw0nCZg/7qa0LPbwwfgecc2XZqSYzYFeqVaC9rZoe9nvJqQ\nZR4HvCobAgMBAAECggEAH/yzO6LOVjdQ7/rDz1qq78P629TmE87zLaszUgiIivea\nWXHgWEHceCoO3eGBhRlGQODvXuADxiK0KW+rR1EWK4uHu8TxtW2Q43ozSiPdvCAx\nOIOmDEqvgaearTgZsjOe+V6DGXew9GPJcYTp9fq244SEuN7NKCQiDFUlOXDm3cgh\nqWwsFnB5Kv3bmIIRhdS682zSo001lDsRUoKpWynjf98MNbH+gkBq9Xj2jgD2z62b\nFWtjkvTfxOYKttlCIhb/94hpp671EMpqDhA7c5AUPxYqt0qps4oRfFMLy0BhtiZn\nXj7X7DI27bSBuklbuecWwh4eF5ad+GkeFZAxKLBQ2QKBgQD6k9UQDhIEq7NhC/22\nAhgvKK85+dIzvIzEiuTyIwON1xdZtIiu6AeTVxNIvhh5FL1P13eVfNDcm0G6NeDH\nquXeBXOmPIb4aWh9SB+0/6bGSq3ADLJJhaMkozh6cnRxmSGTMeSS3VDPXbOfW4F/\nxx9J6zhxT9MyxZFfAOaUSrFhBwKBgQDLEBlyn++NP5mzLdhjXf3AxtKB7frJfTU5\n9XKOzhcnpNt84ohF4ukRgLIm4N8OjZODes5UibbtaDOFF/NN2qpVHYokMR8rrm0a\n3xxEAfQsLOk46cslvUF3XgQoP1FrwGm+qRZNturaMAJrSN2JaAM7jvDsGy50CMpA\ntsjRat5tTQKBgQDotOfW7CpBmi+RffBV2mYZTcBFqENVdtKIKLFsSaYgUNPHpEiX\nnraCWAh5ssjJkcAqaOEOvAbACZOl2ilxZL3rTcbUaDu0cTfvuU5w6kc4udvYkjH0\n453aBZcK6EZJxTuQFnK/DbfhjJSm9vUx9HuTS1Z0rPxnl2FlCFIa/67xewKBgD/T\n96vICgxkCXQA3Rue17xYwqKEo2fiK3DkbfXlYfHcKAHBUwRkps4Rne4KkRKJ/ew+\nFc0M3KsTLd6QALJgIVpPxrRJnHqmgTUJHGFkG9Qm6cgx9OEP9BwJOVVNUdKE0LhV\nfeU/seKTZK9EYB5oy1tVOvV8NcXTXX+p9MWeyfuhAoGAaw1ee0D720x2NoYt2e/1\nWJu7TCmTf9SuaxtqSz791awQ7fwgImyOfmv5oGX4zXLxDvOtYBJuQcLWsqGpwNzx\nhAPGP1PZ4/Qr/505e2hLysCNpx3t35gYrengVMkmjtRN87s2yGIsIno2EWhe4Y20\niX5YWsRdb/ytxxXhQ/yMv0g=\n-----END PRIVATE KEY-----\n",
  client_email: process.env.NEXT_PRIVATE_FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-gq8nv@esoxbio-test.iam.gserviceaccount.com",
  client_id: process.env.NEXT_PRIVATE_FIREBASE_CLIENT_ID || "102724856737008242859",
  auth_uri: process.env.NEXT_PRIVATE_FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.NEXT_PRIVATE_FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url:
    process.env.NEXT_PRIVATE_FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.NEXT_PRIVATE_FIREBASE_CLIENT_X509_CERT_URL || "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-gq8nv%40esoxbio-test.iam.gserviceaccount.com",
  universe_domain: process.env.NEXT_PRIVATE_FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
};
