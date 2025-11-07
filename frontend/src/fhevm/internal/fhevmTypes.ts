export interface FhevmRelayerSDKType {
  __initialized__?: boolean;
  initSDK: (options?: { debug?: boolean }) => Promise<boolean>;
  createInstance: (config: FhevmInstanceConfig) => Promise<FhevmInstance>;
  SepoliaConfig: {
    aclContractAddress: `0x${string}`;
    relayerUrl: string;
  };
}

export interface FhevmWindowType extends Window {
  relayerSDK: FhevmRelayerSDKType;
}

export interface FhevmInstanceConfig {
  relayerUrl: string;
  network: any;
  chainId: number;
  publicKey?: string;
  publicParams?: string;
}

export interface FhevmInstance {
  createEncryptedInput(
    contractAddress: `0x${string}`,
    userAddress: `0x${string}`
  ): EncryptedInput;
  decrypt(contractAddress: `0x${string}`, encrypted: `0x${string}`): Promise<string>;
  getPublicKey(): string;
  getPublicParams(bits?: number): string;
}

export interface EncryptedInput {
  add4(value: number): EncryptedInput;
  add8(value: number): EncryptedInput;
  add16(value: number): EncryptedInput;
  add32(value: number): EncryptedInput;
  add64(value: bigint | number): EncryptedInput;
  add128(value: bigint): EncryptedInput;
  add256(value: bigint): EncryptedInput;
  addAddress(value: string): EncryptedInput;
  addBytes64(value: Uint8Array): EncryptedInput;
  addBytes128(value: Uint8Array): EncryptedInput;
  addBytes256(value: Uint8Array): EncryptedInput;
  encrypt(): { handles: Uint8Array[]; inputProof: Uint8Array };
}

