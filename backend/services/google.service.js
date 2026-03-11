import { OAuth2Client } from 'google-auth-library'

export const verifyIdTokenAndGetUser = async (idToken) => {
    const client = new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    })
    const userData = ticket.getPayload()
    return userData;
}