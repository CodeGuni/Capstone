import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';

const account = process.env.AZURE_STORAGE_ACCOUNT!;
const accountKey = process.env.AZURE_STORAGE_KEY!;
const containerName = process.env.AZURE_CONTAINER!;

if (!account || !accountKey || !containerName) {
  throw new Error('Missing Azure env: AZURE_STORAGE_ACCOUNT / AZURE_STORAGE_KEY / AZURE_CONTAINER');
}

// creds + clients
const creds = new StorageSharedKeyCredential(account, accountKey);
const svc = new BlobServiceClient(`https://${account}.blob.core.windows.net`, creds);
const container = svc.getContainerClient(containerName);

export async function presignUpload(filename: string, contentType: string) {
  try {
    // ensure container exists 
    await container.createIfNotExists(); 

    const blob = container.getBlockBlobClient(filename);

    const startsOn = new Date(Date.now() - 5 * 60 * 1000);
    const expiresOn = new Date(Date.now() + 15 * 60 * 1000);

    // For upload 
    const permissions = BlobSASPermissions.parse('cw');

    const sas = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: filename,
        permissions,
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
        contentType, 
      },
      creds,
    ).toString();

    const url = `${blob.url}?${sas}`;

    return {
      url,
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': contentType,
      },
    };
  } catch (err: any) {
    // message to controller
    const code = err?.details?.errorCode || err?.statusCode || err?.code;
    const msg =
      err?.details?.message ||
      err?.message ||
      'Unknown Azure error';
    const hint = `AZURE ERROR (${code}): ${msg}`;
    const e: any = new Error(hint);
    e.original = err;
    throw e;
  }
}
