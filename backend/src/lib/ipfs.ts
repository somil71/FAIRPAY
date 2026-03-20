import { Web3Storage, File } from "web3.storage";

export function getStorageClient() {
  return new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN || "" });
}

export async function uploadToIPFS(files: File[]) {
  const client = getStorageClient();
  const cid = await client.put(files);
  return cid;
}
