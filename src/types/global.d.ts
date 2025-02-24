type TCredential = {
    uid: string;
    type: 'account' | 'keypair';
    credential: {
        host: string;
        privateKey: string;
        publicKey: string;
        website: string;
        username: string;
        password: string;
        twoFactor: boolean;
    };
};
