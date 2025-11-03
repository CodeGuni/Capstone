import 'dotenv/config';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  SASProtocol,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';

async function main() {
  const account = process.env.AZURE_STORAGE_ACCOUNT!;
  const key = process.env.AZURE_STORAGE_KEY!;
  const containerName = process.env.AZURE_CONTAINER!;
  console.log('env ok:', !!account, !!key, !!containerName);

  const creds = new StorageSharedKeyCredential(account, key);
  const svc = new BlobServiceClient(`https://${account}.blob.core.windows.net`, creds);
  const container = svc.getContainerClient(containerName);

  await container.createIfNotExists();
  console.log('container exists/created');

  const blobName = 'test.jpg';
  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date(Date.now() + 15 * 60 * 1000);
  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse('cw'),
      startsOn,
      expiresOn,
      protocol: SASProtocol.Https,
      contentType: 'image/jpeg',
    },
    creds,
  ).toString();

  console.log('OK: presign sample:', `https://${account}.blob.core.windows.net/${containerName}/${blobName}?${sas}`.slice(0, 120));
}

main().catch((e) => {
  console.error('TEST AZURE ERROR:', e?.details?.errorCode || e?.statusCode || e?.code, e?.message);
  process.exit(1);
});
