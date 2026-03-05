const { GoogleAuth } = require('google-auth-library');

async function main() {
    try {
        const auth = new GoogleAuth({
            scopes: ['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/sqlservice.login']
        });

        console.log("Acquiring client...");
        const client = await auth.getClient();
        console.log("Client acquired.");

        console.log("Acquiring project ID...");
        const projectId = await auth.getProjectId();
        console.log(`Project ID: ${projectId}`);

        console.log("Acquiring token...");
        const token = await client.getAccessToken();
        console.log("Token acquired successfully!");

    } catch (error) {
        console.error('Fatal Authentication Error:', error.message);
        console.error(error.stack);
    }
}

main().catch(console.error);
