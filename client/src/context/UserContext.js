import { createContext, useState } from "react";
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [state, setState] = useState({
    status: false,
    loading: false,
    error: false,
    errorMessage: null,
    modal: false,
    modalTitle: "",
    info: false,
    inofMessage: null,
    modalContent: <></>,
    nftMetaData: [],
    message: null,
    singleNftData: [],
    mixtapeOwnData: [],
    nftKeyData: {},
    user: true,
    leaderboard_list: [],
    clientSecret: null,
    userEthAddress: null,
    openedIds: [],
    address: '',
  });

  const setLoadingStatus = (loadingStatus) => {
    setState((state) => ({ ...state, loading: loadingStatus }));
  };

  const setAddress = (address) => {
    setState((state) => ({ ...state, address: address }));
  };

  const setInfoStatus = (info, message) => {
    setState((state) => ({ ...state, info: info, infoMessage: message }));
  };

  const setErrorStatus = (error, message) => {
    setState((state) => ({ ...state, error: error, errorMessage: message }));
  };

  const setModalStatus = (_modal, _modalTitle, _modalContent) => {
    setState((state) => ({
      ...state,
      modal: _modal,
      modalTitle: _modalTitle,
      modalContent: _modalContent,
    }));
  };

  const setPaymentStatus = (_clientSecret) => {
    setState((state) => ({ ...state, clientSecret: _clientSecret }));
  };
 
  const getNftData = async (pageNo) => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));

    if (userAuth && userAuth.idToken) {
      try {
        if (pageNo) {
          const response = await fetch(
            `${process.env.HOST_URL}/nft-metadata/many-NFT-metadata/?page=${pageNo}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${userAuth?.idToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          const responseData = await response.json();
          if (typeof responseData == "object") {
            setState((state) => ({
              ...state,
              loading: false,
              nftMetaData: responseData,
            }));
          } else {
            setState((state) => ({ ...state, loading: false }));
          }
        }
      } catch (error) {
        setErrorStatus(true, error);
        setState((state) => ({ ...state, loading: false }));
      }
    } else {
      setState((state) => ({ ...state, loading: false }));
    }
  };

  const getSingleNftData = async (docId) => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      if (docId) {
        const response = await fetch(
          `${process.env.HOST_URL}/nft-metadata/many-NFT-metadata/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userAuth?.idToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(docId),
          }
        );
        const responseData = await response.json();
        if (typeof responseData == "object") {
          setState((state) => ({
            ...state,
            loading: false,
            singleNftData: responseData,
          }));
        } else {
          throw "log in";
        }
      }
    } catch (error) {
      setState((state) => ({ ...state, loading: false }));
    }
  };

  const updateSingleNftData = () => {};

  const getMaxtapeNftData = async (docID) => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      if (docID) {
        const response = await fetch(
          `${process.env.HOST_URL}/nft-metadata/many-NFT-metadata/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userAuth?.idToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(docID),
          }
        );
        const responseData = await response.json();
        if (typeof responseData == "object") {
          setState((state) => ({
            ...state,
            loading: false,
            mixtapeOwnData: responseData,
          }));
        } else {
          throw "log in.";
        }
      }
    } catch (error) {
      setState((state) => ({ ...state, loading: false }));
    }
  };

  const addToNftRecord = async (nft_id, address) => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const response = await fetch(
        `${process.env.HOST_URL}/nft-records/add-nft-record/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userAuth?.idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nft_name: "TrackPackNFT",
            nft_id: nft_id,
            address: address,
          }),
        }
      );

      if (response.ok) {
        setState((state) => ({ ...state, loading: false }));
      } else {
        throw "Failed to add into ntf-record database.";
      }
    } catch (error) {
      setState((state) => ({ ...state, error: error, loading: false }));
    }
  };

  const updateNftRecordPrivate = async (song_nft_ids, trackpack_nft_id) => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const response = await fetch(
        `${process.env.HOST_URL}/update-nft-record-private/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userAuth?.idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            song_nft_ids: song_nft_ids,
            trackpack_nft_id: trackpack_nft_id,
          }),
        }
      );
      if (response.ok) {
        setState((state) => ({ ...state, loading: false }));
      } else {
        throw "Failed to update nft-record database by song_nft ids.";
      }
    } catch (error) {
      setState((state) => ({ ...state, error: error, loading: false }));
    }
  };

  const getOwnershipNft = async () => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const response = await fetch(
        `${process.env.HOST_URL}/nft-records/get-nft-ownership-data/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userAuth?.idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const responseData = await response.json();
      if (typeof responseData == "object" && response.ok) {
        setState((state) => ({
          ...state,
          loading: false,
          nftKeyData: responseData,
        }));
      } else {
        throw responseData;
      }
    } catch (error) {
      setState((state) => ({ ...state, loading: false, error: error }));
    }
  };

  const getTopUsers = async () => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const response = await fetch(`${process.env.HOST_URL}/leaderboard/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userAuth?.idToken}`,
          "Content-Type": "application/json",
        },
        redirect: "follow",
      });
      if (response.ok) {
        const responseData = await response.json();
        setState((state) => ({
          ...state,
          leaderboard_list: responseData,
          loading: false,
        }));
      } else {
        throw "Faile to get users for leaderboard page.";
      }
    } catch (error) {
      setState((state) => ({ ...state, error: error, loading: false }));
    }
  };

  const openNft = async (number_of_nft) => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const response = await fetch(`${process.env.HOST_URL}/open-nft/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userAuth?.idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number_of_nft: number_of_nft,
        }),
      });
      if (!response.ok) {
        throw "Faile to open TrackPackNFT.";
      } else {
        const responseData = await response.json();
      }
    } catch (error) {
      setState((state) => ({ ...state, error: error, loading: false }));
    }
  };

  const withdrawNft = async (number_of_nft, type_of_nft) => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const response = await fetch(`${process.env.HOST_URL}/withdraw/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userAuth?.idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nft_id: number_of_nft,
          nft_name: type_of_nft,
          nft_category: type_of_nft,
        }),
      });
      if (!response.ok) {
        throw "Faile to open TrackPackNFT.";
      } else {
        setModalStatus(true, "success!", "You withdrawed successfully!");
      }
    } catch (error) {
      setState((state) => ({ ...state, error: error, loading: false }));
    }
  };

  const userEthAddr = async (addr) => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const response = await fetch(`${process.env.HOST_URL}/userEthAddr/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userAuth?.idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eth_addr: addr,
        }),
      });
      if (!response.ok) {
        throw "Faile to open TrackPackNFT.";
      } else {
      }
    } catch (error) {
      setState((state) => ({ ...state, error: error, loading: false }));
    }
  };

  const getUserEthAddr = async () => {
    setState((state) => ({ ...state, loading: true }));
    const userAuth = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const response = await fetch(`${process.env.HOST_URL}/userEthAddr/`, {
        method: "get",
        headers: {
          Authorization: `Bearer ${userAuth?.idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw "User Eth does not exist.";
      } else {
        const responseData = await response.json();
        setState((state) => ({
          ...state,
          userEthAddress: responseData.eth_addr,
        }));
      }
    } catch (error) {
      setState((state) => ({ ...state, error: error, loading: false }));
    }
  };

  const createPaymentIntent = async (quentity) => {
    setState((state) => ({ ...state, loading: true }));
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
        const secret = await response.json();
        setState((state) => ({
          ...state,
          clientSecret: secret,
          loading: false,
        }));
      } else {
        throw "Failed to create payment intent.";
      }
    } catch (error) {
      setState((state) => ({ ...state, error: error, loading: false }));
    }
  };
  return (
    <UserContext.Provider
      value={{
        state,
        setLoadingStatus,
        setErrorStatus,
        setInfoStatus,
        setModalStatus,
        setPaymentStatus,
        getNftData,
        getSingleNftData,
        updateSingleNftData,
        getMaxtapeNftData,
        getOwnershipNft,
        getTopUsers,
        addToNftRecord,
        openNft,
        withdrawNft,
        getUserEthAddr,
        userEthAddr,
        updateNftRecordPrivate,
        createPaymentIntent,
        setAddress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
