import { BlobSASPermissions, BlobServiceClient, SASProtocol, generateBlobSASQueryParameters, StorageSharedKeyCredential } from '@azure/storage-blob';

const accountName = process.env.AZURE_STORAGE_ACCOUNT!;
const accountKey  = process.env.AZURE_STORAGE_KEY!;
export const containerName = process.env.AZURE_CONTAINER ?? 'guni';

const credential = new StorageSharedKeyCredential(accountName, accountKey);
export const blobService = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);

export async function createUploadSAS(key: string, contentType: string) {
  const expiresOn = new Date(Date.now() + 5 * 60 * 1000);
  const sas = generateBlobSASQueryParameters({
    containerName,
    blobName: key,
    permissions: BlobSASPermissions.parse('cw'), 
    startsOn: new Date(Date.now() - 60_000),
    expiresOn,
    protocol: SASProtocol.Https,
    contentType
  }, credential).toString();

  const url = `https://${accountName}.blob.core.windows.net/${containerName}/${key}?${sas}`;
  const publicUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${key}`;
  return { url, publicUrl, expiresOn };
}
