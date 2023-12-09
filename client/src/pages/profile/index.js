import NeverMissCTA from "@/components/NeverMissCTA";
import PublicProfile from "@/components/PublicProfile";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Head from "next/head";
import React, { useContext } from "react";
import Modal from "../../components/utils/elements/Modal";
import { UserContext } from "@/context/UserContext";

const ProfilePublicPage = () => {
  const { state } = useContext(UserContext);

  console.log("this is wallet state", state);
  return (
    <>
      <Head>
        <title>Mosh NFT - Profile</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Header />
      <PublicProfile />
      <div className="mt-20"></div>
      <NeverMissCTA />
      <Footer />
      <Modal
        modalVisible={state.address == '' && state.modal}
        modalTitle={"error"}
        modalContent={"You have to connect Wallet"}
      />
      <Modal
        modalVisible={state.modal}
        modalTitle={state.modalTitle}
        modalContent={state.modalContent}
      />
    </>
  );
};

export default ProfilePublicPage;