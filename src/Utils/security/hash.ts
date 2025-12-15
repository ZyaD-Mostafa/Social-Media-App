import bcrypt from "bcrypt";

export async function generateHash(
  plaintext: string,
  saltRound: number = Number(process.env.SALT)
): Promise<string> {
  return await bcrypt.hash(plaintext, saltRound);
}

export const compareHash = async ({
  plainText,
  hash,
}: {
  plainText: string;
  hash: string;
}): Promise<boolean> => {
  return await bcrypt.compare(plainText, hash);
};
