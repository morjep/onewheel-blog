// ALL EXPOSED ENVIRONMENT VARIABLES ARE AVAILABLE ON THE CLIENT!!!
// Use process.env to access environment variables that should only be available on the server.

import invariant from "tiny-invariant"

export function getEnv(){
    invariant(process.env.ADMIN_EMAIL, "ADMIN_EMAIL is not set")
    return {
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    }
}

type ENV = ReturnType<typeof getEnv>

declare global {
    var ENV: ENV;
    interface Window {
        ENV: ENV
    }
}