brownie run deploy.py deploy unassignedSongTokenURI=ur1 vrfCoordinatorAddress=0x07865c6e87b9f70255377e024ace6630c1eaa37f usdcAddress=0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D trackPackTokenURI=uri2 maxTrackPackNFTs=10 trackPackPriceInUSDC=1000 numSongsPerTrackPack=5 keyHash=123 -i 
# brownie run deploy.py deploy unassignedSongTokenURI=ur1 vrfCoordinatorAddress=0x07865c6e87b9f70255377e024ace6630c1eaa37f usdcAddress=0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D trackPackTokenURI=uri2 maxTrackPackNFTs=10 trackPackPriceInUSDC=1000 numSongsPerTrackPack=5 -i --network mainnet-fork
# brownie run deploy.py deploy unassignedSongTokenURI=ur1 vrfCoordinatorAddress=0x07865c6e87b9f70255377e024ace6630c1eaa37f usdcAddress=0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D trackPackTokenURI=uri2 maxTrackPackNFTs=10 trackPackPriceInUSDC=1000 numSongsPerTrackPack=5 vrfSubscriptionId=2549 -i --network bsc-test