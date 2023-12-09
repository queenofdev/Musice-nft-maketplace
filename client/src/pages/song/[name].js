import PublicProfile from '@/components/PublicProfile';
import CallToAction from '@/components/callToAction';
import Footer from '@/components/footer';
import Header from '@/components/header';
import { Song } from '@/components/song';
import Head from 'next/head';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '@/context/UserContext';

const SongPage = () => {
  const router = useRouter();
  const { state, getSingleNftData } = useContext(UserContext);
  const [song, setSong] = useState(null);
  useEffect(() => {
    if (getSingleNftData) {
      getSingleNftData(router.query.name);
    }
  },[]);
  useEffect(() => {
    if (state.singleNtfData) {
      setSong(state.singleNtfData);
    }
  },[state.singleNtfData]);
  return (
    <>
      <Head>
        <title>Mosh NFT - Song</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.svg' />
      </Head>
      <Header />
      <Song song = {song}/>
      <div className='mt-20'></div>
      <CallToAction />
      <Footer />
    </>
  );
};

export default SongPage;
