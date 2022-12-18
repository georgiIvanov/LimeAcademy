// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
module.exports = () => {
  return {
    reactStrictMode: true,
    swcMinify: true,
    env: {
      IPFS_PROJECT_ID: process.env.IPFS_PROJECT_ID,
      IPFS_API_KEY: process.env.IPFS_API_KEY,
      MARKETPLACE_ADDRESS: process.env.MARKETPLACE_ADDRESS
    }
  }
}
