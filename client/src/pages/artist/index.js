import Artist from '@/components/Artist';
import NeverMissCTA from '@/components/NeverMissCTA';
import Footer from '@/components/footer';
import Header from '@/components/header';
import Head from 'next/head';
import React from 'react';

const ArtistPage = () => {
  return (
    <>
      <Head>
        <title>Mosh NFT - ARTIST </title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.svg' />
      </Head>
      <Header />
      <Artist />
      <div className='mt-28'></div>
      <NeverMissCTA />
      <Footer />
    </>
  );
};

export default ArtistPage;
