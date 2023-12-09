import { UserContext } from "@/context/UserContext";
import React, { useContext, useEffect, useState } from "react";
import Radio from "../utils/elements/Radio";
import WithdrawModal from "../utils/elements/WithdrawModal";
import OpenModal from "../utils/elements/OpenModal";
import track_pack from "../trackPack/TrackPackNFT.json";
import song_nft from "../trackPack/SongNFT.json";

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
  useContractReads,
} from "wagmi";

const OpenAndWithdraw = () => {
  const {
    state,
    setModalStatus,
    getOwnershipNft,
    openNft,
    userEthAddr,
    getUserEthAddr,
    withdrawNft,
    updateNftRecordPrivate,
    setErrorStatus,
  } = useContext(UserContext);
  const [openNftId, setOpenNftId] = useState(null);
  const [withdrawNftId, setWithdrawNftId] = useState(null);
  const [withdrawNftType, setWithdrawNftType] = useState(null);
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [track_nfts, setTrackNfts] = useState([]);
  const [song_nfts, setSongNfts] = useState([]);
  const [open_track_nfts, setOpenTrackNfts] = useState([]);

  const { connect, connectors } = useConnect();
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  const tractPackContract = {
    address: track_pack.address,
    abi: track_pack.abi,
  };

  const songContract = {
    address: song_nft.address,
    abi: song_nft.abi,
  };

  const { data: getUserTokenIDs } = useContractRead({
    ...tractPackContract,
    functionName: "getUserTokenIDs",
    args: [address],
  });

  const { data: getUserTokenURIsForSong } = useContractRead({
    ...songContract,
    functionName: "getUserTokenIDs",
    args: [address],
  });

  useEffect(() => {
    if (address !== '') {
      setTrackNfts(getUserTokenIDs);
      setSongNfts(getUserTokenURIsForSong);
    }
  }, []);

  const open = () => {
    async function startOpen() {
      if (openNftId !== null) {
        await openNft(openNftId);
        setModalStatus(true, "Success!", <div>You opened successfully!</div>);
      } else {
        setErrorStatus("Please select the Id.");
      }
    }
    startOpen();
  };

  const withdraw = () => {
    const startWithdraw = async () => {
      if (withdrawNftId !== null && withdrawNftType !== null) {
        if (state.address !== null) {
          withdrawNft(withdrawNftId, withdrawNftType);
        } else {
          await withdrawNft(withdrawNftId, withdrawNftType);
        }
        await getOwnershipNft();
      } else {
        setErrorStatus("Input the information correctly!");
      }
    };
    startWithdraw();
  };

  return (
    <div className="mosh-container-normal">
      <div className="flex justify-end ">
        <button
          type="button"
          className="rounded p-2 bg-orange-700 hover:bg-orange-500 mr-4"
          onClick={() => setOpenModalVisible(true)}
        >
          Open
        </button>
        <button
          type="button"
          className="rounded p-2 bg-orange-700 hover:bg-orange-500"
          onClick={() => setWithdrawModalVisible(true)}
        >
          Withdraw
        </button>
      </div>
      <WithdrawModal
        visible={withdrawModalVisible}
        setModalVisible={(v) => setWithdrawModalVisible(v)}
        title="Withdraw Modal"
      >
        <div className="p-2">
          <label>TrackPackNFT Ids:</label>
          <div className="grid grid-cols-2 mb-3">
            {track_nfts && track_nfts?.length !== 0 &&
              track_nfts.map((_id, index) => (
                <div
                  key={index}
                  className="cols-span-1 flex justify-start items-center"
                >
                  <Radio
                    name="withdraw_nft_id"
                    value={_id}
                    onClick={(v) => {
                      setWithdrawNftId(Number(v));
                      setWithdrawNftType("TrackPackNFT");
                    }}
                  />
                  <button className="ml-2">{Number(_id)}</button>
                </div>
              ))}
          </div>
          <label>SongNFT Ids:</label>
          <div className="grid grid-cols-2 mb-3">
            {song_nfts && song_nfts?.length !== 0 &&
              song_nfts.map((id, index) => (
                <div
                  key={index}
                  className="cols-span-1 flex justify-start items-center"
                >
                  <Radio
                    name="withdraw_nft_id"
                    value={id}
                    onClick={(v) => {
                      setWithdrawNftId(Number(v));
                      setWithdrawNftType("SongNFT");
                    }}
                  />
                  <button className="ml-2">{Number(id)}</button>
                </div>
              ))}
          </div>
          <button
            type="button"
            className="rounded p-2 bg-orange-700 hover:bg-orange-500 w-full text-white z-[10]"
            onClick={() => {
              withdraw();
              setWithdrawModalVisible(false);
            }}
          >
            Withdraw
          </button>
        </div>
      </WithdrawModal>
      <OpenModal
        visible={openModalVisible}
        setModalVisible={(v) => setOpenModalVisible(v)}
        title="Open TackNFT"
      >
        <div className="p-3">
          <label>TrackPackNFT Ids:</label>
          <div className="grid grid-cols-2 mb-3">
            {track_nfts && track_nfts?.length !== 0 &&
              track_nfts.map((_id, index) => (
                <div
                  key={index}
                  className="cols-span-1 flex justify-start items-center"
                >
                  <Radio
                    name="open_nft_id"
                    value={Number(_id)}
                    onClick={(v) => {
                      setOpenNftId(Number(v));
                    }}
                  />
                  <label className="ml-2">{Number(_id)}</label>
                </div>
              ))}
          </div>
          <button
            type="button"
            className="rounded p-2 bg-orange-700 hover:bg-orange-500 w-full text-white"
            onClick={() => {
              open();
              setOpenModalVisible(false);
            }}
          >
            Open
          </button>
        </div>
      </OpenModal>
    </div>
  );
};

export default OpenAndWithdraw;
