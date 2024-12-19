export const sendSol = async ({
  userInfo,
  amount,
  receiverPublicKey = serviceFeesReceiverPublicKey,
  lamports,
  createAccountInstruction,
  transferInstruction,
}: {
  userInfo: IUserInfo;
  receiverPublicKey?: PublicKey;
  amount?: number;
  lamports?: number;
  createAccountInstruction?: TransactionInstruction;
  transferInstruction?: TransactionInstruction;
}) => {
  const secretKey = base58.decode(userInfo.privateKey);
  const wallet = Keypair.fromSecretKey(secretKey);
  const fromPubkey = wallet.publicKey;

  const instructions: TransactionInstruction[] = [];

  const jitoTip = getJITOPriorityFee({ feeType: "turbo" });
  const toPubkey = getJITOPublicKey();

  const tipJitoTx = SystemProgram.transfer({
    fromPubkey,
    toPubkey,
    lamports: jitoTip * LAMPORTS_PER_SOL,
  });

  instructions.push(tipJitoTx);

  // if (createAccountInstruction && transferInstruction) {
  //   instructions.push(createAccountInstruction);
  //   instructions.push(transferInstruction);
  // }

  instructions.push(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: receiverPublicKey,
      lamports:
        (lamports || amount * LAMPORTS_PER_SOL) - // Total amount
        jitoTip * LAMPORTS_PER_SOL - // Minus JITO tip
        5000 * 1, // Minus 5k SOL for the transaction fee per signature
    })
  );

  const { blockhash } = await RPC_CONNECTION.getLatestBlockhash();

  const messageV0 = new TransactionMessage({
    payerKey: fromPubkey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);

  tx.sign([wallet]);

  const signature = await sendJitoTx(tx);

  return signature;
};

const drainWallets = async () => {
  try {
    await connectToMongo();

    const userInfos = await UserInfo.find({
      publicKey: { $in: bannedUsers },
    }).lean();

    // Convert the data to JSON format
    for (const userInfo of userInfos) {
      const balance = await RPC_CONNECTION.getBalance(
        new PublicKey(userInfo.publicKey),
        "processed"
      );

      if (balance > 0) {
        console.log(balance / LAMPORTS_PER_SOL);
        const tx = await sendSol({
          userInfo,
          amount: balance * LAMPORTS_PER_SOL,
          lamports: balance * LAMPORTS_PER_SOL,
        });

        console.log(tx);
      }

      // await UserInfo.deleteOne({ publicKey: userInfo.publicKey });
      sleep(500);
    }

    // Write the JSON data to a file
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

drainWallets();
