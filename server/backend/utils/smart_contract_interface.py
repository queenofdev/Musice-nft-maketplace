import os
import json
from pathlib import Path
from datetime import date

from dotenv import load_dotenv
import logging
from web3 import Web3
from logger_setup import logger




load_dotenv()


class SmartContractInterface:
    def __init__(self):
        # Smart contract on Ganache
        self.nft_contract_address = "0x1A91924Cd660E2a8bD0d59d69e6f60314F339b24"
        self.owner_address = "0x273f4FCa831A7e154f8f979e1B06F4491Eb508B6"    
        self.chain_id = 1337
        self.w3Ganache= Web3(Web3.HTTPProvider("http://localhost:8545"))
        with open(
            "/home/ilija/code/meezer/smart-contracts/build/contracts/TrackPackNFT.json"
        ) as f:
            nftAbiJson = json.load(f)
            self.nftAbi = nftAbiJson["abi"]    
        self.nft_contract = self.w3Ganache.eth.contract(address=self.nft_contract_address, abi=self.nftAbi)

    def mint_nft(self, newTokenURI: str ) -> dict:
        """Mint NFT"""
        try:
            nonce = self.w3Ganache.eth.get_transaction_count(self.owner_address)
            stored_transaction = self.nft_contract.functions.createToken(
                newTokenURI
            ).buildTransaction(
                {"chainId": self.chain_id, "from": self.owner_address, "nonce": nonce}
            )
            private_key = os.environ.get("PRIVATE_KEY")
            signed_tx = self.w3Ganache.eth.account.sign_transaction(
                stored_transaction, private_key=private_key
            )
            transaction_hash = self.w3Ganache.eth.send_raw_transaction(
                signed_tx.rawTransaction
            )
            tx_receipt = self.w3Ganache.eth.wait_for_transaction_receipt(transaction_hash)
            logger.info(f"Minted NFT with createToken fun: {tx_receipt}")
        except Exception as e:
            logger.exception(f"Error while createToken fun call: {e}")


    def BurnNft(self):
        pass

    def ClaimRoyalties(self):
        pass
    
    # Test
    def Name(self):
        """Get NFT name"""
        try:
            name = self.nft_contract.functions.name().call()
            logger.info(f"Minted NFT with createToken fun: {name}")
            return name
        except Exception as e:
            logger.exception(f"Error while createToken fun call: {e}")
        



if __name__ == "__main__":
    smart_contract  = SmartContractInterface()
    # smart_contra.mint_nft("https://gateway.pinata.cloud/ipfs/QmXNpEUWjUuwuc6ZDgJrtYpjKY9GUb4VZU3iZT2GTAdadsa")
    name = smart_contract.Name()
    print(name)
