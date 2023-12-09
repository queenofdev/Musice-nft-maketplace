import React, { useContext, useEffect, useState, useCallback } from "react";
import ShareIcon from "@/icons/ShareIcon";
import ArtistTag from "./ArtistTag";
import MasterCardIcon from "@/icons/MasterCardIcon";
import VisaCardIcon from "@/icons/VisaCardIcon";
import AmericanPayIcon from "@/icons/AmericanPayIcon";
import VerifiedIcon from "@/icons/VerifiedIcon";
import USDCIcon from "@/icons/USDCIcon";
import MaticIcon from "@/icons/MaticIcon";
import { ethers } from "ethers";
import { UserContext } from "@/context/UserContext";
import Button from "../utils/elements/Button";
import track_pack from "./TrackPackNFT.json";
import mock_token from "./MockToken.json";
import song_nft from "./SongNFT.json";
import { router } from "next/router";
import {
  useAccount,
  useDisconnect,
  useConnect,
  useNetwork,
  useSwitchNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useContractEvent,
} from "wagmi";

const TrackDetails = () => {
  const {
    setLoadingStatus,
    setErrorStatus,
    setModalStatus,
    addToNftRecord,
    address,
    setAddress,
    updateNftRecordPrivate,
  } = useContext(UserContext);
  const [quentity, setQuentity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [byCrypto, setByCrypto] = useState(true);
  const [mintedTokenId, setMintedTokenId] = useState();

  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { isConnected, address: _address } = useAccount();
  const [startOpenNFT, setStartOpenNFT] = useState(false);
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  useEffect(() => {
    if (buying === true) {
      displayQuentityModal();
    }
  }, [quentity, buying]);

  const displayQuentityModal = () => {
    setModalStatus(
      true,
      "Quentity",
      <div className="flex flex-col">
        <div className="bg-slate-800 p-3 m-4 rounded-2xl">
          <input
            id="quentity-input"
            value={quentity}
            onChange={(e) => setQuentity(e.target.value)}
            type="number"
            min={1}
            placeholder="Quentity"
            className="text-slate-300 display-3 text-sm rounded-lg focus:ring-blue-500 shadow-inner focus:border-blue-500 block w-full p-2.5 bg-slate-700 border-none"
          />
        </div>
        <div className="grid grid-cols-2 m-4 p-3 bg-slate-800 rounded-2xl">
          <div className="pr-2 grid-span-1">
            <button
              type="button"
              className="text-white bg-blue-500  hover:bg-blue-800 rounded px-3 py-1 w-full "
              onClick={() => {
                if (byCrypto) {
                  handleBuyWithCrypto();
                } else {
                  handleBuyWithCreditCard();
                }
                setModalStatus(false, "", <></>);
                setBuying(false);
              }}
            >
              Ok
            </button>
          </div>
          <div className="pl-2 grid-span-1">
            <button
              type="button"
              className="text-slate-500 bg-white rounded px-3 py-1 w-full hover:bg-slate-300"
              onClick={() => {
                setModalStatus(false, "", <></>);
                setBuying(false);
                setQuentity(1);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const targetNetworkId = "0x13881";

  const SwitchNetwork = async (_chainId) => {
    const addNetwork = await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x13881",
          rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
          chainName: "Mumbai",
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        },
      ],
    });

    let chainId = _chainId;

    await window.ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }],
      })
      .then(() =>
        console.log("Successfully! Connected to the requested Network")
      )
      .catch((err) => {
        if (err.message.startsWith("Unrecognized chain ID")) {
          addNetwork();
        }
      });
  };

  const checkNetwork = async () => {
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (currentChainId == targetNetworkId) return true;
      return false;
    }
  };

  const tractPackContract = {
    address: track_pack.address,
    abi: track_pack.abi,
  };
  const mockContract = {
    address: mock_token.address,
    abi: mock_token.abi,
  };
  const { data: _decimals } = useContractRead({
    ...mockContract,
    functionName: "decimals",
  });
  const { data: _price } = useContractRead({
    ...tractPackContract,
    functionName: "NFTPriceInUSDC",
  });
  const { data: _allowance } = useContractRead({
    ...mockContract,
    functionName: "allowance",
    args: [_address, track_pack.address],
  });

  let usdt_amount = Number(_price) * quentity;

  const { config: mintConfig } = usePrepareContractWrite({
    ...tractPackContract,
    functionName: "mintTrackPackNFT",
    args: [quentity],
  });
  const { write: mintTrack } = useContractWrite(mintConfig);

  const { config: approveConfig } = usePrepareContractWrite({
    ...mockContract,
    functionName: "approve",
    args: [track_pack.address, usdt_amount],
  });
  const { isSuccess, write: mockApprove } = useContractWrite({
    ...approveConfig,
    onSuccess: () => {
      alert("success approve");
      mintTrack?.();
    },
  });

  const { config: openConfig } = usePrepareContractWrite({
    ...tractPackContract,
    functionName: "openTrackPackNFT",
    args: [mintedTokenId],
  });
  const { write: openTrack, isSuccess: OpenTrackSuccess } =
    useContractWrite(openConfig);

  useContractEvent({
    ...tractPackContract,
    eventName: "trackPackNFTMinted",
    listener(log) {
      setMintedTokenId(parseInt(log[0].args.id._hex, 16));

      setStartOpenNFT(true);
    },
  });

  useContractEvent({
    ...tractPackContract,
    eventName: "TrackPackOpened",
    listener(log) {},
  });

  // useEffect(() => {
  //   openTrack?.();
  // }, [startOpenNFT]);

  const handleBuyWithCrypto = async () => {
    // if (!isConnected)
    //   connect({connector :connectors[0]});
    // mockApprove?.();

    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        window.ethereum.on("disconnect", (error) => {
          console.log(error);
          return;
        });

        let is_chain = false;
        is_chain = await checkNetwork(targetNetworkId);

        if (!is_chain) {
          await SwitchNetwork();
        }
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        setAddress(signer);

        const TrackPackNFTContract = new ethers.Contract(
          track_pack.address,
          track_pack.abi,
          signer
        );

        const MockTokenContract = new ethers.Contract(
          mock_token.address,
          mock_token.abi,
          signer
        );

        TrackPackNFTContract.on("trackPackNFTMinted", async (to, id) => {
          const mintedTokenId = parseInt(id._hex, 16);
          await addToNftRecord(mintedTokenId + "", "private");
          await setLoadingStatus(true);
          await TrackPackNFTContract.openTrackPackNFT(mintedTokenId);
        });

        TrackPackNFTContract.on(
          "TrackPackOpened",
          async (from, tokenId, requestId, mintedIDs) => {
            const ids = [];
            for (let i = 0; i < mintedIDs.length; i++)
              ids.push(parseInt(mintedIDs[i]._hex) + "");
            const merged = ids.join(",");
            await updateNftRecordPrivate(
              merged,
              parseInt(tokenId._hex, 16) + ""
            );
            setLoadingStatus(false);
            setModalStatus(
              true,
              "Success!",
              <div className="p-5 pt-2">
                <p className="text-slate-500">
                  <strong>Congratulation!</strong>You bought the TrackPackNFT
                  successfully.
                </p>
                <div className="mt-4 flex justify-center items-center">
                  <button
                    type="button"
                    className="text-white bg-red-500 rounded px-3 py-1 hover:bg-red-800"
                    onClick={() => {
                      setModalStatus(false, "", <></>);
                      setBuying(false);
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            );
          }
        );
        let _decimal = await MockTokenContract.decimals();
        let _price = await TrackPackNFTContract.NFTPriceInUSDC();

        let usdt_amount = _price * quentity;

        await MockTokenContract.approve(track_pack.address, usdt_amount);

        await setLoadingStatus(true);
        setTimeout(async () => {
          await TrackPackNFTContract.mintTrackPackNFT(quentity);
          setQuentity(1);
        }, 2000);
      } catch (error) {
        setLoadingStatus(false);
        setErrorStatus(true, error.message);
      }
    } else {
      setErrorStatus(true, "Failed! Install the your wallet on browser.");
    }
  };

  const handleBuyWithCreditCard = async () => {
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const response = await fetch(
        `${process.env.HOST_URL}/create-payment-intent/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userAuth?.idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentMethodType: "card",
            currency: "usd",
            number_of_nfts: quentity,
          }),
        }
      );
      if (response.ok) {
        window.alert("You purchased NFT successfully.");
      } else {
        throw "Failed to buy nft with credit card.";
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="py-10 md:py-16">
      <span className="flex items-center uppercase text-MoshLight-1 font-open-sans">
        <span className="align-middle">SEASON #1</span>
        <VerifiedIcon className="ml-2" />
      </span>
      <div className="flex items-center">
        <h2 className="mb-2 sm:mb-1 text-3xl sm:!leading-relaxed sm:text-[42px] font-bold">
          Bad Apples
        </h2>
        <button className="ml-2.5">
          <ShareIcon />
        </button>
      </div>
      <div className="flex flex-wrap -mt-1.5 md:-mt-2 sm:items-center sm:flex-row">
        <span className="pr-2.5 font-bold text-sm mt-2 w-full sm:w-auto !leading-relaxed ">
          Artists in this TrackPack
        </span>
        <div>
          {"Phoebe Bridgers|Tame Impala|The National|Bon Iver|Mitski|Vampire Weekend|Fleet Foxes|Beach House|Sharon Van Etten|Sufjan Stevens"
            .split("|")
            .map((tag, index) => (
              <ArtistTag
                btnText={tag}
                key={index}
                className="mt-1.5 mr-1.5 md:mt-2 md:mr-2"
              />
            ))}
        </div>
      </div>
      <p className="text-MoshLight-1 font-open-sans mt-5 mb-7 !leading-[160%] ">
        The “Bad Apples” track pack features a random collection of 20 songs
        from some of your favorite Latin artists including Canserbero, Lochard
        Remy, Gilberto Santa Rosa and Orchestre Septentrional. Earn streaming
        revenue from every song in this collection.
      </p>
      <p className=" text-[#F5F5F5] !leading-normal mb-1 flex items-center flex-wrap ">
        <span className="font-medium text-[26px] pr-2">$25 USD</span>

        <small className="tracking-widest uppercase">
          • USDC or Polygon (MATIC)
        </small>
      </p>

      <div className="flex items-center text-sm">
        <p className="text-sm font-aril ">TrackPacks Available:</p>
        <span className="px-1.5 font-aril">•</span>
        <p className="text-sm font-aril">
          <strong>200 out of 2,500 remaining</strong>
        </p>
      </div>
      <div className="flex flex-col flex-wrap my-6 sm:flex-row">
        <Button
          className="justify-center px-4 py-3 bg-primary font-suisse-intl sm:justify-start"
          onClick={() => {
            displayQuentityModal();
            setByCrypto(true);
            setBuying(true);
          }}
        >
          <span className="flex items-center">
            <MaticIcon className="mr-3" /> <USDCIcon className="mr-3" />
          </span>
          Buy with Crypto
        </Button>
        <Button
          className="bg-white text-sweetDark py-3 px-4 sm:ml-2.5 mt-3 sm:mt-0  sm:justify-start justify-center"
          onClick={() => {
            displayQuentityModal();
            setByCrypto(false);
            setBuying(true);
          }}
        >
          <span className="flex items-center">
            <MasterCardIcon className="mr-[7px]" />
            <VisaCardIcon className="mr-[7px]" />
            <AmericanPayIcon />
          </span>
          <span className="pl-2.5">Buy with Credit Card</span>
        </Button>
      </div>
    </div>
  );
};

export default TrackDetails;
