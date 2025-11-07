
import { BlobServiceClient } from "@azure/storage-blob";

const account = process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT;
const sas = process.env.NEXT_PUBLIC_AZURE_BLOB_SAS_TOKEN;
const containerName = "thumbnails";

console.log("Azure Storage Account:", account);
console.log("Azure Blob SAS Token:",  sas ? "Present" : "Not Present");

if (!account || !containerName || !sas) {
  throw new Error("Azure Storage credentials are not set in environment variables.");
}

const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net?${sas}`
);

const containerClient = blobServiceClient.getContainerClient(containerName);

export const uploadFileToAzure = async (file: File) => {
  const blobName = `${new Date().getTime()}-${file.name}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(file);
  return blockBlobClient.url;
};
