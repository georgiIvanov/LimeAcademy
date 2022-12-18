import { create, IPFSHTTPClient } from "ipfs-http-client";
import { useMemo } from "react";

const projectId = process.env.IPFS_PROJECT_ID;
const projectSecret = process.env.IPFS_API_KEY;
const authorization = 'Basic ' + Buffer.from(projectId + ":" + projectSecret).toString('base64');

export const useIpfs = (): IPFSHTTPClient => {
  return useMemo(() => {
      const ipfs = create({
        url: 'https://ipfs.infura.io:5001',
        headers: {
          authorization
        }
      });
      return ipfs;
  }, [authorization]);
};